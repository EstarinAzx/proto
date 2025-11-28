// ============================================================================
// Imports
// ============================================================================
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { Package, Check, X, Truck, Clock } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================
interface Order {
    id: string;
    userId: string;
    user: {
        name: string;
        email: string;
    };
    status: string;
    total: number;
    createdAt: string;
    items: {
        id: string;
        quantity: number;
        price: number;
        product: {
            name: string;
            imageUrl: string;
        };
    }[];
    address: string;
    city: string;
    zipCode: string;
    country: string;
}

// ============================================================================
// Component
// ============================================================================
export default function AdminOrders() {
    // ============================================================================
    // State
    // ============================================================================
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // ============================================================================
    // Effects
    // ============================================================================
    useEffect(() => {
        fetchOrders();
    }, []);

    // ============================================================================
    // API Calls
    // ============================================================================
    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/orders/all', {
                headers: {
                    'user-id': user?.id || ''
                }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': user?.id || ''
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                setOrders(orders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    // ============================================================================
    // Helper Functions
    // ============================================================================
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'PROCESSING': return 'bg-blue-100 text-blue-800';
            case 'SHIPPED': return 'bg-purple-100 text-purple-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="h-4 w-4 mr-1" />;
            case 'PROCESSING': return <Package className="h-4 w-4 mr-1" />;
            case 'SHIPPED': return <Truck className="h-4 w-4 mr-1" />;
            case 'DELIVERED': return <Check className="h-4 w-4 mr-1" />;
            case 'CANCELLED': return <X className="h-4 w-4 mr-1" />;
            default: return <Package className="h-4 w-4 mr-1" />;
        }
    };

    // ============================================================================
    // Render
    // ============================================================================
    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
                    <div className="text-sm text-muted-foreground">
                        Total Orders: {orders.length}
                    </div>
                </div>

                {loading ? (
                    <p>Loading orders...</p>
                ) : (
                    <div className="grid gap-4">
                        {orders.map((order) => (
                            <Card key={order.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base">
                                            Order #{order.id.slice(0, 8)}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(order.createdAt).toLocaleString()} • {order.user.name} ({order.user.email})
                                        </p>
                                    </div>
                                    <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            className="bg-transparent border-0 p-0 text-xs font-semibold focus:ring-0 cursor-pointer"
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="PROCESSING">Processing</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="DELIVERED">Delivered</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mt-4 space-y-4">
                                        <div className="text-sm">
                                            <p className="font-semibold mb-1">Shipping Address:</p>
                                            <p className="text-muted-foreground">
                                                {order.address}, {order.city}, {order.zipCode}, {order.country}
                                            </p>
                                        </div>

                                        <div className="border-t pt-4">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between py-2">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={item.product.imageUrl}
                                                            alt={item.product.name}
                                                            className="h-8 w-8 rounded object-cover"
                                                        />
                                                        <span className="text-sm">
                                                            {item.quantity}x {item.product.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between pt-2 mt-2 border-t font-bold">
                                                <span>Total</span>
                                                <span>${order.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
