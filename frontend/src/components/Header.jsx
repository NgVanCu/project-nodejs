import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, BookOpen, LogOut, Package, Settings } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { categories as staticCategories } from '../data/books';
import { api } from '../services/api';

export default function Header() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [apiCategories, setApiCategories] = useState([]);

  useEffect(() => {
    api.get('/category').then(res => {
      const data = res.data || [];
      setApiCategories(data.map(cat => {
        const s = staticCategories.find(c => c.name === cat.name);
        return { ...cat, icon: s?.icon || '📚' };
      }));
    }).catch(() => setApiCategories(staticCategories));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-orange-500 text-white text-sm py-1.5 px-4 text-center">
        Hệ thống Online Bookstore
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <BookOpen className="text-orange-500" size={32} />
          <div>
            <div className="font-bold text-xl text-orange-500 leading-none">BookStore</div>
            <div className="text-xs text-gray-400">Nhà sách online</div>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
          <div className="flex w-full border-2 border-orange-400 rounded-lg overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sách, tác giả, thể loại..."
              className="flex-1 px-4 py-2 text-sm focus:outline-none"
            />
            <button type="submit" className="bg-orange-500 text-white px-4 py-2 hover:bg-orange-600 transition-colors">
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-auto md:ml-0">
          {/* Cart */}
          <Link to="/cart" className="relative flex items-center gap-1 hover:text-orange-500 transition-colors p-2">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
            <span className="hidden sm:block text-sm font-medium">Giỏ hàng</span>
          </Link>

          {/* User */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 hover:text-orange-500 transition-colors p-2"
              >
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <span className="hidden sm:block text-sm font-medium max-w-24 truncate">{user?.name}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="font-semibold text-sm text-gray-800">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700">
                    <User size={16} /> Tài khoản của tôi
                  </Link>
                  <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700">
                    <Package size={16} /> Đơn hàng
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm text-orange-600 font-medium">
                      <Settings size={16} /> Quản trị
                    </Link>
                  )}
                  <hr className="my-1" />
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm text-red-500 w-full text-left">
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1 hover:text-orange-500 transition-colors p-2">
              <User size={24} />
              <span className="hidden sm:block text-sm font-medium">Đăng nhập</span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Nav categories */}
      <nav className="border-t border-gray-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex gap-1 overflow-x-auto">
            <li>
              <Link to="/shop" className="flex items-center gap-1 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors whitespace-nowrap">
                Tất cả sách
              </Link>
            </li>
            {apiCategories.map(cat => (
              <li key={cat._id || cat.id}>
                <Link
                  to={`/shop?categoryName=${encodeURIComponent(cat.name)}`}
                  className="flex items-center gap-1 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>{cat.icon}</span> {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <form onSubmit={handleSearch} className="p-3">
            <div className="flex border-2 border-orange-400 rounded-lg overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sách..."
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
              />
              <button type="submit" className="bg-orange-500 text-white px-3">
                <Search size={16} />
              </button>
            </div>
          </form>
          <div className="px-3 pb-3 grid grid-cols-2 gap-2">
            {apiCategories.map(cat => (
              <Link
                key={cat._id || cat.id}
                to={`/shop?categoryName=${encodeURIComponent(cat.name)}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 rounded-lg"
              >
                <span>{cat.icon}</span> {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
