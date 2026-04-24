import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, TrendingUp, Star, Truck, Shield, RotateCcw, Headphones } from 'lucide-react';
import BookCard from '../components/BookCard';
import { categories, banners } from '../data/books';
import { api, normalizeBook } from '../services/api';

export default function HomePage() {
  const [bannerIndex, setBannerIndex] = useState(0);
  const [bestsellers, setBestsellers] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setBannerIndex(i => (i + 1) % banners.length), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const [bestRes, newRes, ratedRes] = await Promise.all([
          api.get('/book?sort=-sold&limit=6'),
          api.get('/book?sort=-createdAt&limit=6'),
          api.get('/book?sort=-rating&limit=4'),
        ]);
        setBestsellers((bestRes.data?.results || []).map(normalizeBook));
        setNewBooks((newRes.data?.results || []).map(normalizeBook));
        setTopRated((ratedRes.data?.results || []).map(normalizeBook));
      } catch (e) {
        console.error('Lỗi tải sách trang chủ:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  return (
    <main>
      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div
          className={`bg-gradient-to-r ${banners[bannerIndex].bg} text-white py-16 px-8 transition-all duration-700`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-2">BookStore 2024</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{banners[bannerIndex].title}</h1>
              <p className="text-lg opacity-90 mb-6 max-w-md">{banners[bannerIndex].subtitle}</p>
              <div className="flex gap-3">
                <Link to="/shop" className="bg-white text-gray-800 font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-shadow">
                  Khám phá ngay
                </Link>
                <Link to="/shop?sort=-sold" className="border-2 border-white text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
                  Xem bán chạy
                </Link>
              </div>
            </div>
            <div className="text-9xl hidden md:block select-none">{banners[bannerIndex].image}</div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setBannerIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${i === bannerIndex ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>

        <button
          onClick={() => setBannerIndex(i => (i - 1 + banners.length) % banners.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setBannerIndex(i => (i + 1) % banners.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </section>

      {/* Features */}
      <section className="bg-orange-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Truck className="text-orange-500" size={28} />, title: 'Miễn phí giao hàng', desc: 'Đơn từ 150.000đ' },
              { icon: <Shield className="text-orange-500" size={28} />, title: 'Hàng chính hãng', desc: '100% sách thật' },
              { icon: <RotateCcw className="text-orange-500" size={28} />, title: 'Đổi trả dễ dàng', desc: '7 ngày đổi trả' },
              { icon: <Headphones className="text-orange-500" size={28} />, title: 'Hỗ trợ 24/7', desc: '1800 6789 miễn phí' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                {f.icon}
                <div>
                  <div className="font-semibold text-sm text-gray-800">{f.title}</div>
                  <div className="text-xs text-gray-500">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-1 h-7 bg-orange-500 rounded-full inline-block"></span>
          Danh mục sách
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/shop?categoryName=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm hover:shadow-md hover:border-orange-300 border border-transparent transition-all text-center"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700 leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      {!loading && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-orange-500" size={24} />
              Sách bán chạy nhất
            </h2>
            <Link to="/shop?sort=-sold" className="text-orange-500 hover:text-orange-600 font-medium text-sm">
              Xem tất cả →
            </Link>
          </div>
          {bestsellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {bestsellers.map(book => <BookCard key={book.id} book={book} />)}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Chưa có sách nào</p>
          )}
        </section>
      )}

      {/* Top rated */}
      {!loading && topRated.length > 0 && (
        <section className="bg-gradient-to-r from-orange-50 to-yellow-50 py-10 my-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Star className="text-yellow-400 fill-yellow-400" size={24} />
                Đánh giá cao nhất
              </h2>
              <Link to="/shop?sort=-rating" className="text-orange-500 hover:text-orange-600 font-medium text-sm">
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topRated.map((book, i) => (
                <div key={book.id} className="card flex gap-3 p-3">
                  <span className="text-3xl font-black text-orange-200 leading-none self-start">#{i + 1}</span>
                  <div className="flex gap-3 flex-1 min-w-0">
                    <Link to={`/book/${book.id}`}>
                      <img src={book.cover} alt={book.title} className="w-14 h-20 object-cover rounded shadow-sm"
                        onError={e => { e.target.src = 'https://via.placeholder.com/56x80?text=📚'; }} />
                    </Link>
                    <div className="min-w-0">
                      <Link to={`/book/${book.id}`}>
                        <h3 className="font-semibold text-sm text-gray-800 hover:text-orange-500 line-clamp-2">{book.title}</h3>
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-yellow-500">{book.rating}</span>
                      </div>
                      <div className="text-sm font-bold text-orange-500 mt-1">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New books */}
      {!loading && newBooks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-7 bg-green-500 rounded-full inline-block"></span>
              Sách mới về
            </h2>
            <Link to="/shop?sort=-createdAt" className="text-orange-500 hover:text-orange-600 font-medium text-sm">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {newBooks.map(book => <BookCard key={book.id} book={book} />)}
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">Đăng ký nhận ưu đãi</h2>
          <p className="opacity-90 mb-6">Nhận ngay voucher 20K cho đơn hàng đầu tiên và cập nhật sách mới nhất</p>
          <div className="flex max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              className="flex-1 px-4 py-3 rounded-xl text-gray-800 text-sm focus:outline-none"
            />
            <button className="bg-white text-orange-500 font-bold px-5 py-3 rounded-xl hover:shadow-lg transition-shadow whitespace-nowrap">
              Đăng ký
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
