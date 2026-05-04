import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function StarRating({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={size}
          className={star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}
        />
      ))}
    </div>
  );
}

export function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function BookCard({ book, view = 'grid' }) {
  const { addItem } = useCart();

  if (view === 'list') {
    return (
      <div className="card flex gap-4 p-4 group">
        <Link to={`/book/${book.id}`} className="flex-shrink-0">
          <img
            src={book.cover}
            alt={book.title}
            className="w-28 h-40 object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.src = 'https://via.placeholder.com/112x160?text=Book'; }}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1 mb-1">
            {book.isBestseller && <span className="badge bg-red-100 text-red-600">Bán chạy</span>}
            {book.isNew && <span className="badge bg-green-100 text-green-600">Mới</span>}
            {book.discount > 0 && <span className="badge bg-orange-100 text-orange-600">-{book.discount}%</span>}
          </div>
          <Link to={`/book/${book.id}`}>
            <h3 className="font-semibold text-gray-800 hover:text-orange-500 transition-colors line-clamp-2 mb-1">{book.title}</h3>
          </Link>
          <p className="text-sm text-gray-500 mb-1">{book.author}</p>
          <p className="text-xs text-gray-400 mb-2">{book.category}</p>
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={book.rating} />
            <span className="text-xs text-gray-500">({book.reviewCount.toLocaleString()})</span>
            <span className="text-xs text-gray-400">Đã bán {book.sold.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{book.description}</p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-orange-500">{formatPrice(book.price)}</span>
              {book.originalPrice > book.price && (
                <span className="ml-2 text-sm text-gray-400 line-through">{formatPrice(book.originalPrice)}</span>
              )}
            </div>
            <button
              onClick={() => addItem(book)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <ShoppingCart size={16} /> Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card group relative overflow-hidden">
      {/* Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
        {book.isBestseller && <span className="badge bg-red-500 text-white">Bán chạy</span>}
        {book.isNew && <span className="badge bg-green-500 text-white">Mới</span>}
        {book.discount > 0 && <span className="badge bg-orange-500 text-white">-{book.discount}%</span>}
      </div>

      {/* Cover */}
      <Link to={`/book/${book.id}`} className="block overflow-hidden relative aspect-[3/4] bg-gray-50">
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={e => { e.target.src = 'https://via.placeholder.com/300x400?text=📚'; }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            <Link
              to={`/book/${book.id}`}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-500 hover:text-white transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <Eye size={18} />
            </Link>
            <button
              onClick={(e) => { e.preventDefault(); addItem(book); }}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-500 hover:text-white transition-colors"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-0.5">{book.category}</p>
        <Link to={`/book/${book.id}`}>
          <h3 className="font-semibold text-gray-800 hover:text-orange-500 transition-colors line-clamp-2 text-sm mb-0.5">{book.title}</h3>
        </Link>
        <p className="text-xs text-gray-500 mb-2">{book.author}</p>
        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={book.rating} size={12} />
          <span className="text-xs text-gray-400">({book.reviewCount.toLocaleString()})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-orange-500">{formatPrice(book.price)}</div>
            {book.originalPrice > book.price && (
              <div className="text-xs text-gray-400 line-through">{formatPrice(book.originalPrice)}</div>
            )}
          </div>
          <button
            onClick={() => addItem(book)}
            className="w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
            title="Thêm vào giỏ hàng"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
