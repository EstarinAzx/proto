import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}

interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    product: Product;
}

interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    cartTotal: number;
    isCartOpen: boolean;
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCartItems([]);
        }
    }, [user]);

    const fetchCart = async () => {
        if (!user) return;
        try {
            const response = await fetch('http://localhost:3000/api/cart', {
                headers: { 'user-id': user.id } as HeadersInit
            });
            if (response.ok) {
                const data = await response.json();
                setCartItems(data.items || []);
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        }
    };

    const addToCart = async (productId: string, quantity = 1) => {
        if (!user) {
            alert('Please login to add items to cart');
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': user.id
                } as HeadersInit,
                body: JSON.stringify({ productId, quantity })
            });
            if (response.ok) {
                const data = await response.json();
                setCartItems(data.items || []);
                setIsCartOpen(true);
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        if (!user) return;
        try {
            const response = await fetch(`http://localhost:3000/api/cart/item/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': user.id
                } as HeadersInit,
                body: JSON.stringify({ quantity })
            });
            if (response.ok) {
                fetchCart();
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const removeFromCart = async (itemId: string) => {
        if (!user) return;
        try {
            const response = await fetch(`http://localhost:3000/api/cart/item/${itemId}`, {
                method: 'DELETE',
                headers: { 'user-id': user.id } as HeadersInit
            });
            if (response.ok) {
                fetchCart();
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const clearCart = async () => {
        if (!user) return;
        try {
            const response = await fetch('http://localhost:3000/api/cart/clear', {
                method: 'DELETE',
                headers: { 'user-id': user.id } as HeadersInit
            });
            if (response.ok) {
                setCartItems([]);
            }
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    return (
        <CartContext.Provider value={{
            cartItems,
            cartCount,
            cartTotal,
            isCartOpen,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            toggleCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
