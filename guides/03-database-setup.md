# Database Setup Guide (Prisma with Neon/Supabase)

This guide walks through setting up Prisma ORM with either Neon or Supabase PostgreSQL databases.

## 🎯 What is Prisma?

Prisma is a next-generation ORM (Object-Relational Mapping) tool that:
- Provides type-safe database access
- Auto-generates TypeScript types from your schema
- Handles migrations
- Offers a powerful query API

---

## 📋 Option 1: Prisma with Neon (Recommended)

### Step 1: Create Neon Database

1. Go to [neon.tech](https://neon.tech/)
2. Sign in with GitHub
3. Click "Create Project"
4. Choose:
   - Project name: `my-ecommerce-db`
   - Region: Closest to your users
   - PostgreSQL version: 15 (default)
5. Click "Create Project"
6. Copy the connection string

**Connection String Format:**
```
postgresql://username:password@host/database?sslmode=require
```

---

### Step 2: Install Prisma

Navigate to your server directory:
```bash
cd server
npm install prisma @prisma/client
npm install -D tsx
```

---

### Step 3: Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Your database schema
- `.env` - Environment variables file

---

### Step 4: Configure Database Connection

Edit `server/.env`:
```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
```

Paste your Neon connection string here.

---

### Step 5: Create Database Schema

Edit `server/prisma/schema.prisma`:

```prisma
// ============================================================================
// Prisma Configuration
// ============================================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// Enums
// ============================================================================

enum Role {
  USER
  ADMIN
  SUPERADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

// ============================================================================
// Models
// ============================================================================

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  username        String?   @unique
  name            String
  password        String
  role            Role      @default(USER)
  profilePicture  String?
  
  // Password Reset
  resetToken      String?
  resetTokenExpiry DateTime?
  
  // Relations
  cart            Cart?
  orders          Order[]
  reviews         Review[]
  refreshTokens   RefreshToken[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model RefreshToken {
  id          String   @id @default(cuid())
  token       String   @unique
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt   DateTime
  createdAt   DateTime @default(now())
}

model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  products  Product[]
  createdAt DateTime  @default(now())
}

model Product {
  id          String      @id @default(cuid())
  name        String
  description String
  price       Float
  stock       Int         @default(0)
  imageUrl    String
  categoryId  String?
  
  // Relations
  category    Category?   @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  cartItems   CartItem[]
  orderItems  OrderItem[]
  reviews     Review[]
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([cartId, productId])
}

model Order {
  id        String      @id @default(cuid())
  userId    String
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  status    OrderStatus @default(PENDING)
  total     Float
  items     OrderItem[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int
  price     Float
  createdAt DateTime @default(now())
}

model Review {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  rating    Int      // 1-5
  comment   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

### Step 6: Push Schema to Database

```bash
npx prisma db push
```

This:
- Creates all tables in your Neon database
- Generates Prisma Client
- Sets up relationships

**Alternative (with migrations):**
```bash
npx prisma migrate dev --name init
```

---

### Step 7: Generate Prisma Client

```bash
npx prisma generate
```

This generates TypeScript types for your models.

---

### Step 8: Open Prisma Studio (Database GUI)

```bash
npx prisma studio
```

Opens at `http://localhost:5555` - You can view and edit database records.

---

## 📋 Option 2: Prisma with Supabase

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com/)
2. Sign in
3. Click "New Project"
4. Fill in:
   - Name: `my-ecommerce`
   - Database Password: (save this securely)
   - Region: Closest to you
5. Wait for database to provision (2-3 minutes)

---

### Step 2: Get Connection String

1. Go to Project Settings → Database
2. Scroll to "Connection String"
3. Select "URI" format
4. Copy the connection string
5. **Important:** Replace `[YOUR-PASSWORD]` with your actual password

**Connection String Format:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

---

### Step 3-8: Same as Neon

Follow the same steps as Neon (Steps 2-8 above).

**Note:** Supabase also provides:
- Built-in authentication (alternative to custom JWT)
- File storage (alternative to Cloudinary)
- Realtime subscriptions

---

## 🔧 Using Prisma in Your Code

### Initialize Prisma Client

Create `server/src/db.ts`:
```typescript
// ============================================================================
// Database Client Configuration
// ============================================================================

import { PrismaClient } from '@prisma/client';

// Create singleton instance
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

export default prisma;
```

---

### Example Queries

#### Create a User
```typescript
import prisma from './db';

const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    password: hashedPassword,
    role: 'USER',
  },
});
```

#### Find User by Email
```typescript
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
});
```

#### Get Products with Category
```typescript
const products = await prisma.product.findMany({
  include: {
    category: true,
  },
  where: {
    stock: { gt: 0 }, // In stock only
  },
});
```

#### Create Order with Items
```typescript
const order = await prisma.order.create({
  data: {
    userId: user.id,
    total: 100.50,
    status: 'PENDING',
    items: {
      create: [
        {
          productId: 'product-1',
          quantity: 2,
          price: 50.25,
        },
      ],
    },
  },
  include: {
    items: {
      include: {
        product: true,
      },
    },
  },
});
```

---

## 🔄 Schema Updates Workflow

### When You Change the Schema:

1. **Edit** `schema.prisma`
2. **Push changes:**
   ```bash
   npx prisma db push
   ```
3. **Regenerate client:**
   ```bash
   npx prisma generate
   ```
4. **Restart your dev server**

### Using Migrations (Production):

1. **Create migration:**
   ```bash
   npx prisma migrate dev --name add_username_field
   ```
2. **Deploy to production:**
   ```bash
   npx prisma migrate deploy
   ```

---

## 🎨 Prisma Studio Tips

**Viewing Data:**
```bash
npx prisma studio
```

**Useful for:**
- Creating your first SUPERADMIN user
- Viewing all database records
- Quick data editing
- Debugging relationships

---

## 🚨 Common Issues & Solutions

### Issue: "Can't reach database server"
**Solution:** Check your connection string in `.env`

### Issue: "prisma generate" fails
**Solution:**
```bash
npm install @prisma/client@latest prisma@latest
npx prisma generate
```

### Issue: Schema changes not reflecting
**Solution:**
```bash
npx prisma db push --force-reset  # Careful: deletes data!
```

### Issue: Type errors after schema change
**Solution:**
```bash
npx prisma generate
# Restart TypeScript server in VS Code
```

---

## 💡 Tips for AI Assistants

When working with Prisma:

1. **Always run `prisma generate`** after schema changes
2. **Use `include`** to fetch related data
3. **Use transactions** for operations affecting multiple tables
4. **Add indexes** for frequently queried fields
5. **Use `@@unique`** constraints for composite keys

**Example Transaction:**
```typescript
await prisma.$transaction([
  prisma.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } },
  }),
  prisma.order.create({
    data: { /* ... */ },
  }),
]);
```

---

## ✅ Verification Checklist

Before proceeding:

- [ ] Database created (Neon or Supabase)
- [ ] Connection string added to `.env`
- [ ] Prisma installed
- [ ] Schema defined in `schema.prisma`
- [ ] `prisma db push` successful
- [ ] `prisma generate` successful
- [ ] Prisma Studio opens successfully
- [ ] Can view tables in Prisma Studio

---

## 📚 Next Steps

Once your database is set up:
→ **Continue to [Backend Setup Guide](./04-backend-setup.md)**
