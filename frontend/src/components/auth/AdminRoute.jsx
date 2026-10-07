import { Link, Navigate } from 'react-router-dom'
import { useProfile } from '../../hooks/queries/useAuthQueries'
import { Button } from '../ui/button'

export default function AdminRoute({ children }) {
  const hasToken = !!localStorage.getItem('token')
  const { data: profileRes, isPending, isFetching, isError, refetch } = useProfile()

  if (!hasToken) {
    return <Navigate to="/login" replace />
  }

  // Wait for the current profile before mounting any admin pages or queries.
  if (isPending || isFetching) {
    return (
      <div role="status" className="flex min-h-screen items-center justify-center gap-3 text-slate-600 dark:text-slate-300">
        <div aria-hidden="true" className="h-6 w-6 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        Đang kiểm tra quyền truy cập...
      </div>
    )
  }

  if (isError || !profileRes?.DT) {
    return (
      <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold">Không thể kiểm tra quyền truy cập</h1>
        <p className="text-slate-500">Vui lòng thử lại để tải thông tin tài khoản.</p>
        <Button onClick={() => refetch()}>Thử lại</Button>
        <Link to="/" className="text-orange-500 hover:underline">Về trang chủ</Link>
      </div>
    )
  }

  if (profileRes.DT.role !== 'Admin') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-6xl font-bold text-slate-300">403</p>
        <h1 className="text-2xl font-bold">Bạn không có quyền truy cập trang quản trị</h1>
        <Button asChild><Link to="/">Về trang chủ</Link></Button>
      </div>
    )
  }

  return children
}
