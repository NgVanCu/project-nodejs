import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, Users, ShoppingCart, TrendingUp, Plus, Edit, Trash2, Search, BookOpen, DollarSign, LogOut, LayoutDashboard, Star, MessageSquare, Lock, Unlock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatPrice, StarRating } from '../components/BookCard';
import { api, normalizeBook, normalizeOrder, STATUS_TO_BACKEND } from '../services/api';

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  packing:   'bg-blue-100 text-blue-700',
  shipping:  'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};
const STATUS_LABELS = {
  pending:   'Chờ xác nhận',
  packing:   'Đang đóng gói',
  shipping:  'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [showBookForm, setShowBookForm] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [formData, setFormData] = useState({
    name: '', author: '', price: '', originalPrice: '', category: '',
    quantity: '', description: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [rawBooks, setRawBooks] = useState([]);

  useEffect(() => {
    api.get('/category').then(res => setApiCategories(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'books' || activeTab === 'dashboard' || activeTab === 'reviews') {
      api.get('/book?limit=200').then(res => {
        const raw = res.data?.results || [];
        setRawBooks(raw);
        setBooks(raw.map(normalizeBook));
      }).catch(() => {});
    }
    if (activeTab === 'orders' || activeTab === 'dashboard') {
      api.get('/order').then(res => {
        setOrders((res.data || []).map(normalizeOrder));
      }).catch(() => {});
    }
    if (activeTab === 'customers' || activeTab === 'dashboard') {
      api.get('/user').then(res => {
        setUsers(res.data?.results || []);
      }).catch(() => {});
    }
  }, [activeTab]);

  const handleAdminLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-sm w-full mx-4 text-center bg-white rounded-2xl shadow-lg p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-600 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-400 mb-6">Trang này chỉ dành cho quản trị viên</p>
          <Link to="/" className="btn-primary">Quay lại trang chủ</Link>
        </div>
      </div>
    );
  }

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const openAddForm = () => {
    setEditBook(null);
    setFormData({ name: '', author: '', price: '', originalPrice: '', category: apiCategories[0]?._id || '', quantity: '', description: '' });
    setFormError('');
    setThumbnailFile(null);
    setThumbnailPreview('');
    setShowBookForm(true);
  };
  const openEditForm = (book) => {
    setEditBook(book);
    const catId = apiCategories.find(c => c.name === book.category)?._id || '';
    setFormData({
      name: book.title,
      author: book.author,
      price: book.price,
      originalPrice: book.originalPrice,
      category: catId,
      quantity: book.stock,
      description: book.description,
    });
    setFormError('');
    setThumbnailFile(null);
    setThumbnailPreview(book.cover || '');
    setShowBookForm(true);
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Xác nhận xóa sách này?')) return;
    try {
      await api.delete(`/book/${id}`);
      setBooks(b => b.filter(book => book.id !== id));
    } catch (e) {
      alert('Lỗi xóa sách: ' + e.message);
    }
  };

  const handleSaveBook = async () => {
    if (!formData.name || !formData.author || !formData.price) {
      setFormError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    if (!editBook && !thumbnailFile) {
      setFormError('Vui lòng chọn ảnh bìa cho sách mới');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('author', formData.author);
      fd.append('price', Number(formData.price));
      fd.append('originalPrice', Number(formData.originalPrice) || Number(formData.price));
      if (formData.category) fd.append('category', formData.category);
      fd.append('quantity', Number(formData.quantity) || 0);
      fd.append('description', formData.description);
      if (thumbnailFile) fd.append('thumbnail', thumbnailFile);

      if (editBook) {
        const res = await api.putForm(`/book/${editBook.id}`, fd);
        setBooks(b => b.map(book => book.id === editBook.id ? normalizeBook(res.data) : book));
      } else {
        const res = await api.postForm('/book', fd);
        setBooks(b => [normalizeBook(res.data), ...b]);
      }
      setShowBookForm(false);
    } catch (e) {
      setFormError(e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/order/${orderId}/status`, { status: STATUS_TO_BACKEND[status] });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (e) {
      alert('Lỗi cập nhật trạng thái: ' + e.message);
    }
  };

  const handleBanUser = async (id) => {
    if (!window.confirm('Xác nhận khóa tài khoản này?')) return;
    try {
      await api.delete(`/user/${id}`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, deleted: true } : u));
    } catch (e) {
      alert('Lỗi khóa tài khoản: ' + e.message);
    }
  };

  const handleUnbanUser = async (id) => {
    if (!window.confirm('Xác nhận mở khóa tài khoản này?')) return;
    try {
      await api.put(`/user/${id}/restore`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, deleted: false } : u));
    } catch (e) {
      alert('Lỗi mở khóa tài khoản: ' + e.message);
    }
  };

  const handleDeleteReview = async (bookId, reviewId) => {
    if (!window.confirm('Xác nhận xóa đánh giá này?')) return;
    try {
      await api.delete(`/book/${bookId}/review/${reviewId}`);
      setRawBooks(prev => prev.map(b => {
        if (b._id !== bookId) return b;
        const newReviews = b.reviews.filter(r => r._id !== reviewId);
        const newRating = newReviews.length > 0
          ? newReviews.reduce((s, r) => s + r.rating, 0) / newReviews.length
          : 0;
        return { ...b, reviews: newReviews, numReviews: newReviews.length, rating: newRating };
      }));
    } catch (e) {
      alert('Lỗi xóa đánh giá: ' + e.message);
    }
  };

  // Tổng hợp tất cả reviews từ tất cả sách
  const allReviews = rawBooks.flatMap(b =>
    (b.reviews || []).map(r => ({
      ...r,
      bookId: b._id,
      bookName: b.name,
      bookCover: b.thumbnail,
    }))
  );

  // Sách có rating cao nhất / thấp nhất (chỉ tính sách có ít nhất 1 review)
  const booksWithReviews = rawBooks.filter(b => (b.reviews || []).length > 0);
  const highestRatedBook = booksWithReviews.length > 0
    ? booksWithReviews.reduce((a, b) => b.rating > a.rating ? b : a)
    : null;
  const lowestRatedBook = booksWithReviews.length > 0
    ? booksWithReviews.filter(b => b.name != highestRatedBook.name).reduce((a, b) => b.rating < a.rating ? b : a)
    : null;
  const avgRatingAll = booksWithReviews.length > 0
    ? booksWithReviews.reduce((s, b) => s + b.rating, 0) / booksWithReviews.length
    : 0;

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const TABS = [
    { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard size={18} /> },
    { id: 'books', label: 'Quản lý sách', icon: <BookOpen size={18} /> },
    { id: 'orders', label: 'Đơn hàng', icon: <ShoppingCart size={18} /> },
    { id: 'customers', label: 'Khách hàng', icon: <Users size={18} /> },
    { id: 'reviews', label: 'Đánh giá', icon: <MessageSquare size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-orange-500" size={26} />
            <span className="font-bold text-lg text-gray-800">BookStore</span>
            <span className="text-gray-300 mx-2">|</span>
            <span className="text-sm font-medium text-orange-500">Quản trị viên</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut size={15} /> Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-6 gap-6">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${activeTab === tab.id ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span className={activeTab === tab.id ? 'text-orange-500' : 'text-gray-400'}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Tổng quan</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Doanh thu', value: formatPrice(totalRevenue), icon: <DollarSign size={22} />, color: 'bg-green-500' },
                  { label: 'Đơn hàng', value: orders.length, icon: <ShoppingCart size={22} />, color: 'bg-blue-500' },
                  { label: 'Sách', value: books.length, icon: <BookOpen size={22} />, color: 'bg-orange-500' },
                  { label: 'Khách hàng', value: users.length || '—', icon: <Users size={22} />, color: 'bg-purple-500' },
                ].map((stat, i) => (
                  <div key={i} className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-white`}>
                        {stat.icon}
                      </div>
                    </div>
                    <div className="font-black text-2xl text-gray-800">{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Top books */}
                <div className="card p-4">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-orange-500" /> Sách bán chạy</h3>
                  <div className="space-y-3">
                    {[...books].sort((a, b) => b.sold - a.sold).slice(0, 5).map((book, i) => (
                      <div key={book.id} className="flex items-center gap-3">
                        <span className="text-lg font-black text-gray-200 w-6 text-center">#{i + 1}</span>
                        <img src={book.cover} alt="" className="w-10 h-14 object-cover rounded shadow-sm"
                          onError={e => { e.target.src = 'https://via.placeholder.com/40x56?text=📚'; }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-700 truncate">{book.title}</div>
                          <div className="text-xs text-gray-400">{book.sold.toLocaleString()} đã bán</div>
                        </div>
                        <div className="text-sm font-bold text-orange-500">{formatPrice(book.price)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent orders */}
                <div className="card p-4">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><ShoppingCart size={18} className="text-orange-500" /> Đơn hàng gần đây</h3>
                  <div className="space-y-2">
                    {orders.slice(0, 5).map(o => (
                      <div key={o.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                        <div>
                          <div className="text-sm font-medium text-gray-700">#{o.id.slice(-6).toUpperCase()}</div>
                          <div className="text-xs text-gray-400">{o.date}</div>
                        </div>
                        <div className="text-right">
                          <span className={`badge text-xs ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>{STATUS_LABELS[o.status] || o.status}</span>
                          <div className="text-xs font-bold text-orange-500 mt-0.5">{formatPrice(o.total)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rating summary */}
              {booksWithReviews.length > 0 && (
                <div className="card p-4 mt-6">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Star size={18} className="text-yellow-500" /> Tổng kết đánh giá
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Highest rated */}
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Đánh giá cao nhất</div>
                      <div className="flex items-center gap-3">
                        <img
                          src={highestRatedBook.thumbnail?.startsWith('http') ? highestRatedBook.thumbnail : `/images/book/${highestRatedBook.thumbnail}`}
                          alt="" className="w-10 h-14 object-cover rounded shadow-sm"
                          onError={e => { e.target.src = 'https://via.placeholder.com/40x56?text=📚'; }}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-800 truncate">{highestRatedBook.name}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={13} className="text-yellow-500 fill-yellow-400" />
                            <span className="text-sm font-bold text-yellow-600">{highestRatedBook.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-400">({highestRatedBook.numReviews} đánh giá)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lowest rated */}
                    <div className="bg-red-50 rounded-xl p-4">
                      <div className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Đánh giá thấp nhất</div>
                      <div className="flex items-center gap-3">
                        <img
                          src={lowestRatedBook.thumbnail?.startsWith('http') ? lowestRatedBook.thumbnail : `/images/book/${lowestRatedBook.thumbnail}`}
                          alt="" className="w-10 h-14 object-cover rounded shadow-sm"
                          onError={e => { e.target.src = 'https://via.placeholder.com/40x56?text=📚'; }}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-800 truncate">{lowestRatedBook.name}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={13} className="text-yellow-500 fill-yellow-400" />
                            <span className="text-sm font-bold text-yellow-600">{lowestRatedBook.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-400">({lowestRatedBook.numReviews} đánh giá)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Overall stats */}
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <div className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-2">Tổng quan</div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Tổng đánh giá</span>
                          <span className="font-bold text-gray-800">{allReviews.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Sách có đánh giá</span>
                          <span className="font-bold text-gray-800">{booksWithReviews.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Rating trung bình</span>
                          <span className="font-bold text-yellow-600">{avgRatingAll.toFixed(1)} / 5.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Books management */}
          {activeTab === 'books' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Quản lý sách ({books.length})</h2>
                <button onClick={openAddForm} className="btn-primary flex items-center gap-2">
                  <Plus size={18} /> Thêm sách
                </button>
              </div>

              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm kiếm sách..."
                  className="input-field pl-9 max-w-sm"
                />
              </div>

              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Sách', 'Danh mục', 'Giá', 'Tồn kho', 'Đã bán', 'Hành động'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBooks.map(book => (
                      <tr key={book.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={book.cover} alt="" className="w-10 h-14 object-cover rounded shadow-sm"
                              onError={e => { e.target.src = 'https://via.placeholder.com/40x56?text=📚'; }} />
                            <div>
                              <div className="font-medium text-gray-800 max-w-48 truncate">{book.title}</div>
                              <div className="text-xs text-gray-400">{book.author}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{book.category || '—'}</td>
                        <td className="px-4 py-3 font-semibold text-orange-500">{formatPrice(book.price)}</td>
                        <td className="px-4 py-3">
                          <span className={`font-medium ${book.stock < 20 ? 'text-red-500' : 'text-gray-700'}`}>{book.stock}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{book.sold.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEditForm(book)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                              <Edit size={15} />
                            </button>
                            <button onClick={() => handleDeleteBook(book.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBooks.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Chưa có sách nào</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Book Form Modal */}
              {showBookForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
                    <h3 className="text-lg font-bold mb-4">{editBook ? 'Sửa thông tin sách' : 'Thêm sách mới'}</h3>
                    {formError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm mb-4">{formError}</div>
                    )}
                    <div className="space-y-3">
                      {/* Ảnh bìa */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ảnh bìa {!editBook && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const f = e.target.files[0];
                            if (f) {
                              setThumbnailFile(f);
                              setThumbnailPreview(URL.createObjectURL(f));
                            }
                          }}
                          className="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                        />
                        {thumbnailPreview && (
                          <img src={thumbnailPreview} alt="preview" className="mt-2 h-24 object-cover rounded-lg border border-gray-200" />
                        )}
                      </div>

                      {[
                        { field: 'name', label: 'Tên sách *', placeholder: 'Nhập tên sách' },
                        { field: 'author', label: 'Tác giả *', placeholder: 'Nhập tên tác giả' },
                        { field: 'price', label: 'Giá bán (đồng) *', placeholder: '89000', type: 'number' },
                        { field: 'originalPrice', label: 'Giá gốc (đồng)', placeholder: '120000', type: 'number' },
                        { field: 'quantity', label: 'Tồn kho', placeholder: '100', type: 'number' },
                      ].map(({ field, label, placeholder, type }) => (
                        <div key={field}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                          <input
                            type={type || 'text'}
                            value={formData[field]}
                            onChange={e => setFormData(f => ({ ...f, [field]: e.target.value }))}
                            placeholder={placeholder}
                            className="input-field"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                        <select
                          value={formData.category}
                          onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                          className="input-field"
                        >
                          <option value="">-- Chọn danh mục --</option>
                          {apiCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea
                          value={formData.description}
                          onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                          rows={3}
                          className="input-field resize-none"
                          placeholder="Mô tả sách..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button onClick={() => setShowBookForm(false)} className="btn-secondary flex-1 py-2.5">Hủy</button>
                      <button onClick={handleSaveBook} disabled={formLoading} className="btn-primary flex-1 py-2.5 disabled:opacity-60">
                        {formLoading ? 'Đang lưu...' : (editBook ? 'Cập nhật' : 'Thêm sách')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Quản lý đơn hàng ({orders.length})</h2>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Mã đơn', 'Ngày đặt', 'Sản phẩm', 'Tổng tiền', 'Trạng thái', 'Hành động'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono font-semibold text-gray-700">#{order.id.slice(-6).toUpperCase()}</td>
                        <td className="px-4 py-3 text-gray-500">{order.date}</td>
                        <td className="px-4 py-3 text-gray-600">{order.items.length} sản phẩm</td>
                        <td className="px-4 py-3 font-semibold text-orange-500">{formatPrice(order.total)}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'packing')}
                                  className="text-xs text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50"
                                >
                                  Xác nhận
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                  className="text-xs text-red-500 border border-red-200 rounded px-2 py-1 hover:bg-red-50"
                                >
                                  Hủy
                                </button>
                              </>
                            )}
                            {order.status === 'packing' && (
                              <>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'shipping')}
                                  className="text-xs text-purple-600 border border-purple-200 rounded px-2 py-1 hover:bg-purple-50"
                                >
                                  Giao hàng
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                  className="text-xs text-red-500 border border-red-200 rounded px-2 py-1 hover:bg-red-50"
                                >
                                  Hủy đơn
                                </button>
                              </>
                            )}
                            {order.status === 'shipping' && (
                              <>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                  className="text-xs text-green-600 border border-green-200 rounded px-2 py-1 hover:bg-green-50"
                                >
                                  Hoàn thành
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                  className="text-xs text-red-500 border border-red-200 rounded px-2 py-1 hover:bg-red-50"
                                >
                                  Hoàn hàng
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Chưa có đơn hàng nào</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Customers */}
          {activeTab === 'customers' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Quản lý khách hàng ({users.length})
                {users.filter(u => u.deleted).length > 0 && (
                  <span className="ml-2 text-sm font-normal text-red-500">
                    ({users.filter(u => u.deleted).length} đang bị khóa)
                  </span>
                )}
              </h2>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Tên', 'Email', 'Số điện thoại', 'Vai trò', 'Trạng thái', 'Hành động'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(u => (
                      <tr key={u._id} className={`hover:bg-gray-50 ${u.deleted ? 'bg-red-50/40' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${u.deleted ? 'bg-gray-200 text-gray-400' : 'bg-orange-100 text-orange-600'}`}>
                              {u.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className={`font-medium ${u.deleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                        <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${u.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                            {u.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.deleted ? (
                            <span className="badge bg-red-100 text-red-600 flex items-center gap-1 w-fit">
                              <Lock size={11} /> Đã khóa
                            </span>
                          ) : (
                            <span className="badge bg-green-100 text-green-600 flex items-center gap-1 w-fit">
                              <Unlock size={11} /> Hoạt động
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {u.role !== 'admin' && (
                            u.deleted ? (
                              <button
                                onClick={() => handleUnbanUser(u._id)}
                                className="flex items-center gap-1 text-xs text-green-600 border border-green-200 rounded px-2 py-1 hover:bg-green-50"
                                title="Mở khóa tài khoản"
                              >
                                <Unlock size={13} /> Mở khóa
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBanUser(u._id)}
                                className="flex items-center gap-1 text-xs text-red-500 border border-red-200 rounded px-2 py-1 hover:bg-red-50"
                                title="Khóa tài khoản"
                              >
                                <Lock size={13} /> Khóa
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Chưa có khách hàng</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Reviews management */}
          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quản lý đánh giá ({allReviews.length})</h2>

              {/* Summary cards */}
              {booksWithReviews.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Đánh giá cao nhất</div>
                    <div className="flex items-center gap-3">
                      <img
                        src={highestRatedBook.thumbnail?.startsWith('http') ? highestRatedBook.thumbnail : `/images/book/${highestRatedBook.thumbnail}`}
                        alt="" className="w-10 h-14 object-cover rounded shadow-sm"
                        onError={e => { e.target.src = 'https://via.placeholder.com/40x56?text=📚'; }}
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">{highestRatedBook.name}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={13} className="text-yellow-500 fill-yellow-400" />
                          <span className="text-sm font-bold text-yellow-600">{highestRatedBook.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-400">({highestRatedBook.numReviews} đánh giá)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Đánh giá thấp nhất</div>
                    <div className="flex items-center gap-3">
                      <img
                        src={lowestRatedBook.thumbnail?.startsWith('http') ? lowestRatedBook.thumbnail : `/images/book/${lowestRatedBook.thumbnail}`}
                        alt="" className="w-10 h-14 object-cover rounded shadow-sm"
                        onError={e => { e.target.src = 'https://via.placeholder.com/40x56?text=📚'; }}
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">{lowestRatedBook.name}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={13} className="text-yellow-500 fill-yellow-400" />
                          <span className="text-sm font-bold text-yellow-600">{lowestRatedBook.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-400">({lowestRatedBook.numReviews} đánh giá)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-2">Tổng quan</div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tổng đánh giá</span>
                        <span className="font-bold text-gray-800">{allReviews.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Sách có đánh giá</span>
                        <span className="font-bold text-gray-800">{booksWithReviews.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Rating trung bình</span>
                        <span className="font-bold text-yellow-600">{avgRatingAll.toFixed(1)} / 5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews table */}
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Sách', 'Người đánh giá', 'Sao', 'Nội dung', 'Ngày', 'Hành động'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allReviews.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Chưa có đánh giá nào</td>
                      </tr>
                    ) : (
                      allReviews.map((r, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={r.bookCover?.startsWith('http') ? r.bookCover : `/images/book/${r.bookCover}`}
                                alt="" className="w-8 h-11 object-cover rounded shadow-sm flex-shrink-0"
                                onError={e => { e.target.src = 'https://via.placeholder.com/32x44?text=📚'; }}
                              />
                              <span className="text-gray-700 font-medium max-w-32 truncate">{r.bookName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">
                                {r.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <span className="text-gray-700">{r.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Star size={13} className="text-yellow-500 fill-yellow-400" />
                              <span className="font-semibold text-gray-800">{r.rating}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-48">
                            <span className="line-clamp-2">{r.comment || <span className="text-gray-300 italic">Không có nhận xét</span>}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDeleteReview(r.bookId, r._id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                              title="Xóa đánh giá"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
