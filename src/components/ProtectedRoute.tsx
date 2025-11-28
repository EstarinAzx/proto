// ============================================================================
// Imports
// ============================================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// Props Interface
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// ============================================================================
// ProtectedRoute Component
// ============================================================================

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
