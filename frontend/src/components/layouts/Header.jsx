import { Link } from 'react-router-dom'
import {
  UtensilsCrossed,
  Home,
  Compass,
  Heart,
  ListTodo,
  ShoppingCart,
  Plus,
  Menu,
  UserCircle,
  LogOut
} from 'lucide-react'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import UserDropdown from './UserDropdown'

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ', icon: Home },
  { to: '/explore', label: 'Khám phá', icon: Compass },
  { to: '/my-recipes', label: 'Công thức của tôi', icon: UtensilsCrossed, authRequired: true },
  { to: '/menu', label: 'Thực đơn', icon: ListTodo, authRequired: true },
  { to: '/favorites', label: 'Yêu thích', icon: Heart, authRequired: true },
  { to: '/shopping-list', label: 'Đi chợ', icon: ShoppingCart, authRequired: true },
]

export default function Header({ isAuthenticated, user, profileLoading, handleLogout, isActive, handleLinkClick }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <UtensilsCrossed className="w-6 h-6 text-orange-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            TasteBook
          </span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium group/nav">
          {NAV_LINKS.map(({ to, label, icon: Icon, authRequired }) => (
            <Link
              key={to}
              to={to}
              onClick={(e) => handleLinkClick(e, authRequired)}
              className={`relative flex items-center gap-1.5 px-3 py-2 transition-colors group ${
                isActive(to)
                  ? 'text-orange-500'
                  : 'text-slate-600 dark:text-slate-300 hover:text-orange-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden lg:inline whitespace-nowrap">{label}</span>
              {/* Premium Underline Effect */}
              <span 
                className={`absolute left-2 right-2 bottom-0.5 h-[2px] rounded-full bg-orange-500 transition-transform duration-300 ease-out origin-center ${
                  isActive(to) 
                    ? 'scale-x-100 group-hover/nav:scale-x-0 group-hover:!scale-x-100' 
                    : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Create recipe shortcut */}
          {isAuthenticated && (
            <Button
              size="sm"
              className="hidden sm:flex bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-1.5"
              asChild
            >
              <Link to="/recipe/create">
                <Plus className="w-4 h-4" />
                <span className="hidden lg:inline">Tạo công thức</span>
              </Link>
            </Button>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-500">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
                {/* Mobile header */}
                <div className="h-16 flex items-center gap-2 px-6 border-b shrink-0">
                  <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                  <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    TasteBook
                  </span>
                </div>

                {/* Mobile user info */}
                {isAuthenticated && user && (
                  <div className="px-4 py-3 border-b bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold uppercase">
                      {(user.name || 'U').charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-50 text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                )}

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                  {NAV_LINKS.map(({ to, label, icon: Icon, authRequired }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={(e) => handleLinkClick(e, authRequired)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        isActive(to)
                          ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </Link>
                  ))}

                  {isAuthenticated && (
                    <>
                      <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                      <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
                        <UserCircle className="w-5 h-5" />
                        <span className="font-medium">Hồ sơ cá nhân</span>
                      </Link>
                      <Link to="/recipe/create" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Tạo công thức</span>
                      </Link>
                    </>
                  )}
                </nav>

                {/* Mobile auth buttons */}
                {!isAuthenticated && (
                  <div className="p-4 border-t shrink-0 flex flex-col gap-2">
                    <Button variant="outline" asChild className="w-full justify-center">
                      <Link to="/login">Đăng nhập</Link>
                    </Button>
                    <Button asChild className="w-full justify-center bg-orange-500 hover:bg-orange-600 text-white">
                      <Link to="/register">Đăng ký</Link>
                    </Button>
                  </div>
                )}

                {isAuthenticated && (
                  <div className="p-4 border-t shrink-0">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop: User dropdown hoặc nút login */}
          <div className="hidden md:flex items-center">
            {profileLoading ? (
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
            ) : isAuthenticated ? (
              <UserDropdown user={user} onLogout={handleLogout} />
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Link to="/register">Đăng ký</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
