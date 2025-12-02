# Backend Setup Guide (Express + TypeScript + Prisma)

This guide covers setting up an Express API server with TypeScript, authentication, and proper code organization.

## 🎯 Overview

We'll create a REST API with:
- Express.js for the server
- TypeScript for type safety
- Prisma for database access
- JWT for authentication
- Cloudinary for file uploads

---

## 📦 Step 1: Initialize Backend

```bash
cd server
npm init -y
```

---

## 📦 Step 2: Install Dependencies

### Production Dependencies
```bash
npm install express cors dotenv
npm install @prisma/client
npm install bcryptjs jsonwebtoken
npm install multer cloudinary
```

### Development Dependencies
```bash
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/bcryptjs @types/jsonwebtoken
npm install -D @types/multer tsx
```

---

## ⚙️ Step 3: Configure TypeScript

Create `server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

## 📝 Step 4: Update package.json Scripts

Edit `server/package.json`:
```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:studio": "prisma studio"
  }
}
```

---

## 🗂️ Step 5: Create Server Entry Point

Create `server/src/index.ts`:

```typescript
// ============================================================================
// Imports
// ============================================================================

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import orderRoutes from './routes/orders';
import uploadRoutes from './routes/upload';
import adminRoutes from './routes/admin';

// ============================================================================
// Configuration
// ============================================================================

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// Middleware
// ============================================================================

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// Routes
// ============================================================================

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================================
// Error Handling
// ============================================================================

app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
```

---

## 🔐 Step 6: Create Authentication Routes

Create `server/src/routes/auth.ts`:

```typescript
// ============================================================================
// Imports
// ============================================================================

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ============================================================================
// Types
// ============================================================================

interface SignupBody {
  email: string;
  password: string;
  name: string;
  username?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

// ============================================================================
// Routes - POST /api/auth/signup
// ============================================================================

router.post('/signup', async (req: Request<{}, {}, SignupBody>, res: Response) => {
  try {
    const { email, password, name, username } = req.body;

    // Validate input
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        username,
        role: 'USER',
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    //Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Return user data and tokens
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ============================================================================
// Routes - POST /api/auth/login
// ============================================================================

router.post('/login', async (req: Request<{}, {}, LoginBody>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Return user data and tokens
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        profilePicture: user.profilePicture,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// ============================================================================
// Routes - POST /api/auth/refresh-token
// ============================================================================

router.post('/refresh-token', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token required' });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    // Generate new access token
    const accessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// ============================================================================
// Routes - POST /api/auth/logout
// ============================================================================

router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Revoke refresh token
      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      }).catch(() => {
        // Token might not exist, ignore error
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// ============================================================================
// Export
// ============================================================================

export default router;
```

---

## 🛡️ Step 7: Create Database Client

Create `server/src/db.ts`:

```typescript
// ============================================================================  
// Database Client Configuration
// ============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export default prisma;
```

---

## 📦 Step 8: Create Other Route Files

Use the same pattern for other routes:

### `server/src/routes/products.ts`
```typescript
// ============================================================================
// Imports
// ============================================================================

import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

// ============================================================================
// Routes - GET /api/products
// ============================================================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, minPrice, maxPrice, category } = req.query;

    const products = await prisma.product.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { name: { contains: search as string, mode: 'insensitive' } },
              { description: { contains: search as string, mode: 'insensitive' } },
            ],
          } : {},
          minPrice ? { price: { gte: parseFloat(minPrice as string) } } : {},
          maxPrice ? { price: { lte: parseFloat(maxPrice as string) } } : {},
          category ? { categoryId: category as string } : {},
        ],
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ============================================================================
// Routes - POST /api/products (Admin only)
// ============================================================================

router.post('/', async (req: Request, res: Response) => {
  try {
    // TODO: Add auth middleware to check if user is ADMIN
    
    const { name, description, price, stock, imageUrl, categoryId } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        imageUrl,
        categoryId: categoryId || null,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// ============================================================================
// Export
// ============================================================================

export default router;
```

---

## 🔐 Step 9: Create Auth Middleware (Optional)

Create `server/src/middleware/auth.ts`:

```typescript
// ============================================================================
// Authentication Middleware
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

// ============================================================================
// Middleware - Verify JWT Token
// ============================================================================

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Optionally fetch user for role checking
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ============================================================================
// Middleware - Check Admin Role
// ============================================================================

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.userRole !== 'ADMIN' && req.userRole !== 'SUPERADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
```

---

## 🧪 Step 10: Test the API

Start the development server:
```bash
cd server
npm run dev
```

Test with curl or Postman:

```bash
# Health check
curl http://localhost:3000/health

# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🎯 Code Organization Best Practices

### Header Comment Pattern

```typescript
// ============================================================================
// Section Name
// ============================================================================
```

Use this for:
- Imports
- Types/Interfaces
- Helper Functions
- Routes
- Middleware
- Exports

### File Structure

Every route file should follow:
1. Imports
2. Router initialization
3. Types/Interfaces
4. Helper functions
5. Routes (one section per endpoint)
6. Export

---

## ✅ Verification Checklist

- [ ] Backend dependencies installed
- [ ] TypeScript configured
- [ ] Database client created
- [ ] Server entry point created
- [ ] Auth routes working
- [ ] Can signup a new user
- [ ] Can login and get tokens
- [ ] Refresh token works
- [ ] Logout revokes token

---

## 📚 Next Steps

Once your backend is set up:
→ **Continue to [Frontend Setup Guide](./05-frontend-setup.md)**
