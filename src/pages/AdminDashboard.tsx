// ============================================================================
// Imports
// ============================================================================
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Trash2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../lib/api';

// ============================================================================
// Interfaces
// ============================================================================
interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    categoryId?: string;
    category?: Category;
}

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
}

// ============================================================================
// Component & State
// ============================================================================
export default function AdminDashboard() {
    const { user, logout } = useAuth();

    // Tab state
    const [activeTab, setActiveTab] = useState<'products' | 'users' | 'categories'>('products');

    // Data state
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Product form state
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [uploading, setUploading] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        stock: '0',
        imageUrl: '',
        categoryId: '',
    });

    // Category form state
    const [newCategoryName, setNewCategoryName] = useState('');

    // ========================================================================
    // API Fetching
    // ========================================================================

    // Initial data load
    useEffect(() => {
        fetchProducts();
        fetchUsers();
        fetchCategories();
    }, []);

    // Fetch all products
    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/api/products`);
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users`);
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    // Fetch all categories
    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/api/categories`);
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    // ========================================================================
    // Event Handlers
    // ========================================================================

    // Handle product image upload
    const handleImageUpload = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        return data.imageUrl;
    };

    // Create new product
    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch(`${API_URL}/api/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct),
            });
            setNewProduct({ name: '', description: '', price: '', stock: '0', imageUrl: '', categoryId: '' });
            setShowProductForm(false);
            fetchProducts();
        } catch (error) {
            console.error('Failed to create product:', error);
        }
    };

    // Update existing product
    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        try {
            await fetch(`${API_URL}/api/products/${editingProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editingProduct.name,
                    description: editingProduct.description,
                    price: editingProduct.price,
                    stock: editingProduct.stock,
                    imageUrl: editingProduct.imageUrl,
                    categoryId: editingProduct.categoryId,
                }),
            });
            setEditingProduct(null);
            fetchProducts();
        } catch (error) {
            console.error('Failed to update product:', error);
        }
    };

    // Delete product
    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        try {
            await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
            });
            fetchProducts();
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    };

    // Delete user (with self-delete warning)
    const handleDeleteUser = async (id: string, email: string) => {
        const isSelfDelete = user?.id === id;

        const confirmMessage = isSelfDelete
            ? `⚠️ WARNING: You are about to delete your own account (${email})!\n\nThis will:\n• Log you out immediately\n• Permanently delete your account\n• Cannot be undone\n\nAre you absolutely sure?`
            : `Are you sure you want to delete the user "${email}"?\n\nThis action cannot be undone.`;

        if (!confirm(confirmMessage)) return;

        try {
            await fetch(`${API_URL}/api/users/${id}`, {
                method: 'DELETE',
            });

            if (isSelfDelete) {
                logout();
            } else {
                fetchUsers();
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    // Create new category
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            await fetch(`${API_URL}/api/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName }),
            });
            setNewCategoryName('');
            fetchCategories();
        } catch (error) {
            console.error('Failed to create category:', error);
        }
    };

    // Delete category
    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Delete this category?')) return;
        try {
            await fetch(`${API_URL}/api/categories/${id}`, {
                method: 'DELETE',
            });
            fetchCategories();
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };

    // ========================================================================
    // Helper Functions
    // ========================================================================

    // Promote or demote user role
    const handlePromoteUser = async (userId: string, currentRole: string) => {
        let newRole: string;
        let action: string;

        if (currentRole === 'SUPERADMIN') {
            newRole = 'ADMIN';
            action = 'demote to Admin';
        } else if (currentRole === 'ADMIN') {
            newRole = 'USER';
            action = 'demote to User';
        } else {
            newRole = 'ADMIN';
            action = 'promote to Admin';
        }

        if (!confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            await fetch(`${API_URL}/api/users/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': user?.id || '',
                },
                body: JSON.stringify({ role: newRole }),
            });
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user role:', error);
        }
    };

    // ========================================================================
    // Main Render
    // ========================================================================
    return (
        <Layout>
            <div className="space-y-6">
                {/* ============================================================
                    Page Header
                    ============================================================ */}
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                    <p className="text-muted-foreground">
                        Manage products and users.
                    </p>
                </div>

                {/* ============================================================
                    Tabs Navigation
                    ============================================================ */}
                <div className="flex gap-2 border-b">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'products'
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Products
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'users'
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'categories'
                            ? 'border-b-2 border-primary text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Categories
                    </button>
                </div>

                {/* ============================================================
                    Products Tab
                    ============================================================ */}
                {activeTab === 'products' && (
                    <div className="space-y-4">
                        {/* Add Product Button */}
                        <Button onClick={() => setShowProductForm(!showProductForm)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>

                        {/* New Product Form Modal */}
                        {showProductForm && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>New Product</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateProduct} className="space-y-4">
                                        <Input
                                            label="Name"
                                            value={newProduct.name}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, name: e.target.value })
                                            }
                                            required
                                        />
                                        <Input
                                            label="Description"
                                            value={newProduct.description}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, description: e.target.value })
                                            }
                                            required
                                        />
                                        <Input
                                            label="Price"
                                            type="number"
                                            step="0.01"
                                            value={newProduct.price}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, price: e.target.value })
                                            }
                                            required
                                        />
                                        <Input
                                            label="Stock"
                                            type="number"
                                            value={newProduct.stock}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, stock: e.target.value })
                                            }
                                            required
                                        />
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Category
                                            </label>
                                            <select
                                                value={newProduct.categoryId}
                                                onChange={(e) =>
                                                    setNewProduct({ ...newProduct, categoryId: e.target.value })
                                                }
                                                className="w-full px-3 py-2 rounded-md border bg-background"
                                            >
                                                <option value="">No Category</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Product Image
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setUploading(true);
                                                        try {
                                                            const url = await handleImageUpload(file);
                                                            setNewProduct({ ...newProduct, imageUrl: url });
                                                        } catch (error) {
                                                            console.error('Upload failed:', error);
                                                            alert('Image upload failed');
                                                        } finally {
                                                            setUploading(false);
                                                        }
                                                    }
                                                }}
                                                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                                            />
                                            {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
                                            {newProduct.imageUrl && (
                                                <img src={newProduct.imageUrl} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded" />
                                            )}
                                        </div>
                                        <Button type="submit" disabled={uploading}>
                                            {uploading ? 'Uploading...' : 'Create Product'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Edit Product Form Modal */}
                        {editingProduct && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Edit Product</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleUpdateProduct} className="space-y-4">
                                        <Input
                                            label="Name"
                                            value={editingProduct.name}
                                            onChange={(e) =>
                                                setEditingProduct({ ...editingProduct, name: e.target.value })
                                            }
                                            required
                                        />
                                        <Input
                                            label="Description"
                                            value={editingProduct.description}
                                            onChange={(e) =>
                                                setEditingProduct({ ...editingProduct, description: e.target.value })
                                            }
                                            required
                                        />
                                        <Input
                                            label="Price"
                                            type="number"
                                            step="0.01"
                                            value={editingProduct.price.toString()}
                                            onChange={(e) =>
                                                setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })
                                            }
                                            required
                                        />
                                        <Input
                                            label="Stock"
                                            type="number"
                                            value={editingProduct.stock.toString()}
                                            onChange={(e) =>
                                                setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })
                                            }
                                            required
                                        />
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Category
                                            </label>
                                            <select
                                                value={editingProduct.categoryId || ''}
                                                onChange={(e) =>
                                                    setEditingProduct({ ...editingProduct, categoryId: e.target.value || undefined })
                                                }
                                                className="w-full px-3 py-2 rounded-md border bg-background"
                                            >
                                                <option value="">No Category</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Product Image
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setUploading(true);
                                                        try {
                                                            const url = await handleImageUpload(file);
                                                            setEditingProduct({ ...editingProduct, imageUrl: url });
                                                        } catch (error) {
                                                            console.error('Upload failed:', error);
                                                            alert('Image upload failed');
                                                        } finally {
                                                            setUploading(false);
                                                        }
                                                    }
                                                }}
                                                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                                            />
                                            {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
                                            {editingProduct.imageUrl && (
                                                <img src={editingProduct.imageUrl} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded" />
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={uploading}>
                                                {uploading ? 'Uploading...' : 'Update Product'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setEditingProduct(null)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Products Table */}
                        <Card>
                            <CardContent className="p-0">
                                <table className="w-full">
                                    <thead className="border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium">Price</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product.id} className="border-b last:border-0">
                                                <td className="px-6 py-4">{product.name}</td>
                                                <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingProduct(product);
                                                                setShowProductForm(false);
                                                            }}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDeleteProduct(product.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ============================================================
                    Categories Tab
                    ============================================================ */}
                {activeTab === 'categories' && (
                    <div className="space-y-4">
                        {/* Add Category Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Add Category</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateCategory} className="flex gap-2">
                                    <Input
                                        placeholder="Category name (e.g., Electronics, Clothing)"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="flex-1"
                                        required
                                    />
                                    <Button type="submit">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Categories Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Categories</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium">ID</th>
                                            <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((category) => (
                                            <tr key={category.id} className="border-b">
                                                <td className="px-6 py-4">{category.name}</td>
                                                <td className="px-6 py-4 text-xs text-muted-foreground">{category.id}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ============================================================
                    Users Tab
                    ============================================================ */}
                {activeTab === 'users' && (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium">Role</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((userItem) => (
                                        <tr key={userItem.id} className="border-b last:border-0">
                                            <td className="px-6 py-4">{userItem.email}</td>
                                            <td className="px-6 py-4">{userItem.name}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${userItem.role === 'SUPERADMIN'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : userItem.role === 'ADMIN'
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'bg-muted text-muted-foreground'
                                                        }`}
                                                >
                                                    {userItem.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    {user?.role === 'SUPERADMIN' && (
                                                        <Button
                                                            variant={userItem.role === 'USER' ? 'primary' : 'outline'}
                                                            size="sm"
                                                            onClick={() => handlePromoteUser(userItem.id, userItem.role)}
                                                            disabled={userItem.id === user?.id}
                                                        >
                                                            {userItem.role === 'SUPERADMIN'
                                                                ? 'Demote to Admin'
                                                                : userItem.role === 'ADMIN'
                                                                    ? 'Demote to User'
                                                                    : 'Promote to Admin'}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDeleteUser(userItem.id, userItem.email)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
