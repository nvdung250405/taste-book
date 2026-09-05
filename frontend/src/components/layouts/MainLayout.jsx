import { Link, Outlet } from 'react-router'
import {
  UserCircle,
  Search,
  Heart,
  UtensilsCrossed,
  ListTodo,
  ShoppingCart,
  Globe,
  MessageCircle,
  Camera,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import { Button } from '../ui/button'

export default function MainLayout() {
  // TODO: Add auth state to conditionally render links and avatar
  const isAuthenticated = false

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              TasteBook
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-orange-500 transition-colors">
              Trang chủ
            </Link>
            <Link
              to="/search"
              className="hover:text-orange-500 transition-colors"
            >
              Khám phá
            </Link>

            {/* Authenticated Links */}
            <Link
              to="/my-recipes"
              className="hover:text-orange-500 transition-colors flex items-center gap-1"
            >
              <UtensilsCrossed className="w-4 h-4" /> Công thức của tôi
            </Link>
            <Link
              to="/menus"
              className="hover:text-orange-500 transition-colors flex items-center gap-1"
            >
              <ListTodo className="w-4 h-4" /> Thực đơn
            </Link>
            <Link
              to="/favorites"
              className="hover:text-orange-500 transition-colors flex items-center gap-1"
            >
              <Heart className="w-4 h-4" /> Yêu thích
            </Link>
            <Link
              to="/shopping-lists"
              className="hover:text-orange-500 transition-colors flex items-center gap-1"
            >
              <ShoppingCart className="w-4 h-4" /> Đi chợ
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/search"
              className="text-slate-500 hover:text-orange-500 md:hidden"
            >
              <Search className="w-5 h-5" />
            </Link>

            {isAuthenticated ? (
              <Link
                to="/profile"
                className="text-slate-500 hover:text-orange-500 transition-colors"
              >
                <UserCircle className="w-8 h-8" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button
                  asChild
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Link to="/register">Đăng ký</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-950 pt-12 pb-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <span className="text-2xl font-bold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  TasteBook
                </span>
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Hệ thống lưu trữ, chia sẻ và hướng dẫn nấu ăn thông minh. Giúp
                bạn quản lý thực đơn và bữa ăn mỗi ngày một cách dễ dàng.
              </p>
              <div className="flex space-x-4 pt-2">
                <a
                  href="#"
                  className="text-slate-400 hover:text-orange-500 transition-colors"
                  aria-label="Facebook"
                >
                  <Globe className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-orange-500 transition-colors"
                  aria-label="Twitter"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-orange-500 transition-colors"
                  aria-label="Instagram"
                >
                  <Camera className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Khám phá
              </h3>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li>
                  <Link
                    to="/search"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Tìm kiếm công thức
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Món ăn nổi bật
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Danh mục ẩm thực
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Tác giả phổ biến
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Tiện ích
              </h3>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li>
                  <Link
                    to="/my-recipes"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Công thức của bạn
                  </Link>
                </li>
                <li>
                  <Link
                    to="/menus"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Lên thực đơn
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shopping-lists"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Danh sách đi chợ
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Tính định lượng món
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Liên hệ
              </h3>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>3 Cầu Giấy, Láng Thượng, Hà Nội</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-500" />
                  <span>0123 456 789</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-500" />
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
              <Link to="#" className="hover:text-orange-500 transition-colors">
                Chính sách bảo mật
              </Link>
              <Link to="#" className="hover:text-orange-500 transition-colors">
                Điều khoản dịch vụ
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
