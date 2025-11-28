# System Architecture

This diagram shows how the client (browser), server (backend), and database work together.

## System Overview

```mermaid
graph TB
    subgraph "Client Browser Port 5173"
        A[React App]
        A1[Pages]
        A2[Components]
        A3[Context AuthContext & CartContext]
    end
    
    subgraph "Server Port 3000"
        B[Express Server]
        B1["/api/auth"]
        B2["/api/products"]
        B3["/api/cart"]
        B4["/api/orders"]
        B5["/api/users"]
        B6["/api/reviews"]
        B7["/api/categories"]
        B8["/api/admin"]
        B9["/api/upload"]
        
        B --> B1
        B --> B2
        B --> B3
        B --> B4
        B --> B5
        B --> B6
        B --> B7
        B --> B8
        B --> B9
    end
    
    subgraph "Database"
        C[(PostgreSQL)]
        C1[Users Table]
        C2[Products Table]
        C3[Carts Table]
        C4[Orders Table]
        C5[Reviews Table]
    end
    
    A -->|HTTP Requests| B
    B -->|HTTP Responses| A
    
    B1 -->|Prisma ORM| C1
    B2 -->|Prisma ORM| C2
    B3 -->|Prisma ORM| C3
    B4 -->|Prisma ORM| C4
    B5 -->|Prisma ORM| C1
    B6 -->|Prisma ORM| C5
    B7 -->|Prisma ORM| C2
    B8 -->|Prisma ORM| C1
    
    C --> C1
    C --> C2
    C --> C3
    C --> C4
    C --> C5
```

## API Routes Detail

```mermaid
graph LR
    subgraph "Authentication /api/auth"
        AUTH1[POST /signup]
        AUTH2[POST /login]
        AUTH3[POST /logout]
        AUTH4[POST /refresh-token]
        AUTH5[POST /forgot-password]
        AUTH6[POST /reset-password]
    end
    
    subgraph "Products /api/products"
        PROD1[GET / - List & Filter]
        PROD2[POST / - Create Admin]
        PROD3[PUT /:id - Update]
        PROD4[DELETE /:id - Remove]
    end
    
    subgraph "Cart /api/cart"
        CART1[GET / - View Cart]
        CART2[POST /add - Add Item]
        CART3[PUT /item/:id - Update Qty]
        CART4[DELETE /item/:id - Remove]
        CART5[DELETE /clear - Clear All]
    end
    
    subgraph "Orders /api/orders"
        ORD1[GET / - User Orders]
        ORD2[POST / - Place Order]
        ORD3[GET /:id - Order Detail]
    end
    
    subgraph "Users /api/users"
        USER1[GET /me - Current User]
        USER2[PUT /me - Update Profile]
        USER3[PUT /me/password - Change Password]
    end
    
    subgraph "Reviews /api/reviews"
        REV1[GET /product/:id - Product Reviews]
        REV2[POST / - Add Review]
        REV3[PUT /:id - Edit Review]
        REV4[DELETE /:id - Delete Review]
    end
    
    subgraph "Categories /api/categories"
        CAT1[GET / - List All]
        CAT2[POST / - Create Admin]
        CAT3[PUT /:id - Update]
        CAT4[DELETE /:id - Remove]
    end
    
    subgraph "Admin /api/admin"
        ADM1[GET /users - All Users]
        ADM2[GET /orders - All Orders]
        ADM3[PUT /orders/:id - Update Status]
        ADM4[GET /stats - Dashboard Stats]
    end
```

## Simple Explanation

### How It Works Together

1. **Client (React App)**: This is what users see in their browser
   - Displays pages like Login, Store, Cart, Checkout
   - Manages user state (logged in or not) with AuthContext
   - Manages shopping cart state with CartContext
   - Sends requests to the server when users interact

2. **Server (Express + Node.js)**: The middleman that handles requests
   - Receives requests from the client (like "add to cart")
   - Validates data and checks user permissions
   - Talks to the database using Prisma ORM
   - Sends responses back to the client

3. **Database (PostgreSQL)**: Where all data is stored permanently
   - Stores users, products, carts, orders, reviews
   - Organized in tables with relationships
   - Only the server can access it directly

### Request Flow Example

**User adds product to cart:**

1. User clicks "Add to Cart" button → Client
2. Client calls `CartContext.addToCart()` → Sends POST to `/api/cart/add`
3. Server receives request → Validates user → Checks product exists
4. Server updates database → Adds CartItem record
5. Database confirms → Server retrieves updated cart
6. Server sends back cart data → Client updates UI
7. User sees updated cart count

### Security Layer

- **JWT Tokens**: Used for authentication (stored in localStorage)
- **Refresh Tokens**: Keep users logged in for 7 days
- **User-ID Header**: Sent with requests to identify the user
- **Password Hashing**: Passwords stored securely using bcrypt
