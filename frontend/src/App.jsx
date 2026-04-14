import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
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

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Login không có header/footer */}
          <Route path="/login" element={<LoginPage />} />

          {/* Các trang có layout chung */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/shop" element={<Layout><ShopPage /></Layout>} />
          <Route path="/book/:id" element={<Layout><BookDetailPage /></Layout>} />
          <Route path="/cart" element={<Layout><CartPage /></Layout>} />
          <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
          <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
          <Route path="/orders" element={<Layout><OrderHistoryPage /></Layout>} />
          <Route path="/admin" element={<Layout><AdminPage /></Layout>} />

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
