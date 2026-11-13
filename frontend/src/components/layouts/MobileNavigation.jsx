import { Link } from 'react-router-dom'
import {
  UtensilsCrossed,
  ShieldCheck,
  FolderHeart,
  UserCircle,
  LogOut,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet'
import { NAV_LINKS } from './navigationLinks'

export default function MobileNavigation({
  mobileMenuOpen,
  setMobileMenuOpen,
  isAuthenticated,
  user,
  displayName,
  profileLoading,
  handleMobileLinkClick,
  isActive,
  closeMobileMenu,
  handleLogout,
  triggerRef,
}) {
  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          triggerRef.current?.focus()
        }}
        side="left"
        aria-describedby={undefined}
        className="w-[280px] p-0 flex flex-col"
      >
        <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
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
              {displayName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-50 text-sm">
                {displayName}
              </p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_LINKS.map(({ to, label, icon: Icon, authRequired }) => (
            <Link
              key={to}
              aria-label={label}
              to={to}
              onClick={(e) => handleMobileLinkClick(e, authRequired)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive(to)
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
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
              {!profileLoading && user?.role === 'Admin' && (
                <Link
                  to="/admin"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Quản lý Admin</span>
                </Link>
              )}
              <Link
                to="/my-categories"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FolderHeart className="w-5 h-5" />
                <span className="font-medium">Danh mục của tôi</span>
              </Link>
              <Link
                to="/profile"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <UserCircle className="w-5 h-5" />
                <span className="font-medium">Hồ sơ cá nhân</span>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile auth buttons */}
        {!isAuthenticated && (
          <div className="p-4 border-t shrink-0 flex flex-col gap-2">
            <Button variant="outline" asChild className="w-full justify-center">
              <Link to="/login" onClick={closeMobileMenu}>
                Đăng nhập
              </Link>
            </Button>
            <Button
              asChild
              className="w-full justify-center bg-orange-700 hover:bg-orange-800 text-white"
            >
              <Link to="/register" onClick={closeMobileMenu}>
                Đăng ký
              </Link>
            </Button>
          </div>
        )}

        {isAuthenticated && (
          <div className="p-4 border-t shrink-0">
            <button
              onClick={() => {
                closeMobileMenu()
                handleLogout()
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
