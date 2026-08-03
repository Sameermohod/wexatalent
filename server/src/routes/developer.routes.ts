import { Router, Response } from 'express';
import { DeveloperRepository } from '../repositories/developer.repository';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import jwt from 'jsonwebtoken';

const router = Router();
const devRepo = new DeveloperRepository();

// Helper to extract optional auth token without throwing 401 (for checking bookmarks on public routes)
const optionalAuthenticate = (req: any, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production';
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      req.user = decoded;
    } catch (e) {
      // Ignore token validation failure and proceed as guest
    }
  }
  next();
};

// GET bookmarks list (must precede GET /:id)
router.get('/bookmarks', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const bookmarks = await devRepo.getBookmarks(userId);
    return res.json(bookmarks);
  } catch (error) {
    console.error('Fetch bookmarks error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all developers (filtered)
router.get('/', async (req, res) => {
  try {
    const { query, skills, experienceMin, location, limit, skip } = req.query;

    const parsedSkills = skills ? (skills as string).split(',').filter(Boolean) : undefined;
    const parsedExp = experienceMin ? parseInt(experienceMin as string, 10) : undefined;
    const parsedLimit = limit ? parseInt(limit as string, 10) : 20;
    const parsedSkip = skip ? parseInt(skip as string, 10) : 0;

    const developers = await devRepo.findAll({
      query: query as string,
      skills: parsedSkills,
      experienceMin: parsedExp,
      location: location as string,
      limit: parsedLimit,
      skip: parsedSkip,
    });

    return res.json(developers);
  } catch (error) {
    console.error('List developers error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single developer profile
router.get('/:id', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const dev = await devRepo.findById(req.params.id, currentUserId);
    if (!dev) {
      return res.status(404).json({ error: 'Developer not found' });
    }
    return res.json(dev);
  } catch (error) {
    console.error('Fetch developer error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST toggle bookmark status
router.post('/:id/bookmark', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const targetId = req.params.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (userId === targetId) {
      return res.status(400).json({ error: 'You cannot bookmark yourself' });
    }

    const bookmarked = await devRepo.toggleBookmark(userId, targetId);
    return res.json({ bookmarked });
  } catch (error) {
    console.error('Bookmark toggle error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
