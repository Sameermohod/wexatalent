"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const developer_repository_1 = require("../repositories/developer.repository");
const auth_1 = require("../middleware/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const devRepo = new developer_repository_1.DeveloperRepository();
// Helper to extract optional auth token without throwing 401 (for checking bookmarks on public routes)
const optionalAuthenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production';
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = decoded;
        }
        catch (e) {
            // Ignore token validation failure and proceed as guest
        }
    }
    next();
};
// GET bookmarks list (must precede GET /:id)
router.get('/bookmarks', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const bookmarks = await devRepo.getBookmarks(userId);
        return res.json(bookmarks);
    }
    catch (error) {
        console.error('Fetch bookmarks error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// GET all developers (filtered)
router.get('/', async (req, res) => {
    try {
        const { query, skills, experienceMin, location, limit, skip } = req.query;
        const parsedSkills = skills ? skills.split(',').filter(Boolean) : undefined;
        const parsedExp = experienceMin ? parseInt(experienceMin, 10) : undefined;
        const parsedLimit = limit ? parseInt(limit, 10) : 20;
        const parsedSkip = skip ? parseInt(skip, 10) : 0;
        const developers = await devRepo.findAll({
            query: query,
            skills: parsedSkills,
            experienceMin: parsedExp,
            location: location,
            limit: parsedLimit,
            skip: parsedSkip,
        });
        return res.json(developers);
    }
    catch (error) {
        console.error('List developers error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// GET single developer profile
router.get('/:id', optionalAuthenticate, async (req, res) => {
    try {
        const currentUserId = req.user?.id;
        const dev = await devRepo.findById(req.params.id, currentUserId);
        if (!dev) {
            return res.status(404).json({ error: 'Developer not found' });
        }
        return res.json(dev);
    }
    catch (error) {
        console.error('Fetch developer error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// POST toggle bookmark status
router.post('/:id/bookmark', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const targetId = req.params.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        if (userId === targetId) {
            return res.status(400).json({ error: 'You cannot bookmark yourself' });
        }
        const bookmarked = await devRepo.toggleBookmark(userId, targetId);
        return res.json({ bookmarked });
    }
    catch (error) {
        console.error('Bookmark toggle error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
