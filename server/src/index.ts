// ============================================================================
// Imports
// ============================================================================
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import userRoutes from './routes/users';
import uploadRoutes from './routes/upload';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import categoryRoutes from './routes/categories';
import adminRoutes from './routes/admin';
import reviewRoutes from './routes/reviews';

// ============================================================================
// Configuration
// ============================================================================
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// ============================================================================
// Middleware
// ============================================================================
app.use(cors());
app.use(express.json());

// ============================================================================
// API Routes
// ============================================================================

// Authentication routes (login, signup, password reset)
app.use('/api/auth', authRoutes);

// Product management routes
app.use('/api/products', productRoutes);

// User management routes
app.use('/api/users', userRoutes);

// File upload routes (image uploads)
app.use('/api/upload', uploadRoutes);

// Shopping cart routes
app.use('/api/cart', cartRoutes);

// Order management routes
app.use('/api/orders', orderRoutes);

// Category management routes
app.use('/api/categories', categoryRoutes);

// Admin-specific routes
app.use('/api/admin', adminRoutes);

// Product review routes
app.use('/api/reviews', reviewRoutes);

// ============================================================================
// Health Check
// ============================================================================
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// ============================================================================
// Server Start
// ============================================================================
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export { prisma };
