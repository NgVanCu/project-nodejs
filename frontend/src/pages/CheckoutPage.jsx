import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, CreditCard, Banknote, Smartphone, Check, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../components/BookCard';
import { api } from '../services/api';

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Thanh toán khi nhận hàng', icon: <Banknote size={20} />, desc: 'Trả tiền mặt khi nhận sách' },
  { id: 'bank', label: 'Chuyển khoản ngân hàng', icon: <CreditCard size={20} />, desc: 'VCB, TCB, MB, VPBank...' },
  { id: 'momo', label: 'Ví MoMo', icon: <Smartphone size={20} />, desc: 'Thanh toán qua ví MoMo' },
];

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    note: '',
  });
  const [payment, setPayment] = useState('cod');
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const shippingFee = totalPrice >= 150000 ? 0 : 30000;
  const finalTotal = totalPrice + shippingFee;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Vui lòng nhập họ tên';
    if (!form.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^0\d{9}$/.test(form.phone)) errs.phone = 'Số điện thoại không hợp lệ';
    if (!form.address.trim()) errs.address = 'Vui lòng nhập địa chỉ';
    if (!form.city.trim()) errs.city = 'Vui lòng nhập tỉnh/thành';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!user) { navigate('/login'); return; }

    setSubmitting(true);
    try {
      const res = await api.post('/order', {
        shippingAddress: {
          fullName: form.name,
          address: form.address,
          city: form.city,
          phone: form.phone,
        },
      });
      setPlacedOrder(res.data);
      await clearCart();
      setStep(3);
    } catch (e) {
      setErrors({ general: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3: Success
  if (step === 3 && placedOrder) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-500 mb-1">Mã đơn hàng: <span className="font-bold text-orange-500">#{placedOrder._id?.slice(-6).toUpperCase()}</span></p>
        <p className="text-gray-500 mb-6">Chúng tôi sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất.</p>
        <div className="card p-4 text-left mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Tổng tiền:</span>
            <span className="font-bold text-orange-500">{formatPrice(placedOrder.totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Địa chỉ:</span>
            <span className="text-right max-w-48">
              {placedOrder.shippingAddress?.address}, {placedOrder.shippingAddress?.city}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Thanh toán:</span>
            <span>{PAYMENT_METHODS.find(p => p.id === payment)?.label}</span>
          </div>
        </div>
        <div className="flex gap-3">
          {user && (
            <Link to="/orders" className="flex-1 btn-secondary py-3">Xem đơn hàng</Link>
          )}
          <Link to="/" className="flex-1 btn-primary py-3">Trang chủ</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Giỏ hàng trống</h2>
        <Link to="/shop" className="btn-primary">Tiếp tục mua hàng</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-orange-500">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link to="/cart" className="hover:text-orange-500">Giỏ hàng</Link>
        <ChevronRight size={14} />
        <span className="text-gray-700">Thanh toán</span>
      </nav>

      {/* Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[
          { n: 1, label: 'Thông tin' },
          { n: 2, label: 'Thanh toán' },
          { n: 3, label: 'Xác nhận' },
        ].map(({ n, label }) => (
          <React.Fragment key={n}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= n ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{n}</div>
              <span className={`text-sm font-medium ${step >= n ? 'text-orange-500' : 'text-gray-400'}`}>{label}</span>
            </div>
            {n < 3 && <div className={`flex-1 max-w-16 h-0.5 ${step > n ? 'bg-orange-500' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
              {errors.general}
            </div>
          )}

          {step === 1 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="text-orange-500" size={20} /> Thông tin giao hàng
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { field: 'name', label: 'Họ và tên *', placeholder: 'Nguyễn Văn An' },
                  { field: 'phone', label: 'Số điện thoại *', placeholder: '0901234567' },
                  { field: 'address', label: 'Địa chỉ *', placeholder: 'Số nhà, tên đường, phường/xã', span: 2 },
                  { field: 'city', label: 'Tỉnh / Thành phố *', placeholder: 'TP. Hồ Chí Minh' },
                  { field: 'note', label: 'Ghi chú', placeholder: 'Ghi chú cho người giao hàng...' },
                ].map(({ field, label, placeholder, span }) => (
                  <div key={field} className={span === 2 ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="text"
                      value={form[field]}
                      onChange={e => { setForm(f => ({ ...f, [field]: e.target.value })); setErrors(er => ({ ...er, [field]: '' })); }}
                      placeholder={placeholder}
                      className={`input-field ${errors[field] ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                    />
                    {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                  </div>
                ))}
              </div>
              <button
                onClick={() => { const errs = validate(); if (Object.keys(errs).length > 0) setErrors(errs); else setStep(2); }}
                className="btn-primary w-full py-3 mt-6"
              >
                Tiếp theo: Phương thức thanh toán →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="text-orange-500" size={20} /> Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${payment === m.id ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value={m.id} checked={payment === m.id} onChange={() => setPayment(m.id)} className="accent-orange-500" />
                    <span className={payment === m.id ? 'text-orange-500' : 'text-gray-500'}>{m.icon}</span>
                    <div>
                      <div className="font-medium text-gray-800">{m.label}</div>
                      <div className="text-xs text-gray-500">{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">← Quay lại</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 py-3 disabled:opacity-60">
                  {submitting ? 'Đang đặt hàng...' : 'Đặt hàng ngay 🎉'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="card p-4 h-fit sticky top-24">
          <h3 className="font-bold text-gray-800 mb-4">Đơn hàng ({items.length} sản phẩm)</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {items.map(item => (
              <div key={item.id} className="flex gap-3">
                <img src={item.cover} alt={item.title} className="w-12 h-16 object-cover rounded shadow-sm"
                  onError={e => { e.target.src = 'https://via.placeholder.com/48x64?text=📚'; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 line-clamp-2">{item.title}</p>
                  <p className="text-xs text-gray-400">×{item.quantity}</p>
                  <p className="text-sm font-bold text-orange-500">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          <hr className="mb-3" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span><span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Phí vận chuyển</span>
              <span className={shippingFee === 0 ? 'text-green-600' : ''}>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold text-base">
              <span>Tổng cộng</span>
              <span className="text-orange-500 text-lg">{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
