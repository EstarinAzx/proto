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
// Routes - Get Cart
// ============================================================================
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.headers['user-id'] as string;

        if (!userId) {
            res.status(401).json({ error: 'User ID required' });
            return;
        }

        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });

        // Create cart if it doesn't exist
        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });
        }

        res.json(cart);
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// ============================================================================
// Routes - Add Item
// ============================================================================
router.post('/add', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.headers['user-id'] as string;
        const { productId, quantity = 1 } = req.body;

        if (!userId || !productId) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Get or create cart
        let cart = await prisma.cart.findUnique({
            where: { userId }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId }
            });
        }

        // Check if item exists in cart
        const existingItem = await prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId
                }
            }
        });

        if (existingItem) {
            // Update quantity
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity }
            });
        } else {
            // Create new item
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity
                }
            });
        }

        // Return updated cart
        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: {
                items: {
                    include: {
                        product: true
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });

        res.json(updatedCart);
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

// ============================================================================
// Routes - Update Quantity
// ============================================================================
router.put('/item/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            await prisma.cartItem.delete({ where: { id } });
        } else {
            await prisma.cartItem.update({
                where: { id },
                data: { quantity }
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({ error: 'Failed to update cart item' });
    }
});

// ============================================================================
// Routes - Remove Item
// ============================================================================
router.delete('/item/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.cartItem.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Remove cart item error:', error);
        res.status(500).json({ error: 'Failed to remove cart item' });
    }
});

// ============================================================================
// Routes - Clear Cart
// ============================================================================
router.delete('/clear', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.headers['user-id'] as string;

        if (!userId) {
            res.status(401).json({ error: 'User ID required' });
            return;
        }

        const cart = await prisma.cart.findUnique({ where: { userId } });

        if (cart) {
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id }
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

// ============================================================================
// Export
// ============================================================================
export default router;
