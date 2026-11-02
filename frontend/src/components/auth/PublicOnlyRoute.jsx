import { useSyncExternalStore } from 'react'
import { useIsMutating } from '@tanstack/react-query'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useProfile } from '../../hooks/queries/useAuthQueries'
import { readAccessToken, subscribeAuthSession } from '../../lib/authSession'

export default function PublicOnlyRoute() {
  const { pathname } = useLocation()
  const token = useSyncExternalStore(
    subscribeAuthSession,
    readAccessToken,
    readAccessToken,
  )
  const loggingIn = useIsMutating({ mutationKey: ['login'] }) > 0
  const profile = useProfile({
    enabled: !!token,
  })
  // Let the submitted login finish its own return navigation before redirecting.
  if (loggingIn && pathname === '/login') return <Outlet />
  if (token && profile.isPending)
    return (
      <p role="status" className="py-16 text-center">
        Đang kiểm tra phiên đăng nhập…
      </p>
    )
  // Match Header's verified session, including after a failed background refresh.
  if (token && profile.data?.DT) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
