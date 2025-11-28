# Database Structure

This diagram shows how the database tables are organized and how they relate to each other.

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ RefreshToken : "has many"
    User ||--o| Cart : "has one"
    User ||--o{ Order : "places many"
    User ||--o{ Review : "writes many"
    
    Cart ||--o{ CartItem : "contains many"
    
    Product ||--o{ CartItem : "appears in"
    Product ||--o{ OrderItem : "appears in"
    Product ||--o{ Review : "has many"
    Product }o--|| Category : "belongs to"
    
    Order ||--o{ OrderItem : "contains many"
    
    User {
        string id PK
        string email UK
        string username UK
        string password
        string name
        enum role
        string profilePicture
        string resetToken
        datetime resetTokenExpiry
        datetime createdAt
        datetime updatedAt
    }
    
    RefreshToken {
        string id PK
        string token UK
        string userId FK
        datetime expiresAt
        datetime createdAt
    }
    
    Product {
        string id PK
        string name
        string description
        float price
        int stock
        string imageUrl
        string categoryId FK
        datetime createdAt
        datetime updatedAt
    }
    
    Category {
        string id PK
        string name UK
        datetime createdAt
        datetime updatedAt
    }
    
    Cart {
        string id PK
        string userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    CartItem {
        string id PK
        string cartId FK
        string productId FK
        int quantity
        datetime createdAt
        datetime updatedAt
    }
    
    Order {
        string id PK
        string userId FK
        enum status
        float total
        string address
        string city
        string zipCode
        string country
        datetime createdAt
        datetime updatedAt
    }
    
    OrderItem {
        string id PK
        string orderId FK
        string productId FK
        int quantity
        float price
    }
    
    Review {
        string id PK
        string userId FK
        string productId FK
        int rating
        string comment
        datetime createdAt
        datetime updatedAt
    }
```

## Simple Explanation

Think of the database as a collection of organized boxes (tables) that store information:

### Core Tables

- **User**: Stores user account information (email, password, name, role)
- **Product**: Stores items available for purchase (name, price, description, stock)
- **Category**: Groups products into categories (like "Electronics", "Clothing")

### Shopping Tables

- **Cart**: A shopping cart for each user
- **CartItem**: Individual products added to a cart (with quantity)
- **Order**: A completed purchase with delivery details
- **OrderItem**: Products in a specific order (saved with price at time of purchase)

### Supporting Tables

- **Review**: Customer ratings and comments on products
- **RefreshToken**: Security tokens for keeping users logged in

### Key Relationships

- Each **User** can have ONE **Cart** but MANY **Orders**
- Each **Cart** contains MANY **CartItems** (different products)
- Each **Product** can belong to ONE **Category**
- Each **Order** contains MANY **OrderItems** (snapshot of products at purchase time)
- Users can write MANY **Reviews**, but only ONE review per product
