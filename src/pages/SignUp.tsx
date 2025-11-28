// ============================================================================
// Imports
// ============================================================================
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { LayoutDashboard } from 'lucide-react';

// ============================================================================
// Component
// ============================================================================
export default function SignUp() {
  // ============================================================================
  // State
  // ============================================================================
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // ============================================================================
  // Event Handlers
  // ============================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(email, password, name, username);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to signup', error);
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
              &ldquo;The best way to predict the future is to create it.&rdquo;
            </p>
            <footer className="text-sm text-zinc-400">Peter Drucker</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-muted-foreground">
              Enter your details below to create your account
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Username"
              type="text"
              placeholder="john_doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account
            </Button>
          </form>
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="underline underline-offset-4 hover:text-primary">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
