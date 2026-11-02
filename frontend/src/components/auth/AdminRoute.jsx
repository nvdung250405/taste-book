import { useSyncExternalStore } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, Navigate, useLocation } from 'react-router-dom'
import authApi from '../../api/auth.api'
import { activeAccessToken, subscribeAuthSession } from '../../lib/authSession'
import { Button } from '../ui/button'

export default function AdminRoute({ children }) {
  const location = useLocation()
  const token = useSyncExternalStore(
    subscribeAuthSession,
    activeAccessToken,
    activeAccessToken,
  )
  // A cached profile from a different login must never authorize this session.
  // Share verification across Admin URLs; API requests still enforce permissions.
  const {
    data: profileRes,
    error,
    isPending,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin-access', token],
    queryFn: ({ signal }) => authApi.getProfile({ signal }),
    enabled: !!token,
    retry: false,
    retryOnMount: false,
    staleTime: 60 * 1000,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: (query) => !query.state.error?.retryAfterSeconds,
    refetchOnReconnect: (query) => !query.state.error?.retryAfterSeconds,
    refetchInterval: (query) =>
      Math.max(60 * 1000, (query.state.error?.retryAfterSeconds || 0) * 1000),
  })

  if (!token) {
    return <Navigate to="/403" replace state={{ from: location }} />
  }

  // Block the initial verification, but never destroy a verified session's form
  // state just because a background refresh is pending or temporarily fails.
  if (!profileRes?.DT && (isPending || isFetching)) {
    return (
      <div
        role="status"
        className="flex min-h-screen items-center justify-center gap-3 text-slate-600 dark:text-slate-300"
      >
        <div
          aria-hidden="true"
          className="h-6 w-6 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"
        />
        Đang kiểm tra quyền truy cập...
      </div>
    )
  }

  if (!profileRes?.DT) {
    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
      >
        <h1 className="text-2xl font-bold">
          Không thể kiểm tra quyền truy cập
        </h1>
        <p className="text-slate-500">
          {error?.EM || 'Vui lòng thử lại để tải thông tin tài khoản.'}
        </p>
        <Button onClick={() => refetch()}>Thử lại</Button>
        <Link to="/" className="text-orange-500 hover:underline">
          Về trang chủ
        </Link>
      </div>
    )
  }

  if (profileRes.DT.role !== 'Admin') {
    return <Navigate to="/403" replace state={{ from: location }} />
  }

  return (
    <>
      {isError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <p>
            Chưa thể kiểm tra lại phiên đăng nhập.{' '}
            {error?.EM || 'Vui lòng kiểm tra kết nối và thử lại.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            {isFetching ? 'Đang kiểm tra…' : 'Thử lại'}
          </Button>
        </div>
      )}
      {children}
    </>
  )
}
