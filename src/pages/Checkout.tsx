import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    const [formData, setFormData] = useState({
        address: '',
        city: '',
        zipCode: '',
        country: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In a real app, you would send the order to the backend here
        console.log('Order placed:', {
            items: cartItems,
            total: cartTotal,
            shipping: formData,
            user: user?.id
        });

        await clearCart();
        setIsProcessing(false);
        alert('Order placed successfully!');
        navigate('/dashboard');
    };

    if (cartItems.length === 0) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                    <Button onClick={() => navigate('/store')}>Go to Store</Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Shipping & Payment Form */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    label="Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="City"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <Input
                                        label="ZIP Code"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <Input
                                    label="Country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    required
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    label="Card Number"
                                    name="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={handleInputChange}
                                    placeholder="0000 0000 0000 0000"
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Expiry Date"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleInputChange}
                                        placeholder="MM/YY"
                                        required
                                    />
                                    <Input
                                        label="CVV"
                                        name="cvv"
                                        value={formData.cvv}
                                        onChange={handleInputChange}
                                        placeholder="123"
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span>{item.product.name} x {item.quantity}</span>
                                            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-4 mt-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>${cartTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span>Free</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                            <span>Total</span>
                                            <span>${cartTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full mt-6"
                                        size="lg"
                                        onClick={handleSubmit}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Processing...' : 'Place Order'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
