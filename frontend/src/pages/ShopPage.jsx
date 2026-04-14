import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, List, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import BookCard from '../components/BookCard';
import { categories as staticCategories } from '../data/books';
import { api, normalizeBook } from '../services/api';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Mới nhất' },
  { value: '-sold', label: 'Bán chạy nhất' },
  { value: '-rating', label: 'Đánh giá cao nhất' },
  { value: 'price', label: 'Giá: Thấp → Cao' },
  { value: '-price', label: 'Giá: Cao → Thấp' },
];

const PRICE_RANGES = [
  { label: 'Tất cả', min: '', max: '' },
  { label: 'Dưới 50.000đ', min: '', max: 50000 },
  { label: '50.000 - 100.000đ', min: 50000, max: 100000 },
  { label: '100.000 - 200.000đ', min: 100000, max: 200000 },
  { label: 'Trên 200.000đ', min: 200000, max: '' },
];

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryNameParam = searchParams.get('categoryName') || '';
  const sortParam = searchParams.get('sort') || '-createdAt';

  const [view, setView] = useState('grid');
  const [sort, setSort] = useState(sortParam);
  const [selectedCategoryName, setSelectedCategoryName] = useState(categoryNameParam);
  const [priceRange, setPriceRange] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiCategories, setApiCategories] = useState([]);
  const PER_PAGE = 12;

  // Fetch danh mục từ API
  useEffect(() => {
    api.get('/category').then(res => {
      setApiCategories(res.data || []);
    }).catch(() => {});
  }, []);

  // Kết hợp icon tĩnh vào danh mục từ API
  const categories = apiCategories.map(cat => {
    const staticCat = staticCategories.find(s => s.name === cat.name);
    return { ...cat, icon: staticCat?.icon || '📚' };
  });

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('name', searchQuery);
      if (selectedCategoryName) {
        const found = apiCategories.find(c => c.name === selectedCategoryName);
        if (found) params.set('category', found._id);
      }
      const range = PRICE_RANGES[priceRange];
      if (range.min !== '') params.set('minPrice', range.min);
      if (range.max !== '') params.set('maxPrice', range.max);
      params.set('sort', sort);
      params.set('page', page);
      params.set('limit', PER_PAGE);

      const res = await api.get(`/book?${params.toString()}`);
      setBooks((res.data?.results || []).map(normalizeBook));
      setTotalItems(res.data?.totalItems || 0);
      setTotalPages(res.data?.totalPages || 1);
    } catch (e) {
      console.error('Lỗi tải sách:', e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategoryName, priceRange, sort, page, apiCategories]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  // Reset page khi filter thay đổi
  useEffect(() => { setPage(1); }, [searchQuery, selectedCategoryName, priceRange, sort]);

  const clearFilters = () => {
    setSelectedCategoryName('');
    setPriceRange(0);
    setSort('-createdAt');
    setPage(1);
  };

  const hasFilters = selectedCategoryName !== '' || priceRange !== 0 || sort !== '-createdAt';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {searchQuery ? `Kết quả tìm kiếm: "${searchQuery}"` :
              selectedCategoryName || 'Tất cả sách'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Tìm thấy {totalItems} kết quả</p>
        </div>
        <div className="flex items-center gap-3">
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600">
              <X size={14} /> Xóa bộ lọc
            </button>
          )}
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="md:hidden flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <SlidersHorizontal size={16} /> Bộ lọc
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className={`${showFilter ? 'block' : 'hidden'} md:block w-64 flex-shrink-0`}>
          <div className="card p-4 sticky top-24">
            {/* Category */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Danh mục</h3>
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={() => { setSelectedCategoryName(''); setPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategoryName === '' ? 'bg-orange-50 text-orange-600 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    Tất cả
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat._id}>
                    <button
                      onClick={() => { setSelectedCategoryName(cat.name); setPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${selectedCategoryName === cat.name ? 'bg-orange-50 text-orange-600 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <span>{cat.icon}</span> {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price range */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Khoảng giá</h3>
              <ul className="space-y-1.5">
                {PRICE_RANGES.map((range, i) => (
                  <li key={i}>
                    <button
                      onClick={() => { setPriceRange(i); setPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${priceRange === i ? 'bg-orange-50 text-orange-600 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      {range.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(1); }}
                className="appearance-none border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Books */}
          {loading ? (
            <div className="text-center py-20 text-gray-400">Đang tải...</div>
          ) : books.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy sách</h3>
              <p className="text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <button onClick={clearFilters} className="btn-primary mt-4">Xóa bộ lọc</button>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {books.map(book => <BookCard key={book.id} book={book} />)}
            </div>
          ) : (
            <div className="space-y-4">
              {books.map(book => <BookCard key={book.id} book={book} view="list" />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                ← Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && arr[i - 1] !== p - 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`e-${i}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-orange-500 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
