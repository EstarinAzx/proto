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
// Routes - Dashboard Stats
// ============================================================================

router.get('/stats', async (req: Request, res: Response) => {
    try {
        // Total counts
        const [totalUsers, totalProducts, totalOrders] = await Promise.all([
            prisma.user.count(),
            prisma.product.count(),
            prisma.order.count(),
        ]);

        // Revenue calculation (sum of all delivered orders)
        const revenueData = await prisma.order.aggregate({
            where: {
                status: 'DELIVERED',
            },
            _sum: {
                total: true,
            },
        });

        const totalRevenue = revenueData._sum.total || 0;

        // Recent orders for activity feed
        const recentOrders = await prisma.order.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        // Low stock products
        const lowStockProducts = await prisma.product.findMany({
            where: {
                stock: {
                    lte: 10,
                },
            },
            orderBy: {
                stock: 'asc',
            },
            take: 10,
        });

        // Order status breakdown
        const ordersByStatus = await prisma.order.groupBy({
            by: ['status'],
            _count: {
                status: true,
            },
        });

        res.json({
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue,
            },
            recentOrders,
            lowStockProducts,
            ordersByStatus,
        });
    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

// ============================================================================
// Export
// ============================================================================

export default router;
