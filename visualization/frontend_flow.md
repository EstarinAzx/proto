# Frontend Flow

This diagram shows how users navigate through the application and how data flows between components.

## Page Navigation Flow

```mermaid
graph TD
    START[App Loads] --> AUTHCHECK{User Authenticated?}
    
    AUTHCHECK -->|No| LOGIN[Login Page]
    AUTHCHECK -->|Yes| DASH[Dashboard]
    
    LOGIN --> SIGNUP[SignUp Page]
    LOGIN --> FORGOT[Forgot Password]
    SIGNUP --> LOGIN
    
    FORGOT --> RESET[Reset Password]
    RESET --> LOGIN
    
    LOGIN -->|Success| DASH
    SIGNUP -->|Success| DASH
    
    DASH --> STORE[Store Page]
    DASH --> PROFILE[Profile Page]
    
    STORE --> CHECKOUT[Checkout Page]
    CHECKOUT -->|Order Complete| DASH
    
    DASH -->|Admin Only| ADMIN[Admin Dashboard]
    ADMIN --> ADMINORD[Admin Orders]
    ADMIN --> ADMINSTATS[Admin Stats]
    
    PROFILE --> DASH
    
    style LOGIN fill:#e1f5ff
    style SIGNUP fill:#e1f5ff
    style DASH fill:#d4edda
    style STORE fill:#d4edda
    style ADMIN fill:#fff3cd
```

## State Management Flow

```mermaid
graph TB
    subgraph "App Component"
        APP[App.tsx]
    end
    
    subgraph "Context Providers Layer 1"
        AUTHPROV[AuthProvider]
        AUTHPROV -.provides.-> AUTHCTX[AuthContext]
    end
    
    subgraph "Context Providers Layer 2"
        CARTPROV[CartProvider]
        CARTPROV -.provides.-> CARTCTX[CartContext]
    end
    
    subgraph "Routing"
        ROUTER[BrowserRouter]
        ROUTES[Routes]
    end
    
    subgraph "Protected Pages"
        DASHBOARD[Dashboard]
        STORE[Store]
        CHECKOUT[Checkout]
        PROFILE[Profile]
    end
    
    subgraph "Public Pages"
        LOGIN[Login]
        SIGNUP[SignUp]
        FORGOT[Forgot Password]
        RESET[Reset Password]
    end
    
    subgraph "Admin Pages"
        ADMINDASH[Admin Dashboard]
        ADMINORD[Admin Orders]
        ADMINSTATS[Admin Stats]
    end
    
    APP --> AUTHPROV
    AUTHPROV --> CARTPROV
    CARTPROV --> ROUTER
    ROUTER --> ROUTES
    
    ROUTES --> DASHBOARD
    ROUTES --> STORE
    ROUTES --> CHECKOUT
    ROUTES --> PROFILE
    ROUTES --> LOGIN
    ROUTES --> SIGNUP
    ROUTES --> FORGOT
    ROUTES --> RESET
    ROUTES --> ADMINDASH
    ROUTES --> ADMINORD
    ROUTES --> ADMINSTATS
    
    AUTHCTX -.user state.-> DASHBOARD
    AUTHCTX -.user state.-> STORE
    AUTHCTX -.user state.-> PROFILE
    AUTHCTX -.user state.-> CHECKOUT
    
    CARTCTX -.cart state.-> STORE
    CARTCTX -.cart state.-> CHECKOUT
    CARTCTX -.cart state.-> DASHBOARD
```

## Context Details

```mermaid
graph LR
    subgraph "AuthContext State & Actions"
        AUTHSTATE[State: user, isLoading]
        AUTHACT[Actions: login, signup, logout, refreshUser]
        
        AUTHSTATE --> AUTHACT
    end
    
    subgraph "AuthContext Features"
        F1[Auto-load from localStorage]
        F2[Auto-refresh token every 50 min]
        F3[Store JWT + Refresh Token]
        F4[Provide user info to app]
    end
    
    subgraph "CartContext State & Actions"
        CARTSTATE[State: cartItems, cartCount, cartTotal, isCartOpen]
        CARTACT[Actions: addToCart, updateQuantity, removeFromCart, clearCart, toggleCart]
        
        CARTSTATE --> CARTACT
    end
    
    subgraph "CartContext Features"
        C1[Auto-fetch cart when user logs in]
        C2[Sync with server on changes]
        C3[Calculate totals automatically]
        C4[Open cart panel on add]
    end
    
    AUTHACT --> F1
    AUTHACT --> F2
    AUTHACT --> F3
    AUTHACT --> F4
    
    CARTACT --> C1
    CARTACT --> C2
    CARTACT --> C3
    CARTACT --> C4
```

## Simple Explanation

### What is State Management?

State = Data that changes over time (like "is user logged in?" or "what's in the cart?")

Instead of each page asking the server "who is logged in?", we use **Context** to share this information across all pages.

### The Two Main Contexts

#### 1. AuthContext (Authentication)

**What it manages:**
- Current user information (name, email, role)
- Login status (authenticated or not)
- JWT tokens for API requests

**Key features:**
- Automatically restores session when you refresh the page
- Keeps you logged in by refreshing tokens every 50 minutes
- Provides login/signup/logout functions to all pages

**How pages use it:**
```javascript
const { user, login, logout } = useAuth();
// Now any page can check if user is logged in
```

#### 2. CartContext (Shopping Cart)

**What it manages:**
- List of items in cart
- Total number of items
- Total price
- Cart panel open/closed state

**Key features:**
- Automatically fetches cart when user logs in
- Updates server whenever cart changes
- Calculates totals automatically
- Opens cart panel when you add items

**How pages use it:**
```javascript
const { cartItems, cartCount, addToCart } = useCart();
// Now any page can add to cart or see cart count
```

### Page Protection

**ProtectedRoute**: Wrapper that checks if user is logged in
- If YES → Show the page
- If NO → Redirect to login

**AdminRoute**: Checks if user is an admin
- If ADMIN → Show admin page
- If NOT → Redirect to dashboard

### User Journey Example

**New user signs up:**
1. User fills signup form → Calls `signup()` from AuthContext
2. Server creates account → Returns user data + tokens
3. AuthContext saves to localStorage + updates state
4. App detects user is logged in → Redirects to Dashboard
5. CartContext fetches user's cart from server
6. User can now browse store and add items

**User adds to cart:**
1. User clicks "Add to Cart" → Calls `addToCart()` from CartContext
2. CartContext sends request to server
3. Server updates database
4. Server returns updated cart
5. CartContext updates state (cartItems, cartCount, cartTotal)
6. Cart panel opens automatically
7. UI updates to show new count

### Why Use Context?

**Without Context:**
- Each page needs to check login status separately
- Need to pass cart data through many components
- Duplicated code everywhere
- Hard to keep data in sync

**With Context:**
- Check login once, share everywhere
- Cart data available to any component
- Clean, reusable code
- Single source of truth
