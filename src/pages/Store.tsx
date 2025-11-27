import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}

export default function Store() {
    const { addToCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="text-center">Loading products...</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Store</h2>
                    <p className="text-muted-foreground">
                        Browse our amazing products.
                    </p>
                </div>

                {products.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No products available yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <Card key={product.id} className="flex flex-col">
                                <div className="aspect-video overflow-hidden rounded-t-lg bg-muted">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="h-full w-full object-cover transition-transform hover:scale-105"
                                    />
                                </div>
                                <CardHeader>
                                    <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                                    <p className="text-2xl font-bold text-primary">
                                        ${product.price.toFixed(2)}
                                    </p>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col gap-4">
                                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                                        {product.description}
                                    </p>
                                    <Button
                                        className="w-full mt-auto"
                                        onClick={() => addToCart(product.id)}
                                    >
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Add to Cart
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
