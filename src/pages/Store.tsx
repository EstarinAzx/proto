import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category?: Category;
}

export default function Store() {
    const { addToCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);

    const [debouncedSearch, setDebouncedSearch] = useState(search);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch when debounced search or price changes
    useEffect(() => {
        fetchProducts();
    }, [debouncedSearch, priceRange.min, priceRange.max, selectedCategory]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            // Don't set loading to true on every keystroke to avoid flickering
            // Only set it on initial load or if you want a spinner
            // setLoading(true); 

            const params = new URLSearchParams();
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (priceRange.min) params.append('minPrice', priceRange.min);
            if (priceRange.max) params.append('maxPrice', priceRange.max);
            if (selectedCategory) params.append('categoryId', selectedCategory);

            const response = await fetch(`http://localhost:3000/api/products?${params.toString()}`);
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Remove manual submit handler since we use effects now
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
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

                <div className="bg-card p-4 rounded-lg border shadow-sm">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full px-3 py-2 rounded-md border bg-background"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 rounded-md border bg-background"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Min Price"
                                className="w-24 px-3 py-2 rounded-md border bg-background"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Max Price"
                                className="w-24 px-3 py-2 rounded-md border bg-background"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                            />
                        </div>
                        {(search || priceRange.min || priceRange.max || selectedCategory) && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSearch('');
                                    setPriceRange({ min: '', max: '' });
                                    setSelectedCategory('');
                                }}
                            >
                                Clear
                            </Button>
                        )}
                    </form>
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
