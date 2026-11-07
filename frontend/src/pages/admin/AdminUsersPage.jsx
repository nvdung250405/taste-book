import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Users, Search, Eye, RefreshCw, X } from 'lucide-react'
import { useAdminUsers } from '../../hooks/queries/useUserQueries'
import useCollectionParams from '../../hooks/useCollectionParams'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card } from '../../components/ui/card'
import QueryError from '../../components/ui/QueryError'
import ListPagination from '../../components/ui/ListPagination'
import UserDetailDialog from '../../components/admin/UserDetailDialog'

export default function AdminUsersPage() {
  const { page, search, searchQuery, setSearchQuery, setPage } =
    useCollectionParams()
  const [params, setParams] = useSearchParams()
  const role = ['Admin', 'User'].includes(params.get('role'))
    ? params.get('role')
    : ''
  const [selectedId, setSelectedId] = useState(null)
  const query = useAdminUsers({
    page,
    limit: 20,
    ...(search.trim() && { keyword: search.trim() }),
    ...(role && { role }),
  })
  const users = query.data?.DT?.users || []
  const total = query.data?.DT?.total ?? 0
  const totalPages = Math.max(1, query.data?.DT?.totalPages || 1)
  useEffect(() => {
    if (query.isSuccess && !query.isFetching && page > totalPages)
      setPage(totalPages)
  }, [query.isSuccess, query.isFetching, page, totalPages, setPage])
  const changeRole = (value) => {
    const next = new URLSearchParams(params)
    if (value) next.set('role', value)
    else next.delete('role')
    if (searchQuery) next.set('search', searchQuery)
    else next.delete('search')
    next.delete('page')
    setParams(next)
  }
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400">
            <Users className="h-4 w-4" />
            Quản trị tài khoản
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Quản lý người dùng
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Tra cứu thông tin các tài khoản trên hệ thống.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={query.isFetching}
          onClick={() => query.refetch()}
        >
          <RefreshCw
            className={`h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`}
          />
          Làm mới
        </Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            aria-label="Tìm người dùng theo email, tên hoặc số điện thoại"
            placeholder="Tìm tên, email hoặc số điện thoại…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-11 rounded-xl bg-white pl-9 pr-10 dark:bg-slate-950"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Xóa tìm kiếm"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          aria-label="Lọc vai trò người dùng"
          value={role}
          onChange={(event) => changeRole(event.target.value)}
          className="h-11 rounded-xl border bg-white px-3 text-sm dark:bg-slate-950"
        >
          <option value="">Tất cả vai trò</option>
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
      {query.isError ? (
        <QueryError
          title="Không thể tải người dùng"
          onRetry={query.refetch}
          isRetrying={query.isFetching}
        />
      ) : (
        <Card className="gap-0 overflow-hidden rounded-2xl py-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <caption className="sr-only">Danh sách người dùng</caption>
              <thead className="border-b bg-slate-50 text-slate-500 dark:bg-slate-900">
                <tr>
                  {[
                    'Mã',
                    'Người dùng',
                    'Email',
                    'Số điện thoại',
                    'Vai trò',
                    'Ngày tạo',
                    'Thao tác',
                  ].map((label) => (
                    <th
                      key={label}
                      scope="col"
                      className="px-4 py-3 font-medium"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {query.isPending ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-12 text-center text-slate-500"
                      role="status"
                    >
                      Đang tải danh sách…
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500">
                      {search || role
                        ? 'Không tìm thấy tài khoản phù hợp.'
                        : 'Chưa có người dùng nào.'}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.userId}
                      className="hover:bg-orange-50/50 dark:hover:bg-orange-950/20"
                    >
                      <td className="px-4 py-4 font-mono text-xs text-slate-500">
                        #{user.userId}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                          >
                            {(user.username || 'U').charAt(0).toUpperCase()}
                          </span>
                          <span className="max-w-48 break-words font-medium">
                            {user.username || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="max-w-64 break-words px-4 py-4">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        {user.phone || '—'}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.role === 'Admin' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                          : '—'}
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Xem chi tiết"
                          aria-label={`Xem chi tiết ${user.username}`}
                          onClick={() => setSelectedId(user.userId)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!query.isPending && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4 [&_nav]:mt-0">
              <p aria-live="polite" className="text-sm text-slate-500">
                {total ? (page - 1) * 20 + 1 : 0}–{Math.min(page * 20, total)} /{' '}
                {total} tài khoản
              </p>
              <ListPagination
                {...{ page, totalPages }}
                onPageChange={setPage}
              />
            </div>
          )}
        </Card>
      )}
      {selectedId !== null && (
        <UserDetailDialog
          userId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
