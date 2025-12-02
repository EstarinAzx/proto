# E-Commerce Platform

A full-stack e-commerce platform built with React, TypeScript, Node.js, Express, and PostgreSQL.

## ✨ Features

### 👤 User Management
- **Authentication**: Email/password login and registration with JWT tokens
- **Password Reset**: Forgot password flow with time-limited tokens (mock email)
- **Refresh Tokens**: Long-lived sessions (7 days) with automatic token refresh
- **Username System**: Unique usernames for all users
- **User Roles**: USER, ADMIN, SUPERADMIN hierarchy
- **Profile Management**: Edit name, username, email, change password, upload profile picture
- **Role Promotion**: SUPERADMIN can promote/demote users

### 🛍️ Store & Products
- **Product Catalog**: Browse products with search and filters
- **Product Detail Modal**: Click products to view detailed popup with full information
- **Product Categories**: Organize products by categories
- **Inventory Tracking**: Real-time stock levels with low-stock warnings
- **Search & Filter**: 
  - Text search (name/description)
  - Price range filtering
  - Category filtering
  - Automatic debounced search
- **Shopping Cart**: Add/remove items, adjust quantities, sidebar view
- **Responsive Design**: Mobile-friendly product cards and navigation

### 📦 Order Management
- **Checkout Flow**: Complete orders with cart items
- **Order History**: Users can view their past orders
- **Order Status**: Track order status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- **Admin Order Management**: View and update all orders
- **Stock Deduction**: Automatic inventory updates on order completion

### 🔐 Admin Features
- **Analytics Dashboard**: View revenue, orders, user stats, and top products
- **Product Management**: Create, edit, delete products with stock tracking
- **User Management** (SUPERADMIN only): View users, promote/demote roles, delete users
- **Category Management**: Create and delete product categories
- **Order Management**: View all orders, update status
- **Image Upload**: Cloudinary integration for product and profile images

### 🎨 UI/UX Features
- **Product Modal**: Full product page in a popup with details, pricing, stock status
- **Subtle Delete Buttons**: Ghost-style delete buttons instead of aggressive red
- **Mobile Navigation**: Fully opaque sidebar with smooth animations
- **Profile Pictures**: Upload and display user profile pictures
- **Stock Badges**: Color-coded badges for stock levels (out of stock, low stock, in stock)

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling
- **Context API** for state management

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** for database management
- **PostgreSQL** (Neon) for database
- **Cloudinary** for image storage
- **bcrypt** for password hashing
- **JWT** for authentication

## 📁 Project Structure

```
proj 2/
├── src/                      # Frontend source
│   ├── components/          # React components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── CartSidebar.tsx
│   │   ├── Input.tsx
│   │   ├── Layout.tsx
│   │   └── ProductModal.tsx
│   ├── pages/              # Page components
│   │   ├── AdminDashboard.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Profile.tsx
│   │   └── Store.tsx
│   ├── context/            # React context
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   └── lib/                # Utilities
│       ├── api.ts
│       └── utils.ts
├── server/                  # Backend source
│   ├── src/
│   │   ├── routes/         # API routes
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── products.ts
│   │   │   ├── categories.ts
│   │   │   ├── orders.ts
│   │   │   ├── upload.ts
│   │   │   └── admin.ts
│   │   └── index.ts        # Server entry point
│   └── prisma/
│       └── schema.prisma   # Database schema
└── public/                 # Static assets
```

## 💾 Database Schema

### Models
- **User**: Authentication, profile, roles, username, password reset tokens
- **RefreshToken**: JWT refresh tokens for session management
- **Product**: Product catalog with categories and stock tracking
- **Category**: Product categories
- **Cart**: User shopping carts
- **CartItem**: Items in cart
- **Order**: Order records with automatic stock deduction
- **OrderItem**: Items in orders
- **Review**: Product reviews and ratings

### Role Hierarchy
1. **SUPERADMIN** - Full access, can manage user roles
2. **ADMIN** - Can manage products, orders, categories, view analytics
3. **USER** - Can shop, view orders, write reviews

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - Login (returns access & refresh tokens)
- `POST /api/auth/signup` - Register (returns access & refresh tokens)
- `POST /api/auth/forgot-password` - Request password reset email
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/refresh-token` - Get new access token
- `POST /api/auth/logout` - Revoke refresh token

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `PUT /api/users/me/password` - Change password
- `PATCH /api/users/:id/role` - Change user role (SUPERADMIN only)
- `DELETE /api/users/:id` - Delete user

### Products
- `GET /api/products` - Get all products (supports search, price, category filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/all` - Get all orders (Admin)
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status (Admin)

### Upload
- `POST /api/upload` - Upload image to Cloudinary
- `GET /api/upload/config-check` - Check Cloudinary configuration

### Admin
- `GET /api/admin/stats` - Get analytics dashboard data

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon account)
- Cloudinary account

### 1. Clone Repository
```bash
git clone <repository-url>
cd "proj 2"
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 3. Environment Variables

Create `server/.env`:
```env
DATABASE_URL="postgresql://username:password@host/database"
JWT_SECRET="your-super-secret-jwt-key"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
FRONTEND_URL="http://localhost:5173"
PORT=3000
```

Create `.env` in root (optional, for frontend):
```env
VITE_API_URL="http://localhost:3000"
```

### 4. Database Setup
```bash
cd server
npx prisma generate
npx prisma db push
```

### 5. Create First SUPERADMIN
Use Prisma Studio to create your first SUPERADMIN:
```bash
npx prisma studio
```
Navigate to the User table and set a user's role to `SUPERADMIN`.

### 6. Run Development Servers

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3000

## 📖 Usage

### Creating Your First Admin
1. Sign up for a new account
2. Use Prisma Studio to change your role to `SUPERADMIN`
3. Log out and log back in
4. Access Admin Dashboard from the sidebar

### Managing Products
1. Go to Admin Dashboard → Products tab
2. Click "Add Product"
3. Fill in details and upload an image
4. Assign a category (create categories first in Categories tab)
5. Set stock quantity

### Managing Users (SUPERADMIN only)
1. Go to Admin Dashboard → Users tab
2. Use "Promote to Admin" / "Demote to User" buttons
3. Cannot change your own role
4. Delete users with the subtle trash icon

### Viewing Product Details
1. Go to Store page
2. Click on any product image
3. View full details in the modal popup
4. Add to cart directly from the modal

## 🔒 Security Features

✅ **Implemented**:
- Password hashing with bcrypt
- JWT authentication with access & refresh tokens
- Refresh token rotation and revocation
- Password reset with time-limited tokens
- CORS configuration
- Protected API routes
- Input validation on critical endpoints

⚠️ **For Production**:
- Set up HTTPS
- Add rate limiting
- Implement stricter CORS policies
- Add comprehensive input validation
- Set up real email service (currently mocked)
- Use environment-specific configs
- Add request logging and monitoring
- Configure production database backups

## 🎯 Key Features In Detail

### Automatic Search & Filtering
- Search updates automatically with 500ms debounce
- Filters by product name and description
- Price range filtering (min/max)
- Category dropdown filter
- "Clear" button resets all filters

### Shopping Cart
- Persistent cart with context API
- Add/remove items
- Adjust quantities
- Real-time total calculation
- Sidebar cart view with animations

### Order System
- Checkout creates order from cart
- Cart clears after order
- Order history with item details
- Admin can update order status
- Status badges with colors
- Automatic stock deduction

### Image Upload
- Cloudinary integration
- Image preview before upload
- Used for products and profile pictures
- Automatic URL generation
- Error handling and diagnostics

## 🚢 Deployment

### Frontend (Vercel)
1. Connect GitHub repository
2. Set environment variable: `VITE_API_URL` to your backend URL
3. Deploy automatically on push

### Backend (Railway)
1. Connect GitHub repository
2. Set all environment variables from `.env.example`
3. Railway will run `prisma generate` and `prisma db push` automatically
4. Deploy automatically on push

## 📝 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- Built with guidance from Google Deepmind's Antigravity AI
- Uses Neon for serverless PostgreSQL
- Cloudinary for image management
- Tailwind CSS for styling
- Lucide React for icons