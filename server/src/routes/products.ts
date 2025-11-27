import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// Get all products with filtering
router.get('/', async (req: Request, res: Response) => {
    try {
        const { search, minPrice, maxPrice, categoryId } = req.query;

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } }
            ];
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(String(minPrice));
            if (maxPrice) where.price.lte = parseFloat(String(maxPrice));
        }

        if (categoryId) {
            where.categoryId = String(categoryId);
        }

        const products = await prisma.product.findMany({
            where,
            include: { category: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Create product (Admin only - simplified for now)
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, description, price, imageUrl, categoryId } = req.body;
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                imageUrl,
                categoryId: categoryId || null,
            },
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, price, imageUrl } = req.body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: parseFloat(price),
                imageUrl
            },
        });

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id } });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

export default router;
