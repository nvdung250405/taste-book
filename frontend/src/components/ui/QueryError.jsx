import { Button } from './button'

export default function QueryError({ title = 'Không thể tải danh sách công thức', onRetry, isRetrying }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 px-4 py-16 text-center dark:border-slate-800">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-slate-500">Vui lòng kiểm tra kết nối và thử lại.</p>
      <Button onClick={onRetry} disabled={isRetrying}>{isRetrying ? 'Đang thử lại...' : 'Thử lại'}</Button>
    </div>
  )
}
