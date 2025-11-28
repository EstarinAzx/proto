// ============================================================================
// Imports
// ============================================================================
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';

// ============================================================================
// Component
// ============================================================================
export default function ForgotPassword() {
    // ============================================================================
    // State
    // ============================================================================
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // ============================================================================
    // Event Handlers
    // ============================================================================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setMessage(data.message);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================================================
    // Render
    // ============================================================================
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-12 text-white">
                <div className="flex items-center gap-2 text-2xl font-bold">
                    <LayoutDashboard className="h-8 w-8" />
                    <span>MyApp</span>
                </div>
                <div>
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Security is not a product, but a process.&rdquo;
                        </p>
                        <footer className="text-sm text-zinc-400">Bruce Schneier</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8">
                <div className="mx-auto w-full max-w-md space-y-6">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold">Forgot Password</h1>
                        <p className="text-muted-foreground">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {message && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-md text-sm">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Send Reset Link
                        </Button>
                    </form>

                    <div className="text-center">
                        <Link to="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
