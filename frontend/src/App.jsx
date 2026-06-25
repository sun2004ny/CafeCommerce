import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext.jsx';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContent.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute.jsx';
import AdminOutlet from './components/admin/AdminOutlet.jsx';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/admin/AdminLayout.jsx';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage.jsx';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminUserDetail from './pages/admin/AdminUserDetail.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AdminProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1a1a26',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: { primary: '#f97316', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#fff' },
                },
              }}
            />

            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route path="/admin-panel" element={<AdminOutlet />}>
                <Route index element={<AdminLoginPage />} />
                <Route
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="users/:userId" element={<AdminUserDetail />} />
                </Route>
              </Route>

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
        </AdminProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
