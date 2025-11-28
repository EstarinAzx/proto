// ============================================================================
// Imports
// ============================================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// Props Interface
// ============================================================================

interface AdminRouteProps {
    children: React.ReactNode;
}

// ============================================================================
// AdminRoute Component
// ============================================================================

export default function AdminRoute({ children }: AdminRouteProps) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
