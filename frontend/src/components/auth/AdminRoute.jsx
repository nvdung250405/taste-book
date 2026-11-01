import { useSyncExternalStore } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, Navigate, useLocation } from 'react-router-dom'
import authApi from '../../api/auth.api'
import { activeAccessToken, subscribeAuthSession } from '../../lib/authSession'
import { Button } from '../ui/button'

export default function AdminRoute({ children }) {
  const location = useLocation()
  const token = useSyncExternalStore(subscribeAuthSession, activeAccessToken, activeAccessToken)
  // A cached profile from a different login must never authorize this session.
  // Recheck on each protected URL and on focus/reconnect to detect revoked roles.
  const { data: profileRes, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: ['admin-access', token, location.pathname],
    queryFn: ({ signal }) => authApi.getProfile({ signal }),
    enabled: !!token,
    retry: false,
    retryOnMount: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
    refetchInterval: 60 * 1000,
  })

  if (!token) {
    return <Navigate to="/403" replace state={{ from: location }} />
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
    return <Navigate to="/403" replace state={{ from: location }} />
  }

  return children
}
