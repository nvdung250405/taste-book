import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function ProtectedRoute() {
  const location = useLocation()
  const token = localStorage.getItem('token')
  const [now] = useState(Date.now)
  let valid = false
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
    )
    valid = typeof payload.exp === 'number' && payload.exp * 1000 > now
  } catch {
    // Missing or malformed tokens cannot open private pages.
  }
  return valid ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  )
}
