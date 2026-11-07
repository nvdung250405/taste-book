export function readAccessToken() {
  try { return localStorage.getItem('token') } catch { return null }
}

// This is only a client-side expiry check. The API verifies the signature/role.
export function activeAccessToken() {
  const token = readAccessToken()
  try {
    const parts = token.split('.')
    if (parts.length !== 3 || parts.some(part => !part)) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return Number.isFinite(payload.exp) && payload.exp * 1000 > Date.now() ? token : null
  } catch { return null }
}

function notifySessionChanged() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth-session-changed'))
}

export function subscribeAuthSession(listener) {
  window.addEventListener('storage', listener)
  window.addEventListener('auth-session-changed', listener)
  window.addEventListener('focus', listener)
  // Detect expiry and same-tab storage changes even outside our login/logout UI.
  const timer = window.setInterval(listener, 1000)
  return () => {
    window.removeEventListener('storage', listener)
    window.removeEventListener('auth-session-changed', listener)
    window.removeEventListener('focus', listener)
    window.clearInterval(timer)
  }
}

export function startAuthSession(queryClient, token) {
  clearAuthSession(queryClient)
  localStorage.setItem('token', token)
  notifySessionChanged()
}

export function clearAuthSession(queryClient) {
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  // Notify mounted profile consumers before removing the cached queries.
  queryClient.setQueryData(['profile'], null)
  // Also cancels pending queries so their results cannot restore old user data.
  queryClient.clear()
  notifySessionChanged()
}
