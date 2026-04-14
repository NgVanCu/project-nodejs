const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(method, url, data = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(`${BASE_URL}${url}`, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Lỗi server');
  return json;
}

export const api = {
  get: (url) => request('GET', url),
  post: (url, data) => request('POST', url, data),
  put: (url, data) => request('PUT', url, data),
  delete: (url) => request('DELETE', url),
};

// ─── Normalizers ──────────────────────────────────────────────────────────────

export function normalizeBook(book) {
  const price = book.price || 0;
  const originalPrice = book.originalPrice || price;
  const discount = originalPrice > price
    ? Math.round((1 - price / originalPrice) * 100)
    : 0;
  const createdAt = book.createdAt ? new Date(book.createdAt) : new Date(0);
  const isNew = (Date.now() - createdAt.getTime()) < 30 * 24 * 60 * 60 * 1000;

  return {
    id: book._id,
    title: book.name,
    author: book.author || '',
    price,
    originalPrice,
    discount,
    cover: book.thumbnail
      ? (book.thumbnail.startsWith('http') ? book.thumbnail : `/images/book/${book.thumbnail}`)
      : '',
    slider: (book.slider || []).map(s =>
      s.startsWith('http') ? s : `/images/book/${s}`
    ),
    category: book.category?.name || '',
    categoryId: book.category?._id || book.category || '',
    rating: book.rating || 0,
    reviewCount: book.numReviews || 0,
    sold: book.sold || 0,
    stock: book.quantity || 0,
    description: book.description || '',
    isBestseller: (book.sold || 0) > 50,
    isNew,
    pages: book.pages || 0,
    language: book.language || 'Tiếng Việt',
    publisher: book.publisher || '',
    year: book.year || new Date().getFullYear(),
  };
}

// Map backend status → frontend status key
const STATUS_FROM_BACKEND = {
  'Chưa thanh toán': 'pending',
  'Đã thanh toán': 'delivered',
  'Đã hủy': 'cancelled',
};

// Map frontend status key → backend status string
export const STATUS_TO_BACKEND = {
  pending: 'Chưa thanh toán',
  delivered: 'Đã thanh toán',
  cancelled: 'Đã hủy',
};

export function normalizeOrder(order) {
  return {
    id: order._id,
    date: order.createdAt ? order.createdAt.split('T')[0] : '',
    status: STATUS_FROM_BACKEND[order.status] || 'pending',
    statusLabel: order.status,
    items: (order.orderItems || []).map(item => ({
      id: item.product,
      title: item.name,
      price: item.price,
      quantity: item.qty,
      cover: item.image
        ? (item.image.startsWith('http') ? item.image : `/images/book/${item.image}`)
        : '',
    })),
    total: order.totalPrice || 0,
    address: order.shippingAddress
      ? `${order.shippingAddress.address}, ${order.shippingAddress.city}`
      : '',
    shippingAddress: order.shippingAddress,
    user: order.user,
  };
}

export function normalizeCartItems(cartData) {
  if (!cartData || !cartData.cartItems) return [];
  return cartData.cartItems.map(item => {
    const p = item.product || {};
    return {
      id: p._id || item.product,
      title: p.name || '',
      author: p.author || '',
      price: p.price || 0,
      cover: p.thumbnail
        ? (p.thumbnail.startsWith('http') ? p.thumbnail : `/images/book/${p.thumbnail}`)
        : '',
      quantity: item.qty || 1,
      stock: p.quantity || 999,
      category: '',
    };
  });
}
