// ============================================================================
// Imports
// ============================================================================
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// ============================================================================
// Router Setup
// ============================================================================
const router = Router();
const prisma = new PrismaClient();

// ============================================================================
// Routes - Create Order (Transaction Logic)
// ============================================================================

// Place an Order
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.headers['user-id'] as string;
        const { address, city, zipCode, country } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Get user's cart
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (!cart || cart.items.length === 0) {
            res.status(400).json({ error: 'Cart is empty' });
            return;
        }

        // Validate stock availability
        for (const item of cart.items) {
            if (item.product.stock < item.quantity) {
                res.status(400).json({
                    error: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}`
                });
                return;
            }
        }

        // Calculate total
        const total = cart.items.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);

        // Create order
        const order = await prisma.order.create({
            data: {
                userId,
                total,
                address,
                city,
                zipCode,
                country,
                items: {
                    create: cart.items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price
                    }))
                }
            },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        // Decrement stock for each product
        for (const item of cart.items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity
                    }
                }
            });
        }

        // Clear cart
        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id }
        });

        res.status(201).json(order);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// ============================================================================
// Routes - User History (Get My Orders)
// ============================================================================

// Get User's Order History
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.headers['user-id'] as string;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// ============================================================================
// Routes - Admin (Get All Orders, Update Status)
// ============================================================================

// Admin: Get All Orders
router.get('/all', async (req: Request, res: Response): Promise<void> => {
    try {
        // In a real app, verify admin role here
        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: { name: true, email: true }
                },
                items: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ error: 'Failed to fetch all orders' });
    }
});

// Admin: Update Order Status
router.put('/:id/status', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await prisma.order.update({
            where: { id },
            data: { status }
        });

        res.json(order);
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// ============================================================================
// Export
// ============================================================================
export default router;
