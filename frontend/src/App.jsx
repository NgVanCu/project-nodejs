import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import BookDetailPage from './pages/BookDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminPage from './pages/AdminPage';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

// Bảo vệ các route shop: admin không được vào, tự redirect về /admin
function ShopRoute({ children }) {
  const { user, loadingAuth } = useAuth();
  if (loadingAuth) return null;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Login không có header/footer */}
          <Route path="/login" element={<LoginPage />} />

          {/* Các trang shop — admin bị redirect về /admin */}
          <Route path="/" element={<ShopRoute><HomePage /></ShopRoute>} />
          <Route path="/shop" element={<ShopRoute><ShopPage /></ShopRoute>} />
          <Route path="/book/:id" element={<ShopRoute><BookDetailPage /></ShopRoute>} />
          <Route path="/cart" element={<ShopRoute><CartPage /></ShopRoute>} />
          <Route path="/checkout" element={<ShopRoute><CheckoutPage /></ShopRoute>} />
          <Route path="/profile" element={<ShopRoute><ProfilePage /></ShopRoute>} />
          <Route path="/orders" element={<ShopRoute><OrderHistoryPage /></ShopRoute>} />
          <Route path="/admin" element={<AdminPage />} />

          {/* 404 */}
          <Route path="*" element={
            <Layout>
              <div className="flex flex-col items-center justify-center min-h-96 text-center px-4">
                <div className="text-8xl mb-4">📚</div>
                <h1 className="text-4xl font-black text-gray-300 mb-2">404</h1>
                <p className="text-gray-500 mb-6">Trang bạn tìm kiếm không tồn tại</p>
                <a href="/" className="btn-primary px-8 py-3">Về trang chủ</a>
              </div>
            </Layout>
          } />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
