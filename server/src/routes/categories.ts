import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// Get all categories
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

// Create category (Admin only)
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

export default router;
