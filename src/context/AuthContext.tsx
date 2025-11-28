// ============================================================================
// Imports
// ============================================================================

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType } from '../types/auth';

// ============================================================================
// Interfaces
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// Context Creation
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --------------------------------------------------------------------------
  // Effects - Session Restoration
  // --------------------------------------------------------------------------

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // --------------------------------------------------------------------------
  // Effects - Token Refresh
  // --------------------------------------------------------------------------

  useEffect(() => {
    const refreshToken = async () => {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken || !user) return;

      try {
        const response = await fetch('http://localhost:3000/api/auth/refresh-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token);
        } else {
          // If refresh fails (e.g. expired), logout
          logout();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
      }
    };

    // Refresh on mount and then every 50 minutes (token expires in 60m)
    if (user) {
      refreshToken();
      const interval = setInterval(refreshToken, 50 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // --------------------------------------------------------------------------
  // Authentication Methods
  // --------------------------------------------------------------------------

  const login = async (email: string, password: string): Promise<void> => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const signup = async (email: string, password: string, name: string, username: string): Promise<void> => {
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user?.id) return;

      const response = await fetch('http://localhost:3000/api/users/me', {
        headers: {
          'user-id': user.id,
        },
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  // --------------------------------------------------------------------------
  // Derived State
  // --------------------------------------------------------------------------

  const isAuthenticated = !!user;

  // --------------------------------------------------------------------------
  // Loading State
  // --------------------------------------------------------------------------

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // --------------------------------------------------------------------------
  // Provider Render
  // --------------------------------------------------------------------------

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, refreshUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// Custom Hook
// ============================================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
