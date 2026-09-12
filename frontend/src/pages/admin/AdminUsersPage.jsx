import { useState } from 'react'
import { Users, Search, Eye } from 'lucide-react'
import { useAdminUsers } from '../../hooks/queries/useUserQueries'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

export default function AdminUsersPage() {
  const [keyword, setKeyword] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const { data: res, isLoading } = useAdminUsers({ keyword: keyword || undefined, role: roleFilter || undefined })
  const users = res?.DT?.users || res?.DT || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Quản lý người dùng</h1>
        <p className="text-slate-500">Xem và quản lý danh sách tài khoản trên hệ thống</p>
      </div>

      {/* Bộ lọc */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo email, tên..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Tất cả vai trò</option>
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bảng người dùng */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-500" />
            <CardTitle className="text-base font-semibold">Danh sách người dùng</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">Đang tải...</div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Users className="w-12 h-12 opacity-30" />
              <p>Không tìm thấy người dùng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left px-6 py-3 font-medium text-slate-500">ID</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-500">Người dùng</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-500">Email</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-500">Số điện thoại</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-500">Vai trò</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-500">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id || user.userId}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">#{user.id || user.userId}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xs uppercase">
                              {(user.username || 'U').charAt(0)}
                            </div>
                          )}
                          <span className="font-medium text-slate-800 dark:text-slate-200">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.phone || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'Admin'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
