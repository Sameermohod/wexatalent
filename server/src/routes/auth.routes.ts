import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { DeveloperRepository } from '../repositories/developer.repository';
import { generateToken } from '../utils/jwt';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const devRepo = new DeveloperRepository();

// Validation Schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().min(2, 'Role must be at least 2 characters'),
  experienceYears: z.number().min(0),
  location: z.string().min(2),
  hourlyRate: z.number().min(0).optional().default(50),
  bio: z.string().optional().default(''),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

// Register
router.post('/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if email already exists
    const existing = await devRepo.findByEmail(validatedData.email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const devId = `dev-${Date.now()}`;

    const devNode = await devRepo.create({
      ...validatedData,
      id: devId,
      password: hashedPassword,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60`, // placeholder
      githubUrl: 'https://github.com',
      linkedinUrl: 'https://linkedin.com',
      verified: false,
    });

    const token = generateToken(devNode.id);
    delete devNode.password;

    return res.status(201).json({ token, user: devNode });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const devNode = await devRepo.findByEmail(email);
    if (!devNode) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, devNode.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(devNode.id);
    delete devNode.password;

    return res.json({ token, user: devNode });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Profile Info
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await devRepo.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json(user);
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
