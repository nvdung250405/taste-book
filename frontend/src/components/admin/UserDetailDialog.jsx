import { useAdminUserDetail } from '../../hooks/queries/useUserQueries'
import QueryError from '../ui/QueryError'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'

export default function UserDetailDialog({ userId, onClose }) {
  const query = useAdminUserDetail(userId)
  const user = query.data?.DT
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết người dùng</DialogTitle>
          <DialogDescription>Thông tin tài khoản #{userId}</DialogDescription>
        </DialogHeader>
        {query.isPending ? (
          <p role="status" className="py-6 text-slate-500">
            Đang tải thông tin…
          </p>
        ) : query.isError ? (
          <QueryError
            title="Không thể tải thông tin tài khoản"
            onRetry={query.refetch}
            isRetrying={query.isFetching}
          />
        ) : user ? (
          <dl className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {[
              ['Tên người dùng', user.username],
              ['Email', user.email],
              ['Số điện thoại', user.phone],
              ['Vai trò', user.role],
            ].map(([label, value]) => (
              <div
                key={label}
                className="grid gap-1 py-3 sm:grid-cols-[140px_1fr]"
              >
                <dt className="text-slate-500">{label}</dt>
                <dd className="break-words font-medium">{value || '—'}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p role="status">Không có thông tin tài khoản.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
