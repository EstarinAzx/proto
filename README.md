# E-Commerce Platform Prototype

A full-stack e-commerce platform built with React, TypeScript, Node.js, Express, and PostgreSQL.

## Features

### 👤 User Management
- **Authentication**: Email/password login and registration
- **User Roles**: USER, ADMIN, SUPERADMIN hierarchy
- **Profile Management**: Edit name, email, change password, upload profile picture
- **Role Promotion**: SUPERADMIN can promote/demote users

### 🛍️ Store & Products
- **Product Catalog**: Browse products with search and filters
- **Product Categories**: Organize products by categories
- **Search & Filter**: 
  - Text search (name/description)
  - Price range filtering
  - Category filtering
  - Automatic debounced search
- **Shopping Cart**: Add/remove items, adjust quantities
- **Responsive Product Cards**: Image, name, description, price

### 📦 Order Management
- **Checkout Flow**: Complete orders with cart items
- **Order History**: Users can view their past orders
- **Order Status**: Track order status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- **Admin Order Management**: View and update all orders

### 🔐 Admin Features
- **Product Management**: Create, edit, delete products
- **User Management** (SUPERADMIN only): View users, promote/demote roles
- **Category Management**: Create and delete product categories
- **Order Management**: View all orders, update status
- **Image Upload**: Cloudinary integration for product and profile images

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** for database management
- **PostgreSQL** (Neon) for database
- **Cloudinary** for image storage

## Project Structure

```
proj 2/
├── src/                      # Frontend source
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── context/            # React context (Auth, Cart)
│   └── lib/                # Utilities
├── server/                  # Backend source
│   ├── src/
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Server entry point
│   └── prisma/
│       └── schema.prisma   # Database schema
└── public/                 # Static assets
```

## Database Schema

### Models
- **User**: Authentication, profile, roles
- **Product**: Product catalog with categories
- **Category**: Product categories
- **Cart**: User shopping carts
- **CartItem**: Items in cart
- **Order**: Order records
- **OrderItem**: Items in orders

### Role Hierarchy
1. **SUPERADMIN** - Full access, can manage user roles
2. **ADMIN** - Can manage products, orders, categories
3. **USER** - Can shop, view orders

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Register

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

## Setup Instructions

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
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
PORT=3000
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

## Usage

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

### Managing Users (SUPERADMIN only)
1. Go to Admin Dashboard → Users tab
2. Use "Promote to Admin" / "Demote to User" buttons
3. Cannot change your own role

## Features In Detail

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
- Sidebar cart view

### Order System
- Checkout creates order from cart
- Cart clears after order
- Order history with item details
- Admin can update order status
- Status badges with colors

### Image Upload
- Cloudinary integration
- Image preview before upload
- Used for products and profile pictures
- Automatic URL generation

## Security Notes

⚠️ **Important**: This is a development project. For production:
- Implement proper password hashing (bcrypt)
- Add JWT authentication
- Set up HTTPS
- Add rate limiting
- Implement CORS properly
- Add input validation
- Use environment-specific configs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for learning and development.

## Acknowledgments

- Built with guidance from Google Deepmind's Antigravity AI
- Uses Neon for serverless PostgreSQL
- Cloudinary for image management
- Tailwind CSS for styling