import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from './Button';

export default function CartSidebar() {
    const {
        isCartOpen,
        toggleCart,
        cartItems,
        updateQuantity,
        removeFromCart,
        cartTotal
    } = useCart();
    const navigate = useNavigate();

    if (!isCartOpen) return null;

    const handleCheckout = () => {
        toggleCart();
        navigate('/checkout');
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={toggleCart}
            />

            {/* Sidebar */}
            <div className="relative w-full max-w-md bg-background border-l shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        Shopping Cart
                    </h2>
                    <Button variant="ghost" size="sm" onClick={toggleCart}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cartItems.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>Your cart is empty</p>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0">
                                <div className="h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                    <img
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-medium">{item.product.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            ${item.product.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-2 border rounded-md p-1">
                                            <button
                                                className="p-1 hover:bg-muted rounded"
                                                onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="text-sm w-4 text-center">{item.quantity}</span>
                                            <button
                                                className="p-1 hover:bg-muted rounded"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <button
                                            className="text-destructive hover:text-destructive/80 p-1"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t bg-muted/10">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-muted-foreground">Total</span>
                        <span className="text-xl font-bold">${cartTotal.toFixed(2)}</span>
                    </div>
                    <Button
                        className="w-full"
                        size="lg"
                        disabled={cartItems.length === 0}
                        onClick={handleCheckout}
                    >
                        Checkout
                    </Button>
                </div>
            </div>
        </div>
    );
}
