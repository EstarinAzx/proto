# Code Organization Guide

This guide explains how to structure and comment code for maximum readability and maintainability, especially for AI assistants building new projects.

## 🎯 Header Comment Pattern

Use section headers to divide files into logical blocks:

```typescript
// ============================================================================
// Section Name
// ============================================================================
```

### Standard Sections

Every file should use these sections in order:

1. **Imports** - All import statements
2. **Types/Interfaces** - TypeScript types and interfaces
3. **Constants** - Configuration and constant values
4. **Helper Functions** - Utility functions
5. **Main Code** - Component/Routes/Logic
6. **Export** - Export statement

---

## 📁 Backend Route File Pattern

```typescript
// ============================================================================
// Imports
// ============================================================================

import { Router, Request, Response } from 'express';
import prisma from '../db';
import bcrypt from 'bcryptjs';

// ============================================================================
// Configuration
// ============================================================================

const router = Router();
const ITEMS_PER_PAGE = 10;

// ============================================================================
// Types
// ============================================================================

interface CreateProductBody {
  name: string;
  description: string;
  price: number;
  stock: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

function validatePrice(price: number): boolean {
  return price > 0 && Number.isFinite(price);
}

// ============================================================================
// Routes - GET /api/products
// ============================================================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ============================================================================
// Routes - POST /api/products
// ============================================================================

router.post('/', async (req: Request<{}, {}, CreateProductBody>, res: Response) => {
  try {
    const { name, description, price, stock } = req.body;

    if (!validatePrice(price)) {
      res.status(400).json({ error: 'Invalid price' });
      return;
    }

    const product = await prisma.product.create({
      data: { name, description, price, stock },
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

## ⚛️ React Component Pattern

```typescript
// ============================================================================
// Imports
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from '../components/Button';

// ============================================================================
// Types
// ============================================================================

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface StoreProps {
  initialFilter?: string;
}

// ============================================================================
// Component
// ============================================================================

export default function Store({ initialFilter }: StoreProps) {
  // ----------------------------------------------------------------------------
  // State
  // ----------------------------------------------------------------------------

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialFilter || '');

  // ----------------------------------------------------------------------------
  // Hooks
  // ----------------------------------------------------------------------------

  const navigate = useNavigate();

  // ----------------------------------------------------------------------------
  // Effects
  // ----------------------------------------------------------------------------

  useEffect(() => {
    fetchProducts();
  }, [search]);

  // ----------------------------------------------------------------------------
  // API Functions
  // ----------------------------------------------------------------------------

  async function fetchProducts() {
    try {
      const response = await fetch(`/api/products?search=${search}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------------------------------
  // Event Handlers
  // ----------------------------------------------------------------------------

  function handleAddToCart(productId: string) {
    // Add to cart logic
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  // ----------------------------------------------------------------------------
  // Render Helpers
  // ----------------------------------------------------------------------------

  if (loading) {
    return <div>Loading...</div>;
  }

  // ----------------------------------------------------------------------------
  // Render
  // ============================================================================

  return (
    <div className="container mx-auto p-6">
      {/* Search Bar */}
      <input
        type="text"
        value={search}
        onChange={handleSearchChange}
        placeholder="Search products..."
        className="w-full p-2 border rounded mb-4"
      />

      {/* Product Grid */}
      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded p-4">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <Button onClick={() => handleAddToCart(product.id)}>
              <ShoppingCart className="mr-2" />
              Add to Cart
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎨 React Context Pattern

```typescript
// ============================================================================
// Imports
// ============================================================================

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// Context Creation
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

export function AuthProvider({ children }: AuthProviderProps) {
  // ----------------------------------------------------------------------------
  // State
  // ----------------------------------------------------------------------------

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------------------------------
  // Effects
  // ----------------------------------------------------------------------------

  useEffect(() => {
    checkAuth();
  }, []);

  // ----------------------------------------------------------------------------
  // Helper Functions
  // ----------------------------------------------------------------------------

  async function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and fetch user
    }
    setLoading(false);
  }

  // ----------------------------------------------------------------------------
  // Context Methods
  // ----------------------------------------------------------------------------

  async function login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    setUser(data.user);
    localStorage.setItem('token', data.token);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('token');
  }

  // ----------------------------------------------------------------------------
  // Context Value
  // ----------------------------------------------------------------------------

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  // ----------------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------------

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## 📝 Commenting Best Practices

### Inline Comments

Use sparingly, only for complex logic:

```typescript
// Good: Explains WHY
// Use exponential backoff to prevent API rate limiting
const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);

// Bad: States WHAT (obvious from code)
// Set delay variable
const delay = calculateDelay();
```

### Function Comments

For complex functions, add a brief description:

```typescript
/**
 * Validates product data before creation
 * Checks price, stock, and required fields
 * Returns validation errors or null if valid
 */
function validateProduct(data: ProductData): string[] | null {
  const errors: string[] = [];
  
  if (data.price <= 0) errors.push('Price must be positive');
  if (data.stock < 0) errors.push('Stock cannot be negative');
  
  return errors.length > 0 ? errors : null;
}
```

### Component Comments

```typescript
/**
 * ProductModal - Full-screen product detail popup
 * 
 * Features:
 * - Displays product image, price, description
 * - Shows stock availability with color-coded badges
 * - Allows adding to cart
 * - Responsive layout (desktop/mobile)
 */
export default function ProductModal({ product, onClose }: ProductModalProps) {
  // ...
}
```

---

## 🗂️ File Organization Rules

### 1. One Export Per File (Components)

```typescript
// ✅ Good
// ProductCard.tsx - exports only ProductCard

// ❌ Bad
// Components.tsx - exports Button, Card, Input, etc.
```

### 2. Group Related Code

```typescript
// ============================================================================
// State - Group all useState together
// ============================================================================

const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// ============================================================================
// Effects - Group all useEffect together
// ============================================================================

useEffect(() => { /* ... */ }, []);
useEffect(() => { /* ... */ }, [search]);
```

### 3. Order Matters

Order within sections:
1. State hooks (useState)
2. Other hooks (useNavigate, useContext, etc.)
3. Effects (useEffect)
4. Helper functions
5. Event handlers
6. Render logic

---

## 🎯 Naming Conventions

### Variables & Functions

```typescript
// camelCase for variables and functions
const productList = [];
function fetchProducts() {}

// PascalCase for components and types
interface ProductData {}
function ProductCard() {}

// UPPERCASE for constants
const API_URL = 'http://localhost:3000';
const MAX_RETRIES = 3;

// Prefix booleans with is/has/should
const isLoading = true;
const hasError = false;
const shouldRefetch = false;
```

### Event Handlers

```typescript
// Prefix with 'handle'
function handleClick() {}
function handleSubmit() {}
function handleInputChange() {}

// Or for specific elements
function handleSearchChange() {}
function handlePriceFilter() {}
```

---

## 💡 Tips for AI Assistants

When generating code:

1. **Always use header comments** to organize sections
2. **Group related code** together (all state, all effects, etc.)
3. **Follow naming conventions** consistently
4. **Add explanatory comments** for complex logic only
5. **Keep functions focused** - one responsibility per function
6. **Use TypeScript types** for all parameters and returns
7. **Handle errors** explicitly with try-catch
8. **Validate input** at API boundaries
9. **Be consistent** - use the same patterns throughout
10. **Document edge cases** - explain unusual situations

---

## ✅ Code Quality Checklist

Before submitting code:

- [ ] All sections have header comments
- [ ] Imports are organized (React first, then libs, then local)
- [ ] Types are defined before use
- [ ] Functions have clear, descriptive names
- [ ] No magic numbers (use named constants)
- [ ] Error handling is present
- [ ] TypeScript types are used (no `any`)
- [ ] Consistent formatting
- [ ] No commented-out code
- [ ] No console.logs in production code (use proper logging)

---

## 📚 Next Steps

Once you understand code organization:
→ **Continue to [Authentication Guide](./07-authentication.md)**
