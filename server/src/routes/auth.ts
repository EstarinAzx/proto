// ============================================================================
// Imports
// ============================================================================
import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ============================================================================
// Router Setup
// ============================================================================
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// ============================================================================
// Helper Functions
// ============================================================================
// Generate Access Token
const generateAccessToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

// Generate Refresh Token
const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// ============================================================================
// Routes - Register
// ============================================================================
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name, username } = req.body;

        if (!email || !password || !name || !username) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        // Validate username format (alphanumeric + underscore, 3-20 chars)
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            res.status(400).json({ error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' });
            return;
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                res.status(400).json({ error: 'Email already exists' });
            } else {
                res.status(400).json({ error: 'Username already taken' });
            }
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                username,
            },
        });

        const token = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Save refresh token
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        });

        res.json({
            token,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                username: user.username,
                role: user.role,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// Routes - Login
// ============================================================================
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        // Generate tokens
        const token = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Save refresh token
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        });

        res.json({
            token,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                username: user.username,
                role: user.role,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// Routes - Refresh Token
// ============================================================================
router.post('/refresh-token', async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ error: 'Refresh token required' });
            return;
        }

        const savedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true }
        });

        if (!savedToken || savedToken.expiresAt < new Date()) {
            res.status(401).json({ error: 'Invalid or expired refresh token' });
            return;
        }

        // Generate new access token
        const token = generateAccessToken(savedToken.userId);

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// Routes - Logout
// ============================================================================
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// Routes - Forgot Password
// ============================================================================
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Don't reveal user existence
            res.json({ message: 'If an account exists, a reset link has been sent.' });
            return;
        }

        // Generate reset token (random string)
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry }
        });

        // Log token to console (Mock Email Service)
        console.log('================================================');
        console.log(`PASSWORD RESET LINK FOR ${email}:`);
        console.log(`http://localhost:5173/reset-password?token=${resetToken}`);
        console.log('================================================');

        res.json({ message: 'If an account exists, a reset link has been sent.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// Routes - Reset Password
// ============================================================================
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, newPassword } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() }
            }
        });

        if (!user) {
            res.status(400).json({ error: 'Invalid or expired reset token' });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// Export
// ============================================================================
export default router;
