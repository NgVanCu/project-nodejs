import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, Box, Truck, CheckCircle, XCircle, Search, Star, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../components/BookCard';
import { api, normalizeOrder } from '../services/api';

const STATUS_MAP = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700',  icon: <Clock size={14} /> },
  packing:   { label: 'Đang đóng gói', color: 'bg-blue-100 text-blue-700',    icon: <Box size={14} /> },
  shipping:  { label: 'Đang giao',     color: 'bg-purple-100 text-purple-700', icon: <Truck size={14} /> },
  completed: { label: 'Hoàn thành',    color: 'bg-green-100 text-green-700',   icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Đã hủy',        color: 'bg-red-100 text-red-700',       icon: <XCircle size={14} /> },
};

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className="p-0.5"
        >
          <Star
            size={28}
            className={`transition-colors ${s <= (hovered || value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [reviewModal, setReviewModal] = useState(null); // { bookId, bookTitle, orderId }
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewedBooks, setReviewedBooks] = useState(new Set());

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const res = await api.get('/order/my');
        setOrders((res.data || []).map(normalizeOrder));
      } catch (e) {
        console.error('Lỗi tải đơn hàng:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-600 mb-4">Vui lòng đăng nhập</h2>
        <Link to="/login" className="btn-primary">Đăng nhập</Link>
      </div>
    );
  }

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search && !o.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openReview = (bookId, bookTitle, orderId) => {
    setReviewModal({ bookId, bookTitle, orderId });
    setReviewForm({ rating: 5, comment: '' });
    setReviewError('');
  };

  const handleSubmitReview = async () => {
    setReviewLoading(true);
    setReviewError('');
    try {
      await api.post(`/book/${reviewModal.bookId}/review`, {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewedBooks(prev => new Set([...prev, reviewModal.bookId]));
      setReviewModal(null);
    } catch (e) {
      setReviewError(e.message);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-orange-500">Trang chủ</Link>
        <ChevronRight size={14} />
        <span className="text-gray-700">Đơn hàng của tôi</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Đơn hàng của tôi</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'all',       label: 'Tất cả' },
            { id: 'pending',   label: 'Chờ xác nhận' },
            { id: 'packing',   label: 'Đang đóng gói' },
            { id: 'shipping',  label: 'Đang giao' },
            { id: 'completed', label: 'Hoàn thành' },
            { id: 'cancelled', label: 'Đã hủy' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm mã đơn hàng..."
            className="input-field pl-9 w-48 text-sm"
          />
        </div>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package size={64} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Không có đơn hàng nào</h3>
          <Link to="/shop" className="btn-primary inline-block mt-3">Mua hàng ngay</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
            return (
              <div key={order.id} className="card p-5">
                {/* Order header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">#{order.id.slice(-8).toUpperCase()}</span>
                      <span className={`badge flex items-center gap-1 ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Ngày đặt: {order.date} · {order.items.length} sản phẩm
                    </div>
                  </div>
                  <div className="font-bold text-orange-500">{formatPrice(order.total)}</div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img
                        src={item.cover}
                        alt={item.title}
                        className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0"
                        onError={e => { e.target.src = 'https://via.placeholder.com/40x56?text=📚'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{item.title}</p>
                        <p className="text-xs text-gray-400">×{item.quantity} · {formatPrice(item.price * item.quantity)}</p>
                      </div>
                      {/* Nút đánh giá - chỉ hiện khi đơn Hoàn thành */}
                      {order.status === 'completed' && (
                        reviewedBooks.has(item.id) ? (
                          <span className="text-xs text-green-600 flex items-center gap-1 flex-shrink-0">
                            <Star size={12} className="fill-yellow-400 text-yellow-400" /> Đã đánh giá
                          </span>
                        ) : (
                          <button
                            onClick={() => openReview(item.id, item.title, order.id)}
                            className="flex-shrink-0 text-xs border border-orange-300 text-orange-500 hover:bg-orange-50 rounded-lg px-2 py-1 transition-colors"
                          >
                            Đánh giá
                          </button>
                        )
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-400">{order.address}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Viết đánh giá</h3>
              <button onClick={() => setReviewModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
              <span className="font-medium text-gray-700">{reviewModal.bookTitle}</span>
            </p>

            {reviewError && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm mb-4">
                {reviewError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn</label>
              <StarPicker value={reviewForm.rating} onChange={v => setReviewForm(f => ({ ...f, rating: v }))} />
              <p className="text-xs text-gray-400 mt-1">
                {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'][reviewForm.rating]}
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nhận xét</label>
              <textarea
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                rows={3}
                placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
                className="input-field resize-none text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setReviewModal(null)} className="btn-secondary flex-1 py-2.5">
                Hủy
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={reviewLoading}
                className="btn-primary flex-1 py-2.5 disabled:opacity-60"
              >
                {reviewLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
