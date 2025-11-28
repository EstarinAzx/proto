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
// Routes - Get Reviews
// ============================================================================

router.get('/:productId', async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;
        const { page = '1', limit = '10' } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: { productId },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum
            }),
            prisma.review.count({ where: { productId } })
        ]);

        // Calculate average rating
        const avgRating = await prisma.review.aggregate({
            where: { productId },
            _avg: { rating: true }
        });

        res.json({
            reviews,
            averageRating: avgRating._avg.rating || 0,
            totalReviews: total,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// ============================================================================
// Routes - Create Review
// ============================================================================

router.post('/:productId', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.headers['user-id'] as string;
        const { productId } = req.params;
        const { rating, comment } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!rating || rating < 1 || rating > 5) {
            res.status(400).json({ error: 'Rating must be between 1 and 5' });
            return;
        }

        // Check if review already exists
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId
                }
            }
        });

        let review;
        if (existingReview) {
            // Update existing review
            review = await prisma.review.update({
                where: { id: existingReview.id },
                data: {
                    rating: parseInt(rating),
                    comment: comment || null
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            });
        } else {
            // Create new review
            review = await prisma.review.create({
                data: {
                    userId,
                    productId,
                    rating: parseInt(rating),
                    comment: comment || null
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            });
        }

        res.json(review);
    } catch (error) {
        console.error('Create/Update review error:', error);
        res.status(500).json({ error: 'Failed to save review' });
    }
});

// ============================================================================
// Routes - Delete Review
// ============================================================================

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.headers['user-id'] as string;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Check if review exists and belongs to user
        const review = await prisma.review.findUnique({
            where: { id }
        });

        if (!review) {
            res.status(404).json({ error: 'Review not found' });
            return;
        }

        if (review.userId !== userId) {
            res.status(403).json({ error: 'Not authorized to delete this review' });
            return;
        }

        await prisma.review.delete({ where: { id } });
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

// ============================================================================
// Export
// ============================================================================

export default router;
