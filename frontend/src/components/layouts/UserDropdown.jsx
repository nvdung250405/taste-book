import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  UserCircle,
  Plus,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react'

export default function UserDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const avatar = user?.avatar || user?.profileImage
  const name = user?.name || user?.username || 'Người dùng'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        {avatar ? (
          <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover border-2 border-orange-200" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm uppercase">
            {name.charAt(0)}
          </div>
        )}
        <span className="hidden lg:block text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">{name}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform hidden lg:block ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50">
          {/* User info */}
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
            <p className="font-semibold text-slate-900 dark:text-slate-50 text-sm truncate">{name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
          </div>

          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          >
            <UserCircle className="w-4 h-4" /> Hồ sơ cá nhân
          </Link>
          <Link
            to="/recipe/create"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          >
            <Plus className="w-4 h-4" /> Tạo công thức
          </Link>
          <Link
            to="/profile/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          >
            <Settings className="w-4 h-4" /> Cài đặt
          </Link>

          <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
            <button
              onClick={() => { setOpen(false); onLogout() }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
