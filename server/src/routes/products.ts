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
// Routes - Public
// ============================================================================

// Get All Products
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

// ============================================================================
// Routes - Protected/Admin
// ============================================================================

// Create Product
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, description, price, stock, imageUrl, categoryId } = req.body;
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: stock ? parseInt(stock) : 0,
                imageUrl,
                categoryId: categoryId || null,
            },
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update Product
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, imageUrl, categoryId } = req.body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: stock !== undefined ? parseInt(stock) : undefined,
                imageUrl,
                categoryId: categoryId || null,
            },
        });

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete Product
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

// ============================================================================
// Export
// ============================================================================
export default router;
