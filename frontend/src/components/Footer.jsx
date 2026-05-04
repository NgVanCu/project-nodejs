import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Phone, Mail, MapPin, Facebook, Youtube, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-orange-400" size={28} />
              <div>
                <div className="font-bold text-lg text-white">BookStore</div>
                <div className="text-xs text-gray-500">Nhà sách online uy tín</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-4">
              Cung cấp hàng ngàn đầu sách chất lượng với giá cả hợp lý. Giao hàng nhanh toàn quốc.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                <Youtube size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Danh mục sách</h3>
            <ul className="space-y-2 text-sm">
              {['Văn học', 'Khoa học', 'Kinh tế', 'Thiếu nhi', 'Lịch sử', 'Tâm lý học'].map(cat => (
                <li key={cat}>
                  <Link to={`/shop?categoryName=${encodeURIComponent(cat)}`} className="hover:text-orange-400 transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-orange-400 transition-colors">Hướng dẫn mua hàng</Link></li>
              <li><Link to="#" className="hover:text-orange-400 transition-colors">Chính sách đổi trả</Link></li>
              <li><Link to="#" className="hover:text-orange-400 transition-colors">Chính sách vận chuyển</Link></li>
              <li><Link to="#" className="hover:text-orange-400 transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="#" className="hover:text-orange-400 transition-colors">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
                <span>Học Viện công nghệ bưu chính viễn thông</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-orange-400 flex-shrink-0" />
                <span>12345678 (Miễn phí)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-orange-400 flex-shrink-0" />
                <span>ptit@bookstore.vn</span>
              </li>
            </ul>
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-2">Giờ làm việc:</div>
              <div className="text-sm">T2 - T7: 8:00 - 22:00</div>
              <div className="text-sm">CN: 9:00 - 21:00</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        <p>© 2026 BookStore. Thiết kế bởi Nhóm 03 – CNPM. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  );
}
