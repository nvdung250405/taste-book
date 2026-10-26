import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Menu, LogOut, ArrowLeft } from 'lucide-react'
import { Button } from '../ui/button'
import AdminNavigation from './AdminNavigation'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '../ui/sheet'
import { useLogout } from '../../hooks/queries/useAuthQueries'

export default function AdminLayout() {
  const navigate = useNavigate()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const closeMobileMenu = () => setMobileMenuOpen(false)

  const handleLogout = () => {
    if (isLoggingOut) return
    closeMobileMenu()

    logout(undefined, {
      onSuccess: () => toast.success('Đã đăng xuất thành công'),
      // useLogout clears the session even if the API request fails.
      onSettled: () => navigate('/login', { replace: true }),
    })
  }

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-950 border-r max-md:hidden md:flex md:flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link to="/admin" className="text-xl font-bold text-orange-500">
            TasteBook Admin
          </Link>
        </div>

        <AdminNavigation />

        <div className="p-4 border-t space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về trang chính</span>
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden h-16 shrink-0 items-center justify-between border-b bg-white px-6 dark:bg-slate-950 md:flex">
          <span className="font-semibold">Không gian quản trị</span>
          <Link to="/" className="text-sm text-slate-500 hover:text-orange-500">
            Về trang chính
          </Link>
        </header>
        {/* Mobile Header */}
        <header className="h-16 bg-white dark:bg-slate-950 border-b flex items-center justify-between px-4 md:hidden">
          <span className="text-xl font-bold text-orange-500">
            TasteBook Admin
          </span>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Mở menu quản trị">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              aria-describedby={undefined}
              className="w-[280px] p-0 flex flex-col"
            >
              <SheetTitle className="sr-only">Menu quản trị</SheetTitle>
              <div className="h-16 flex items-center px-6 border-b shrink-0">
                <span className="text-xl font-bold text-orange-500">
                  TasteBook Admin
                </span>
              </div>
              <AdminNavigation onNavigate={closeMobileMenu} />
              <div className="p-4 border-t shrink-0 space-y-2">
                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Về trang chính</span>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
