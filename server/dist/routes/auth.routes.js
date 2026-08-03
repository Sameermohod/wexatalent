"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const developer_repository_1 = require("../repositories/developer.repository");
const jwt_1 = require("../utils/jwt");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const devRepo = new developer_repository_1.DeveloperRepository();
// Validation Schemas
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    role: zod_1.z.string().min(2, 'Role must be at least 2 characters'),
    experienceYears: zod_1.z.number().min(0),
    location: zod_1.z.string().min(2),
    hourlyRate: zod_1.z.number().min(0).optional().default(50),
    bio: zod_1.z.string().optional().default(''),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string(),
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
        const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, 10);
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
        const token = (0, jwt_1.generateToken)(devNode.id);
        delete devNode.password;
        return res.status(201).json({ token, user: devNode });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
        const validPassword = await bcryptjs_1.default.compare(password, devNode.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = (0, jwt_1.generateToken)(devNode.id);
        delete devNode.password;
        return res.json({ token, user: devNode });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Get Profile Info
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await devRepo.findById(userId);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        return res.json(user);
    }
    catch (error) {
        console.error('Auth check error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
