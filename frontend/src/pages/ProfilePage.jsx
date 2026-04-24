import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Camera, Save, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [tab, setTab] = useState('info');
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-600 mb-4">Vui lòng đăng nhập</h2>
        <Link to="/login" className="btn-primary">Đăng nhập</Link>
      </div>
    );
  }

  const handleSave = async () => {
    setSaveError('');
    try {
      await api.put(`/user/${user.id}`, {
        name: form.name,
        phone: form.phone,
        address: form.address,
      });
      updateUser({ name: form.name, phone: form.phone, address: form.address });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setSaveError(e.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-orange-500">Trang chủ</Link>
        <ChevronRight size={14} />
        <span className="text-gray-700">Tài khoản của tôi</span>
      </nav>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="card p-4 text-center mb-4">
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-3xl mx-auto">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="font-bold text-gray-800">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
            {user.role === 'admin' && (
              <span className="badge bg-orange-100 text-orange-600 mt-2 inline-block">Quản trị viên</span>
            )}
          </div>

          <div className="card overflow-hidden">
            {[
              { id: 'info', label: 'Thông tin cá nhân', icon: <User size={16} /> },
              { id: 'password', label: 'Đổi mật khẩu', icon: <Lock size={16} /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-gray-50 last:border-0 ${tab === item.id ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className={tab === item.id ? 'text-orange-500' : 'text-gray-400'}>{item.icon}</span>
                {item.label}
              </button>
            ))}
            <Link
              to="/orders"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-400"><ChevronRight size={16} /></span> Đơn hàng của tôi
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {tab === 'info' && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Thông tin cá nhân</h2>
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">{saveError}</div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { field: 'name', label: 'Họ và tên', icon: <User size={16} />, placeholder: 'Nguyễn Văn An' },
                  { field: 'phone', label: 'Số điện thoại', icon: <Phone size={16} />, placeholder: '0901234567' },
                  { field: 'address', label: 'Địa chỉ', icon: <MapPin size={16} />, placeholder: 'Địa chỉ giao hàng', span: 2 },
                ].map(({ field, label, icon, placeholder, span }) => (
                  <div key={field} className={span === 2 ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
                      <input
                        type="text"
                        value={form[field]}
                        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                        placeholder={placeholder}
                        className="input-field pl-9"
                      />
                    </div>
                  </div>
                ))}
                {/* Email readonly */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={16} /></span>
                    <input type="email" value={user.email} readOnly className="input-field pl-9 bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                </div>
              </div>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold mt-6 transition-colors ${saved ? 'bg-green-500 text-white' : 'btn-primary'}`}
              >
                <Save size={16} /> {saved ? 'Đã lưu!' : 'Lưu thay đổi'}
              </button>
            </div>
          )}

          {tab === 'password' && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Đổi mật khẩu</h2>
              {pwError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">{pwError}</div>
              )}
              {pwSaved && (
                <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg px-4 py-3 text-sm mb-4">Cập nhật mật khẩu thành công!</div>
              )}
              <div className="space-y-4 max-w-md">
                {[
                  { key: 'newPw', label: 'Mật khẩu mới', placeholder: 'Ít nhất 6 ký tự' },
                  { key: 'confirm', label: 'Xác nhận mật khẩu mới', placeholder: 'Nhập lại mật khẩu mới' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input
                      type="password"
                      placeholder={f.placeholder}
                      value={pwForm[f.key]}
                      onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                ))}
                <button
                  onClick={async () => {
                    setPwError('');
                    if (pwForm.newPw.length < 6) { setPwError('Mật khẩu ít nhất 6 ký tự'); return; }
                    if (pwForm.newPw !== pwForm.confirm) { setPwError('Mật khẩu không khớp'); return; }
                    try {
                      await api.put(`/user/${user.id}`, { password: pwForm.newPw });
                      setPwSaved(true);
                      setPwForm({ current: '', newPw: '', confirm: '' });
                      setTimeout(() => setPwSaved(false), 3000);
                    } catch (e) {
                      setPwError(e.message);
                    }
                  }}
                  className="btn-primary flex items-center gap-2 px-6 py-2.5"
                >
                  <Lock size={16} /> Cập nhật mật khẩu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
