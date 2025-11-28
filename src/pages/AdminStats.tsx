// ============================================================================
// Imports
// ============================================================================
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Users, Package, ShoppingCart, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================
interface Stats {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
}

interface RecentOrder {
    id: string;
    status: string;
    total: number;
    createdAt: string;
    user: {
        email: string;
        name: string | null;
    };
    items: Array<{
        quantity: number;
        product: {
            name: string;
        };
    }>;
}

interface LowStockProduct {
    id: string;
    name: string;
    stock: number;
    price: number;
}

interface OrderByStatus {
    status: string;
    _count: {
        status: number;
    };
}

// ============================================================================
// Component
// ============================================================================
export default function AdminStats() {
    // ============================================================================
    // State
    // ============================================================================
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
    const [ordersByStatus, setOrdersByStatus] = useState<OrderByStatus[]>([]);
    const [loading, setLoading] = useState(true);

    // ============================================================================
    // Effects
    // ============================================================================
    useEffect(() => {
        fetchStats();
    }, []);

    // ============================================================================
    // API Calls
    // ============================================================================
    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/admin/stats');
            const data = await response.json();

            setStats(data.stats);
            setRecentOrders(data.recentOrders);
            setLowStockProducts(data.lowStockProducts);
            setOrdersByStatus(data.ordersByStatus);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // ============================================================================
    // Render
    // ============================================================================
    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading stats...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
                    <p className="text-muted-foreground">
                        Overview of your e-commerce platform.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats?.totalRevenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">From delivered orders</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalOrders}</div>
                            <p className="text-xs text-muted-foreground">All time orders</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalProducts}</div>
                            <p className="text-xs text-muted-foreground">In catalog</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalUsers}</div>
                            <p className="text-xs text-muted-foreground">Registered users</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Orders */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentOrders.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No orders yet</p>
                                ) : (
                                    recentOrders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between border-b pb-2">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{order.user.name || order.user.email}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {order.items.length} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold">${order.total.toFixed(2)}</p>
                                                <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Low Stock Warnings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Low Stock Warnings</CardTitle>
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {lowStockProducts.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">All products have sufficient stock</p>
                                ) : (
                                    lowStockProducts.map((product) => (
                                        <div key={product.id} className="flex items-center justify-between border-b pb-2">
                                            <div>
                                                <p className="text-sm font-medium">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">${product.price.toFixed(2)}</p>
                                            </div>
                                            <span className={`text-sm font-bold px-2 py-1 rounded-full ${product.stock === 0 ? 'bg-red-100 text-red-800' :
                                                    product.stock <= 5 ? 'bg-orange-100 text-orange-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {product.stock} left
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Status Breakdown */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            <CardTitle>Orders by Status</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {ordersByStatus.map((item) => (
                                <div key={item.status} className="text-center p-4 border rounded-lg">
                                    <p className="text-2xl font-bold">{item._count.status}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{item.status}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
