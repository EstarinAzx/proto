# Project Structure Guide

This guide shows how to organize a full-stack TypeScript project for scalability and maintainability.

## 📁 Complete Folder Structure

```
project-name/
├── src/                          # Frontend source code
│   ├── components/              # Reusable React components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Layout.tsx
│   │   ├── ProductModal.tsx
│   │   └── CartSidebar.tsx
│   ├── pages/                   # Page-level components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Store.tsx
│   │   ├── Profile.tsx
│   │   └── AdminDashboard.tsx
│   ├── context/                 # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── lib/                     # Utility functions
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── App.tsx                  # Main app component
│   ├── index.css                # Global styles
│   └── main.tsx                 # App entry point
├── server/                       # Backend source code
│   ├── src/
│   │   ├── routes/              # API route handlers
│   │   │   ├── auth.ts          # Authentication routes
│   │   │   ├── users.ts         # User management
│   │   │   ├── products.ts      # Product CRUD
│   │   │   ├── categories.ts   # Category management
│   │   │   ├── orders.ts        # Order processing
│   │   │   ├── upload.ts        # File uploads
│   │   │   └── admin.ts         # Admin analytics
│   │   ├── middleware/          # Express middleware (optional)
│   │   │   └── auth.ts
│   │   └── index.ts             # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Database migrations (if using migrate)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                     # Backend environment variables
├── public/                       # Static assets
│   └── images/
├── guides/                       # Development guides (this folder)
├── visualization/                # Architecture documentation
│   ├── database_structure.md
│   ├── frontend_flow.md
│   └── system_architecture.md
├── .gitignore
├── package.json                  # Frontend dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.js           # Tailwind CSS config
├── vite.config.ts               # Vite config
├── vercel.json                  # Vercel deployment config
├── README.md                     # Project documentation
└── .env.example                 # Environment variable template
```

---

## 🎯 Directory Purpose

### Frontend (`src/`)

#### `components/`
**Purpose:** Reusable UI components

**Naming Convention:** PascalCase, descriptive names
```
Button.tsx          # Generic button component
ProductCard.tsx     # Display product in grid
ProductModal.tsx    # Product detail popup
CartSidebar.tsx     # Shopping cart sidebar
Layout.tsx          # App layout wrapper
```

**Organization Rules:**
- One component per file
- Export default at end of file
- Group related components in subfolders if needed

---

#### `pages/`
**Purpose:** Route-level components (full pages)

**Naming Convention:** PascalCase, matches route name
```
Login.tsx           # /login route
Dashboard.tsx       # /dashboard route
Store.tsx           # /store route
Profile.tsx         # /profile route
AdminDashboard.tsx  # /admin route
```

**Key Difference from Components:**
- Pages are rendered by React Router
- Pages compose multiple components
- Pages handle data fetching

---

#### `context/`
**Purpose:** Global state management with React Context

**Naming Convention:** PascalCase with "Context" suffix
```
AuthContext.tsx     # User authentication state
CartContext.tsx     # Shopping cart state
NotificationContext.tsx  # Notifications (if needed)
```

**Pattern:**
```typescript
// AuthContext.tsx structure
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => { ... };
export const useAuth = () => useContext(AuthContext);
```

---

#### `lib/`
**Purpose:** Utility functions and helpers

**Contents:**
```
api.ts              # API configuration and helpers
utils.ts            # Generic utility functions
constants.ts        # App-wide constants
```

---

### Backend (`server/src/`)

#### `routes/`
**Purpose:** API endpoint handlers

**Naming Convention:** lowercase, matches resource
```
auth.ts             # POST /api/auth/login, /signup, etc.
users.ts            # GET/PUT/DELETE /api/users
products.ts         # CRUD /api/products
categories.ts       # CRUD /api/categories
orders.ts           # Order management
upload.ts           # File upload handling
admin.ts            # Admin-specific endpoints
```

**File Structure:**
```typescript
import { Router } from 'express';
const router = Router();

// ============================================================================
// Routes
// ============================================================================

router.get('/', async (req, res) => { ... });
router.post('/', async (req, res) => { ... });

export default router;
```

---

#### `prisma/`
**Purpose:** Database schema and migrations

**Contents:**
```
schema.prisma       # Database models and relations
migrations/         # Migration history (optional)
```

---

## 📝 File Naming Conventions

### TypeScript/React Files

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Pages | PascalCase | `Dashboard.tsx` |
| Context | PascalCase + Context | `AuthContext.tsx` |
| Utils | camelCase | `api.ts`, `utils.ts` |
| Routes (backend) | lowercase | `products.ts`, `auth.ts` |

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript compiler options |
| `vite.config.ts` | Vite bundler configuration |
| `tailwind.config.js` | Tailwind CSS customization |
| `vercel.json` | Vercel deployment settings |
| `.env` | Environment variables (gitignored) |
| `.env.example` | Environment variable template |

---

## 🚀 Creating the Structure

### Quick Setup Script

```bash
# Create frontend structure
mkdir -p src/{components,pages,context,lib}
mkdir -p public/images

# Create backend structure
mkdir -p server/src/{routes,middleware}
mkdir -p server/prisma

# Create documentation
mkdir -p guides visualization

# Create config files
touch .env.example
touch .gitignore
touch README.md
```

---

## 📦 package.json Structure

### Frontend `package.json`
```json
{
  "name": "frontend",
 "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "lucide-react": "^0.350.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### Backend `server/package.json`
```json
{
  "name": "backend",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "prisma": "^5.8.0",
    "@prisma/client": "^5.8.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.0",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.41.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/node": "^20.10.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cors": "^2.8.17",
    "@types/multer": "^1.4.11",
    "typescript": "^5.3.0",
    "tsx": "^4.7.0"
  }
}
```

---

## 🔒 .gitignore Template

```gitignore
# Dependencies
node_modules/
server/node_modules/

# Environment variables
.env
.env.local
.env.production

# Build outputs
dist/
build/
server/dist/

# Logs
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/

# Misc
.vercel
```

---

## 💡 Tips for AI Assistants

When creating a new project:

1. **Start with structure first** - Create all folders before adding code
2. **Follow naming conventions** - Consistency is key
3. **Separate concerns** - Frontend and backend in separate folders
4. **Use descriptive names** - No abbreviations unless common
5. **Group related files** - Keep route files together, components together
6. **Document structure** - Add comments explaining organization

---

## 📚 Next Steps

Once your project structure is set up:
→ **Continue to [Database Setup Guide](./03-database-setup.md)**
