import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpenCheck,
  Tags,
  Carrot,
  Scale,
  Users,
} from 'lucide-react'

const items = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  {
    to: '/admin/approvals',
    label: 'Kiểm duyệt công thức',
    icon: BookOpenCheck,
  },
  { to: '/admin/categories', label: 'Quản lý danh mục', icon: Tags },
  { to: '/admin/ingredients', label: 'Quản lý nguyên liệu', icon: Carrot },
  { to: '/admin/units', label: 'Quản lý đơn vị đo', icon: Scale },
  { to: '/admin/users', label: 'Quản lý người dùng', icon: Users },
]

export default function AdminNavigation({ onNavigate }) {
  return (
    <nav
      aria-label="Điều hướng quản trị"
      className="flex-1 space-y-2 overflow-y-auto p-4"
    >
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
              isActive
                ? 'border-orange-200 bg-orange-50 font-semibold text-orange-700 dark:border-orange-900 dark:bg-orange-950/50 dark:text-orange-300'
                : 'border-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                className={`h-5 w-5 shrink-0 ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500'}`}
              />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
