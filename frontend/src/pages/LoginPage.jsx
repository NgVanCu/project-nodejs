import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, BookOpen, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const setField = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '', general: '' }));
  };

  const handleLogin = async () => {
    const errs = {};
    if (!form.email) errs.email = 'Vui lòng nhập email';
    if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result.success) navigate(result.user.role === 'admin' ? '/admin' : '/');
    } catch (e) {
      setErrors({ general: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Vui lòng nhập họ tên';
    if (!form.email) errs.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email không hợp lệ';
    if (!form.phone) errs.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^0\d{9}$/.test(form.phone)) errs.phone = 'Số điện thoại không hợp lệ';
    if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
    else if (form.password.length < 6) errs.password = 'Mật khẩu ít nhất 6 ký tự';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu không khớp';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const result = await register(form.name, form.email, form.password, form.phone);
      if (result.success) {
        setTab('login');
        setErrors({ general: '' });
        setForm(f => ({ ...f, name: '', phone: '', confirmPassword: '' }));
      }
    } catch (e) {
      setErrors({ general: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <BookOpen size={40} className="text-orange-500" />
            <div className="text-left">
              <div className="text-2xl font-black text-orange-500">BookStore</div>
              <div className="text-xs text-gray-400">Nhà sách online</div>
            </div>
          </Link>
        </div>

        <div className="card p-8">
          {/* Tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => { setTab('login'); setErrors({}); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'login' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LogIn size={16} /> Đăng nhập
            </button>
            <button
              onClick={() => { setTab('register'); setErrors({}); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'register' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <UserPlus size={16} /> Đăng ký
            </button>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">
              {errors.general}
            </div>
          )}

          {tab === 'login' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                  placeholder="example@email.com"
                  className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setField('password', e.target.value)}
                    placeholder="••••••••"
                    className={`input-field pr-10 ${errors.password ? 'border-red-400' : ''}`}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-orange-500" />
                  <span className="text-gray-600">Ghi nhớ đăng nhập</span>
                </label>
                <button className="text-orange-500 hover:text-orange-600">Quên mật khẩu?</button>
              </div>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? 'Đang đăng nhập...' : <><LogIn size={18} /> Đăng nhập</>}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { field: 'name', label: 'Họ và tên', type: 'text', placeholder: 'Nguyễn Văn An' },
                { field: 'email', label: 'Email', type: 'email', placeholder: 'example@email.com' },
                { field: 'phone', label: 'Số điện thoại', type: 'tel', placeholder: '0901234567' },
              ].map(({ field, label, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={e => setField(field, e.target.value)}
                    placeholder={placeholder}
                    className={`input-field ${errors[field] ? 'border-red-400' : ''}`}
                  />
                  {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                </div>
              ))}
              {[
                { field: 'password', label: 'Mật khẩu', placeholder: 'Ít nhất 8 ký tự' },
                { field: 'confirmPassword', label: 'Xác nhận mật khẩu', placeholder: 'Nhập lại mật khẩu' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form[field]}
                      onChange={e => setField(field, e.target.value)}
                      placeholder={placeholder}
                      className={`input-field pr-10 ${errors[field] ? 'border-red-400' : ''}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                </div>
              ))}
              <button
                onClick={handleRegister}
                disabled={loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? 'Đang đăng ký...' : <><UserPlus size={18} /> Tạo tài khoản</>}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link to="/" className="text-orange-500 hover:underline">← Quay lại trang chủ</Link>
        </p>
      </div>
    </div>
  );
}
