import { Link, Outlet } from 'react-router'
import {
  LayoutDashboard,
  BookOpenCheck,
  Tags,
  Carrot,
  Scale,
  Users,
  LogOut,
} from 'lucide-react'
import { Button } from '../ui/button'

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-950 border-r max-md:hidden md:flex md:flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link to="/admin" className="text-xl font-bold text-orange-500">
            TasteBook Admin
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5 text-slate-500" />
            <span className="font-medium">Tổng quan</span>
          </Link>
          <Link
            to="/admin/approvals"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <BookOpenCheck className="w-5 h-5 text-slate-500" />
            <span className="font-medium">Kiểm duyệt công thức</span>
          </Link>
          <Link
            to="/admin/categories"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Tags className="w-5 h-5 text-slate-500" />
            <span className="font-medium">Quản lý danh mục</span>
          </Link>
          <Link
            to="/admin/ingredients"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Carrot className="w-5 h-5 text-slate-500" />
            <span className="font-medium">Quản lý nguyên liệu</span>
          </Link>
          <Link
            to="/admin/units"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Scale className="w-5 h-5 text-slate-500" />
            <span className="font-medium">Quản lý đơn vị đo</span>
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Users className="w-5 h-5 text-slate-500" />
            <span className="font-medium">Quản lý người dùng</span>
          </Link>
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-16 bg-white dark:bg-slate-950 border-b flex items-center px-4 md:hidden">
          <span className="text-xl font-bold text-orange-500">
            TasteBook Admin
          </span>
          {/* Mobile menu button could go here */}
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
