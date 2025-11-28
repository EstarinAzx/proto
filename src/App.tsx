// ============================================================================
// Imports
// ============================================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Store from './pages/Store';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminStats from './pages/AdminStats';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// ============================================================================
// Main Component
// ============================================================================
export default function App() {
  return (
    // ========================================================================
    // State Providers
    // ========================================================================
    <AuthProvider>
      <CartProvider>
        {/* ==================================================================
            Router Config
            ================================================================== */}
        <BrowserRouter>
          <Routes>
            {/* ==============================================================
                Public Routes
                ============================================================== */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ==============================================================
                Protected Routes (Authenticated Users)
                ============================================================== */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/store" element={
              <ProtectedRoute>
                <Store />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* ==============================================================
                Admin Routes (Admin/SuperAdmin Only)
                ============================================================== */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/orders" element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            } />
            <Route path="/admin/stats" element={
              <AdminRoute>
                <AdminStats />
              </AdminRoute>
            } />

            {/* ==============================================================
                Fallback Route
                ============================================================== */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
