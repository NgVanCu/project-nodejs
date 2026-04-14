import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, ChevronRight, Minus, Plus, Star, BookOpen, Calendar, Globe, FileText, Check } from 'lucide-react';
import BookCard, { StarRating, formatPrice } from '../components/BookCard';
import { useCart } from '../context/CartContext';
import { api, normalizeBook } from '../services/api';

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [book, setBook] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState('description');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/book/${id}`);
        const normalized = normalizeBook(res.data);
        setBook(normalized);

        // Fetch sách liên quan cùng danh mục
        if (res.data.category?._id || res.data.category) {
          const catId = res.data.category?._id || res.data.category;
          const relRes = await api.get(`/book?category=${catId}&limit=5`);
          const relBooks = (relRes.data?.results || [])
            .map(normalizeBook)
            .filter(b => b.id !== normalized.id)
            .slice(0, 4);
          setRelated(relBooks);
        }
      } catch (e) {
        console.error('Lỗi tải sách:', e);
        setBook(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">
        Đang tải...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy sách</h2>
        <Link to="/shop" className="btn-primary inline-block mt-4">Quay lại cửa hàng</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(book, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(book, quantity);
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-orange-500">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link to="/shop" className="hover:text-orange-500">Cửa hàng</Link>
        {book.category && (
          <>
            <ChevronRight size={14} />
            <Link to={`/shop?categoryName=${encodeURIComponent(book.category)}`} className="hover:text-orange-500">{book.category}</Link>
          </>
        )}
        <ChevronRight size={14} />
        <span className="text-gray-700 truncate max-w-xs">{book.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Left: Image */}
        <div>
          <div className="card p-6 flex items-center justify-center aspect-[3/4] max-h-[500px]">
            <img
              src={book.cover}
              alt={book.title}
              className="max-w-full max-h-full object-contain shadow-xl rounded-lg"
              onError={e => { e.target.src = 'https://via.placeholder.com/300x400?text=📚'; }}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm text-gray-600 hover:border-red-400 hover:text-red-500 transition-colors">
              <Heart size={18} /> Yêu thích
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-colors">
              <Share2 size={18} /> Chia sẻ
            </button>
          </div>
        </div>

        {/* Right: Info */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {book.isBestseller && <span className="badge bg-red-100 text-red-600">🔥 Bán chạy</span>}
            {book.isNew && <span className="badge bg-green-100 text-green-600">✨ Mới</span>}
            {book.category && <span className="badge bg-gray-100 text-gray-600">{book.category}</span>}
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">{book.title}</h1>
          <p className="text-gray-600 mb-1">Tác giả: <span className="text-orange-500 font-medium">{book.author}</span></p>
          {book.publisher && <p className="text-gray-500 text-sm mb-3">NXB: {book.publisher} · {book.year}</p>}

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-yellow-50 rounded-xl">
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-500">{book.rating.toFixed(1)}</div>
              <div className="text-xs text-gray-500">/ 5.0</div>
            </div>
            <div>
              <StarRating rating={book.rating} size={20} />
              <p className="text-sm text-gray-500 mt-0.5">{book.reviewCount.toLocaleString()} đánh giá · {book.sold.toLocaleString()} đã bán</p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-black text-orange-500">{formatPrice(book.price)}</span>
            {book.originalPrice > book.price && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(book.originalPrice)}</span>
                <span className="badge bg-orange-500 text-white text-sm">-{book.discount}%</span>
              </>
            )}
          </div>

          {/* Stock */}
          <p className="text-sm text-gray-500 mb-4">
            Còn lại: <span className={`font-medium ${book.stock < 20 ? 'text-red-500' : 'text-green-600'}`}>{book.stock} cuốn</span>
          </p>

          {/* Book info */}
          {(book.pages || book.language || book.year || book.publisher) && (
            <div className="grid grid-cols-2 gap-3 mb-5">
              {book.pages > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-orange-400"><BookOpen size={16} /></span>
                  <span className="text-gray-400">Số trang:</span>
                  <span className="font-medium">{book.pages} trang</span>
                </div>
              )}
              {book.language && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-orange-400"><Globe size={16} /></span>
                  <span className="text-gray-400">Ngôn ngữ:</span>
                  <span className="font-medium">{book.language}</span>
                </div>
              )}
              {book.year > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-orange-400"><Calendar size={16} /></span>
                  <span className="text-gray-400">Năm:</span>
                  <span className="font-medium">{book.year}</span>
                </div>
              )}
              {book.publisher && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-orange-400"><FileText size={16} /></span>
                  <span className="text-gray-400">NXB:</span>
                  <span className="font-medium">{book.publisher}</span>
                </div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-5">
            <span className="text-sm font-medium text-gray-700">Số lượng:</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-2 font-semibold min-w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(book.stock, q + 1))}
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className="text-sm text-gray-400">Max {book.stock}</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={book.stock === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                added
                  ? 'bg-green-500 text-white'
                  : book.stock === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
              }`}
            >
              {added ? <><Check size={20} /> Đã thêm!</> : <><ShoppingCart size={20} /> Thêm vào giỏ</>}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={book.stock === 0}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 rounded-xl text-base disabled:opacity-50"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-10">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'description', label: 'Mô tả sách' },
            { id: 'details', label: 'Thông tin chi tiết' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {tab === 'description' && (
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {book.description || 'Chưa có mô tả cho sách này.'}
            </p>
          )}
          {tab === 'details' && (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Tên sách', book.title],
                  ['Tác giả', book.author],
                  book.publisher ? ['Nhà xuất bản', book.publisher] : null,
                  book.year ? ['Năm xuất bản', book.year] : null,
                  book.pages ? ['Số trang', `${book.pages} trang`] : null,
                  book.language ? ['Ngôn ngữ', book.language] : null,
                  book.category ? ['Danh mục', book.category] : null,
                ].filter(Boolean).map(([key, val]) => (
                  <tr key={key}>
                    <td className="py-2.5 pr-4 text-gray-500 w-40">{key}</td>
                    <td className="py-2.5 font-medium text-gray-800">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Sách cùng thể loại</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(b => <BookCard key={b.id} book={b} />)}
          </div>
        </section>
      )}
    </div>
  );
}
