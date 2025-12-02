# Frontend Setup Guide (React + Vite + TypeScript)

This guide covers setting up a React frontend with Vite, TypeScript, Tailwind CSS, and proper project structure.

## 🎯 Overview

We'll create a React app with:
- Vite for fast development and building
- TypeScript for type safety
- React Router for navigation
- Tailwind CSS for styling
- Context API for state management

---

## 📦 Step 1: Create Vite Project

From your project root directory:

```bash
# Using npm
npm create vite@latest . -- --template react-ts

# This creates the frontend in the current directory
# Backend should already be in ./server or ./backend
```

**Alternatively, if starting fresh:**
```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
```

---

## 📦 Step 2: Install Dependencies

### Core Dependencies
```bash
npm install react-router-dom
npm install lucide-react
```

### Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## ⚙️ Step 3: Configure Tailwind CSS

Edit `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },
        background: '#ffffff',
        foreground: '#0a0a0a',
        card: '#f9fafb',
        'card-foreground': '#0a0a0a',
        muted: '#f3f4f6',
        'muted-foreground': '#6b7280',
        accent: '#f3f4f6',
        'accent-foreground': '#0a0a0a',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
        border: '#e5e7eb',
      },
    },
  },
  plugins: [],
}
```

Edit `src/index.css`:
```css
/* ============================================================================ */
/* Tailwind Base Styles */
/* ============================================================================ */

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ============================================================================ */
/* Global Styles */
/* ============================================================================ */

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

/* ============================================================================ */
/* Custom Utilities */
/* ============================================================================ */

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

---

## 🗂️ Step 4: Create Project Structure

```bash
# Create directories
mkdir -p src/{components,pages,context,lib}

# Create files
touch src/lib/api.ts
touch src/lib/utils.ts
touch src/context/AuthContext.tsx
touch src/context/CartContext.tsx
```

---

## 🔧 Step 5: Configure API Connection

Create `src/lib/api.ts`:
```typescript
// ============================================================================
// API Configuration
// ============================================================================

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ============================================================================
// Helper Functions
// ============================================================================

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('accessToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired, try to refresh
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry request with new token
      return fetchWithAuth(url, options);
    } else {
      // Refresh failed, logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  }

  return response;
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const { accessToken } = await response.json();
      localStorage.setItem('accessToken', accessToken);
      return true;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  return false;
}
```

Create `src/lib/utils.ts`:
```typescript
// ============================================================================
// Utility Functions
// ============================================================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}
```

---

## 🔐 Step 6: Create Auth Context

Create `src/context/AuthContext.tsx`:
```typescript
// ============================================================================
// Imports
// ============================================================================

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '../lib/api';

// ============================================================================
// Types
// ============================================================================

interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  role: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

// ============================================================================
// Context Creation
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------------------------------
  // Effects
  // ----------------------------------------------------------------------------

  useEffect(() => {
    checkAuth();
  }, []);

  // ----------------------------------------------------------------------------
  // API Functions
  // ----------------------------------------------------------------------------

  async function checkAuth() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    }
    setLoading(false);
  }

  async function login(email: string, password: string) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setUser(data.user);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
  }

  async function signup(email: string, password: string, name: string) {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const data = await response.json();
    setUser(data.user);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
  }

  function logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Call logout endpoint to revoke refresh token
    if (refreshToken) {
      fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {
        // Ignore errors on logout
      });
    }

    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async function refreshUser() {
    await checkAuth();
  }

  // ----------------------------------------------------------------------------
  // Context Value
  // ----------------------------------------------------------------------------

  const value = {
    user,
    login,
    signup,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    loading,
  };

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

## 🛣️ Step 7: Set Up Routing

Edit `src/App.tsx`:
```typescript
// ============================================================================
// Imports
// ============================================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Store from './pages/Store';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// ============================================================================
// Protected Route Component
// ============================================================================

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

// ============================================================================
// App Component
// ============================================================================

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/store"
            element={
              <ProtectedRoute>
                <Store />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## 🎨 Step 8: Create Reusable Components

Create `src/components/Button.tsx`:
```typescript
// ============================================================================
// Imports
// ============================================================================

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/utils';

// ============================================================================
// Types
// ============================================================================

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// Component
// ============================================================================

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          
          // Variants
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
            'border border-input bg-background hover:bg-accent': variant === 'outline',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
          },
          
          // Sizes
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
          },
          
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

---

## 🧪 Step 9: Create a Sample Page

Create `src/pages/Login.tsx`:
```typescript
// ============================================================================
// Imports
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

// ============================================================================
// Component
// ============================================================================

export default function Login() {
  // ----------------------------------------------------------------------------
  // State
  // ----------------------------------------------------------------------------

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ----------------------------------------------------------------------------
  // Hooks
  // ----------------------------------------------------------------------------

  const { login } = useAuth();
  const navigate = useNavigate();

  // ----------------------------------------------------------------------------
  // Event Handlers
  // ----------------------------------------------------------------------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------------------------------
  // Render
  // ============================================================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">Sign in</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded bg-red-50 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

---

## ⚙️ Step 10: Configure Environment Variables

Create `.env` in project root:
```env
VITE_API_URL=http://localhost:3000
```

**Important:** Add to `.gitignore`:
```
.env
.env.local
```

---

## 🚀 Step 11: Update package.json Scripts

Ensure your `package.json` has:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

---

## 🧪 Step 12: Start Development Server

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## ✅ Verification Checklist

- [ ] Vite project created
- [ ] Dependencies installed
- [ ] Tailwind CSS configured
- [ ] Folder structure created
- [ ] API connection configured
- [ ] Auth context created
- [ ] Routing set up
- [ ] Sample components created
- [ ] Environment variables set
- [ ] Dev server running
- [ ] Can navigate to login page
- [ ] Tailwind styles working

---

## 💡 Tips for AI Assistants

When setting up a React frontend:

1. **Use TypeScript** for all components
2. **Create contexts early** for auth and global state
3. **Set up routing** before building pages
4. **Create reusable components** (Button, Input, Card, etc.)
5. **Configure API connection** with proper error handling
6. **Handle loading states** in all async operations
7. **Use proper TypeScript types** for props and state
8. **Follow component patterns** from Code Organization guide

---

## 📚 Next Steps

Once your frontend is set up:
→ **Return to [Code Organization Guide](./06-code-organization.md)** for best practices
→ **Continue to [Authentication Guide](./07-authentication.md)** for auth implementation
