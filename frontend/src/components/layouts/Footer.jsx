import { Link } from 'react-router-dom'
import {
  UtensilsCrossed,
  Globe,
  MessageCircle,
  Camera,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'

export default function Footer({ handleLinkClick }) {
  return (
    <footer className="border-t bg-white dark:bg-slate-950 pt-12 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                TasteBook
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Hệ thống lưu trữ, chia sẻ và hướng dẫn nấu ăn thông minh. Giúp
              bạn quản lý thực đơn và bữa ăn mỗi ngày một cách dễ dàng.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-slate-400 hover:text-orange-500 transition-colors" aria-label="Facebook">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-orange-500 transition-colors" aria-label="Twitter">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-orange-500 transition-colors" aria-label="Instagram">
                <Camera className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">Khám phá</h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/explore" className="hover:text-orange-500 transition-colors">Tìm kiếm công thức</Link></li>
              <li><Link to="/explore" className="hover:text-orange-500 transition-colors">Món ăn nổi bật</Link></li>
              <li><Link to="/explore" className="hover:text-orange-500 transition-colors">Danh mục ẩm thực</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">Tiện ích</h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/my-recipes" onClick={(e) => handleLinkClick(e, true)} className="hover:text-orange-500 transition-colors">Công thức của bạn</Link></li>
              <li><Link to="/menu" onClick={(e) => handleLinkClick(e, true)} className="hover:text-orange-500 transition-colors">Lên thực đơn</Link></li>
              <li><Link to="/shopping-list" onClick={(e) => handleLinkClick(e, true)} className="hover:text-orange-500 transition-colors">Danh sách đi chợ</Link></li>
              <li><Link to="/favorites" onClick={(e) => handleLinkClick(e, true)} className="hover:text-orange-500 transition-colors">Món yêu thích</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                <span>3 Cầu Giấy, Láng Thượng, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>support@tastebook.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2026 TasteBook. Nền tảng hướng dẫn nấu ăn thông minh.
          </p>
          <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
            <Link to="#" className="hover:text-orange-500 transition-colors">Chính sách bảo mật</Link>
            <Link to="#" className="hover:text-orange-500 transition-colors">Điều khoản dịch vụ</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
