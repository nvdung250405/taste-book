export function isAdminPath(pathname) {
  return /^\/admin(?:\/|$)/i.test(pathname)
}

export function safeReturnLocation(from) {
  if (typeof from?.pathname !== 'string') return null
  const { pathname } = from
  // Only internal absolute paths; reject network URLs, backslashes and controls.
  let decoded
  try { decoded = decodeURIComponent(pathname) } catch { return null }
  if (!decoded.startsWith('/') || decoded.startsWith('//') || /[\\?#]/.test(decoded) || [...decoded].some(char => char.charCodeAt(0) <= 32)) return null
  if (pathname === '/login' || pathname === '/register' || pathname === '/403') return null
  return {
    pathname,
    search: typeof from.search === 'string' && from.search.startsWith('?') ? from.search : '',
    hash: typeof from.hash === 'string' && from.hash.startsWith('#') ? from.hash : '',
  }
}
