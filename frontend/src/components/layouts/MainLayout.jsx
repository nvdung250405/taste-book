import { Link, Outlet } from 'react-router'
import {
  UserCircle,
  Menu,
  Search,
  Home,
  Compass,
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
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
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
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-medium">
            <Link
              to="/"
              className="relative flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors group py-2"
              title="Trang chủ"
            >
              <Home className="w-5 h-5" />
              <span className="hidden lg:inline">Trang chủ</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/search"
              className="relative flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors group py-2"
              title="Khám phá"
            >
              <Compass className="w-5 h-5" />
              <span className="hidden lg:inline">Khám phá</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* Authenticated Links */}
            <Link
              to="/my-recipes"
              className="relative flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors group py-2"
              title="Công thức của tôi"
            >
              <UtensilsCrossed className="w-5 h-5" />
              <span className="hidden lg:inline">Công thức của tôi</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/menus"
              className="relative flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors group py-2"
              title="Thực đơn"
            >
              <ListTodo className="w-5 h-5" />
              <span className="hidden lg:inline">Thực đơn</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/favorites"
              className="relative flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors group py-2"
              title="Yêu thích"
            >
              <Heart className="w-5 h-5" />
              <span className="hidden lg:inline">Yêu thích</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/shopping-lists"
              className="relative flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors group py-2"
              title="Đi chợ"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden lg:inline">Đi chợ</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
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

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-500"
                  >
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[280px] p-0 flex flex-col"
                >
                  <div className="h-16 flex items-center px-6 border-b shrink-0">
                    <span className="text-xl font-bold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                      TasteBook
                    </span>
                  </div>
                  <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Link
                      to="/"
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Home className="w-5 h-5 text-slate-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Trang chủ
                      </span>
                    </Link>
                    <Link
                      to="/search"
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Compass className="w-5 h-5 text-slate-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Khám phá
                      </span>
                    </Link>
                    <Link
                      to="/my-recipes"
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UtensilsCrossed className="w-5 h-5 text-slate-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Công thức của tôi
                      </span>
                    </Link>
                    <Link
                      to="/menus"
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ListTodo className="w-5 h-5 text-slate-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Thực đơn
                      </span>
                    </Link>
                    <Link
                      to="/favorites"
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Heart className="w-5 h-5 text-slate-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Yêu thích
                      </span>
                    </Link>
                    <Link
                      to="/shopping-lists"
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ShoppingCart className="w-5 h-5 text-slate-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Đi chợ
                      </span>
                    </Link>
                  </nav>

                  {!isAuthenticated && (
                    <div className="p-4 border-t shrink-0 flex flex-col gap-2">
                      <Button
                        variant="outline"
                        asChild
                        className="w-full justify-center"
                      >
                        <Link to="/login">Đăng nhập</Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full justify-center bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        <Link to="/register">Đăng ký</Link>
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>

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
