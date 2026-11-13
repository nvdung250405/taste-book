import { useState, useRef, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { UtensilsCrossed, Menu } from 'lucide-react'
import { Button } from '../ui/button'
import { NAV_LINKS } from './navigationLinks'
const MobileNavigation = lazy(() => import('./MobileNavigation'))
import UserDropdown from './UserDropdown'

export default function Header({
  isAuthenticated,
  user,
  profileLoading,
  handleLogout,
  isActive,
  handleLinkClick,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const triggerRef = useRef(null)
  const displayName = user?.username || user?.name || 'Người dùng'
  const closeMobileMenu = () => setMobileMenuOpen(false)

  const handleMobileLinkClick = (event, authRequired) => {
    closeMobileMenu()
    handleLinkClick(event, authRequired)
  }

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
              aria-label={label}
              to={to}
              onClick={(e) => handleLinkClick(e, authRequired)}
              className={`relative flex items-center gap-1.5 px-3 py-2 transition-colors group ${
                isActive(to)
                  ? 'text-orange-700 dark:text-orange-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-orange-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden lg:inline whitespace-nowrap">
                {label}
              </span>
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
          {/* Mobile Menu */}
          <div className="md:hidden flex items-center">
            <Button
              ref={triggerRef}
              variant="ghost"
              size="icon"
              className="text-slate-500"
              aria-label="Mở menu điều hướng"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            {mobileMenuOpen && (
              <Suspense fallback={null}>
                <MobileNavigation
                  {...{
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
                  }}
                />
              </Suspense>
            )}
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
                <Button
                  asChild
                  className="bg-orange-700 hover:bg-orange-800 text-white"
                >
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
