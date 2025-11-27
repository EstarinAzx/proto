import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';
import {
    LayoutDashboard,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    ShoppingBag,
    Package
} from 'lucide-react';
import { Button } from './Button';
import CartSidebar from './CartSidebar';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { user, logout } = useAuth();
    const { toggleCart, cartCount } = useCart();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Store', href: '/store', icon: ShoppingBag },
        { name: 'Orders', href: '/admin/orders', icon: Package },
        { name: 'Analytics', href: '/admin/stats', icon: LayoutDashboard },
        { name: 'Admin', href: '/admin', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-background">
            <CartSidebar />

            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
                <span className="font-bold text-xl">MyApp</span>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleCart} className="relative">
                        <ShoppingBag className="h-6 w-6" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b">
                            <h1 className="text-2xl font-bold text-primary">MyApp</h1>
                        </div>

                        <nav className="flex-1 p-4 space-y-1">
                            {navigation
                                .filter(item => (item.name !== 'Admin' && item.name !== 'Orders' && item.name !== 'Analytics') || user?.role === 'ADMIN' || user?.role === 'SUPERADMIN')
                                .map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={cn(
                                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                                isActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                            )}
                                        >
                                            <Icon className="mr-3 h-5 w-5" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                        </nav>

                        <div className="p-4 border-t space-y-2">
                            <Link
                                to="/profile"
                                className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors group"
                            >
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    {user?.name?.[0] || 'U'}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-sm font-medium truncate text-foreground">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user?.username || user?.email}</p>
                                </div>
                            </Link>
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={logout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Top bar for desktop */}
                        <div className="hidden lg:flex justify-end mb-6 gap-2">
                            <Button variant="ghost" size="icon" onClick={toggleCart} className="relative">
                                <ShoppingBag className="h-5 w-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Bell className="h-5 w-5" />
                            </Button>
                        </div>
                        {children}
                    </div>
                </main>
            </div>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
