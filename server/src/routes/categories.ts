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
// Routes - Get All Categories
// ============================================================================

router.get('/', async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// ============================================================================
// Routes - Create Category
// ============================================================================

router.post('/', async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const category = await prisma.category.create({
            data: { name },
        });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// ============================================================================
// Export
// ============================================================================

export default router;
