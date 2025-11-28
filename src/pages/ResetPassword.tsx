// ============================================================================
// Imports
// ============================================================================
import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';

// ============================================================================
// Component
// ============================================================================
export default function ResetPassword() {
    // ============================================================================
    // State
    // ============================================================================
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // ============================================================================
    // Event Handlers
    // ============================================================================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch('http://localhost:3000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setMessage('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================================================
    // Render
    // ============================================================================
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-destructive">Invalid Link</h1>
                    <p>This password reset link is invalid or missing a token.</p>
                    <Link to="/login">
                        <Button>Back to Login</Button>
                    </Link>
                </div>
            </div>
        );
    }

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
                            &ldquo;Passwords are like underwear: you don't let people see it, you should change it often, and you shouldn't share it with strangers.&rdquo;
                        </p>
                        <footer className="text-sm text-zinc-400">Chris Pirillo</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8">
                <div className="mx-auto w-full max-w-md space-y-6">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold">Reset Password</h1>
                        <p className="text-muted-foreground">
                            Enter your new password below.
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
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Reset Password
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
