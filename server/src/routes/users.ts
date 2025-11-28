// ============================================================================
// Imports
// ============================================================================
import { Router, Request, Response } from 'express';
import { prisma } from '../index';

// ============================================================================
// Router Setup
// ============================================================================
const router = Router();

// ============================================================================
// Routes - User Profile - Get Me
// ============================================================================
router.get('/me', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['user-id'] as string;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                role: true,
                createdAt: true,
                profilePicture: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// ============================================================================
// Routes - User Profile - Update Me
// ============================================================================
router.put('/me', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['user-id'] as string;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { name, email, username, profilePicture } = req.body;

        // Validate username if provided
        if (username) {
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
            if (!usernameRegex.test(username)) {
                res.status(400).json({ error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' });
                return;
            }

            // Check if username is taken by another user
            const existingUser = await prisma.user.findFirst({
                where: {
                    username,
                    NOT: { id: userId }
                }
            });

            if (existingUser) {
                res.status(400).json({ error: 'Username already taken' });
                return;
            }
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { name, email, username, profilePicture },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                role: true,
                createdAt: true,
                profilePicture: true,
            },
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Password change route
router.put('/me/password', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['user-id'] as string;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password (in production, use bcrypt.compare)
        if (user.password !== currentPassword) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Update password (in production, hash with bcrypt)
        await prisma.user.update({
            where: { id: userId },
            data: { password: newPassword },
        });

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update password' });
    }
});

// Username check route
router.get('/check-username', async (req: Request, res: Response) => {
    try {
        const { username } = req.query;
        if (!username || typeof username !== 'string') {
            res.status(400).json({ error: 'Username is required' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { username }
        });

        res.json({ available: !user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check username' });
    }
});

// ============================================================================
// Routes - Admin Management - Get All Users
// ============================================================================
router.get('/', async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// ============================================================================
// Routes - Admin Management - Delete User
// ============================================================================
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ============================================================================
// Routes - Admin Management - Role Management
// ============================================================================
router.patch('/:id/role', async (req: Request, res: Response) => {
    try {
        const requesterId = req.headers['user-id'] as string;
        if (!requesterId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if requester is SUPERADMIN
        const requester = await prisma.user.findUnique({
            where: { id: requesterId },
            select: { role: true },
        });

        if (!requester || requester.role !== 'SUPERADMIN') {
            return res.status(403).json({ error: 'Only SUPERADMIN can change user roles' });
        }

        const { id } = req.params;
        const { role } = req.body;

        if (!['USER', 'ADMIN', 'SUPERADMIN'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// ============================================================================
// Export
// ============================================================================
export default router;
