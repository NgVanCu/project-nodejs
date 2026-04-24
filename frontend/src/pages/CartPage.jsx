import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../components/BookCard';

const VOUCHERS = {
  'BOOK10': { discount: 0.1, label: 'Giảm 10%' },
  'NEWUSER': { discount: 0.2, label: 'Giảm 20% cho khách mới' },
  'FREESHIP': { discount: 0, shipping: true, label: 'Miễn phí vận chuyển' },
};

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');

  const SHIPPING = totalPrice >= 150000 ? 0 : 30000;
  const discount = appliedVoucher ? Math.round(totalPrice * (appliedVoucher.discount || 0)) : 0;
  const shippingFee = appliedVoucher?.shipping ? 0 : SHIPPING;
  const finalTotal = totalPrice - discount + shippingFee;

  const applyVoucher = () => {
    const code = voucherCode.toUpperCase();
    if (VOUCHERS[code]) {
      setAppliedVoucher(VOUCHERS[code]);
      setVoucherError('');
    } else {
      setVoucherError('Mã voucher không hợp lệ');
      setAppliedVoucher(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={80} className="text-gray-200 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-400 mb-6">Hãy thêm sách vào giỏ hàng để tiếp tục mua sắm</p>
        <Link to="/shop" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-base">
          <ShoppingBag size={20} /> Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-orange-500">Trang chủ</Link>
        <ChevronRight size={14} />
        <span className="text-gray-700">Giỏ hàng ({totalItems} sách)</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-gray-800">Giỏ hàng của bạn</h1>
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 size={14} /> Xóa tất cả
            </button>
          </div>

          {items.map(item => (
            <div key={item.id} className="card flex gap-4 p-4">
              <Link to={`/book/${item.id}`} className="flex-shrink-0">
                <img
                  src={item.cover}
                  alt={item.title}
                  className="w-20 h-28 object-cover rounded-lg shadow-sm"
                  onError={e => { e.target.src = 'https://via.placeholder.com/80x112?text=📚'; }}
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/book/${item.id}`}>
                  <h3 className="font-semibold text-gray-800 hover:text-orange-500 line-clamp-2">{item.title}</h3>
                </Link>
                <p className="text-sm text-gray-500 mt-0.5">{item.author}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1.5 hover:bg-gray-100 transition-colors text-gray-600"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 py-1.5 font-semibold text-sm min-w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1.5 hover:bg-gray-100 transition-colors text-gray-600"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-500">{formatPrice(item.price * item.quantity)}</div>
                    {item.quantity > 1 && <div className="text-xs text-gray-400">{formatPrice(item.price)} × {item.quantity}</div>}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <Link to="/shop" className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 mt-4">
             Tiế←p tục mua hàng
          </Link>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Voucher */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Tag size={18} className="text-orange-400" /> Mã giảm giá
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã voucher"
                className="input-field flex-1 text-sm uppercase"
                onKeyDown={e => e.key === 'Enter' && applyVoucher()}
              />
              <button onClick={applyVoucher} className="btn-primary px-4 text-sm">Áp dụng</button>
            </div>
            {voucherError && <p className="text-red-500 text-xs mt-1">{voucherError}</p>}
            {appliedVoucher && (
              <div className="mt-2 flex items-center justify-between bg-green-50 text-green-600 rounded-lg px-3 py-2 text-sm">
                <span>✓ {appliedVoucher.label}</span>
                <button onClick={() => { setAppliedVoucher(null); setVoucherCode(''); }} className="text-green-400 hover:text-green-600">×</button>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">Thử: BOOK10, NEWUSER, FREESHIP</p>
          </div>

          {/* Summary */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính ({totalItems} sản phẩm)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá voucher</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                </span>
              </div>
              {totalPrice < 150000 && !appliedVoucher?.shipping && (
                <p className="text-xs text-orange-500 bg-orange-50 rounded-lg p-2">
                  Mua thêm {formatPrice(150000 - totalPrice)} để được miễn phí vận chuyển
                </p>
              )}
              <hr className="border-gray-200" />
              <div className="flex justify-between font-bold text-base">
                <span>Tổng cộng</span>
                <span className="text-orange-500 text-lg">{formatPrice(finalTotal)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full py-3 mt-4 text-base flex items-center justify-center gap-2"
            >
              Thanh toán ngay →
            </button>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-400">
              <span>🔒 Thanh toán an toàn</span>
              <span>✓ Đổi trả 7 ngày</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
