const storageKey = 'tastebook:api-cooldown-until'
let blockedUntil = 0

export function apiCooldownSeconds() {
  try {
    const saved = Number(localStorage.getItem(storageKey))
    if (Number.isFinite(saved)) blockedUntil = Math.max(blockedUntil, saved)
  } catch {
    /* Storage may be unavailable. */
  }
  return Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000))
}

export function rateLimitError(seconds) {
  return {
    httpStatus: 429,
    retryAfterSeconds: seconds,
    EM: `Máy chủ đang giới hạn yêu cầu. Vui lòng thử lại sau ${seconds} giây.`,
  }
}

export function pauseApiRequests(seconds) {
  const delay = Number.isFinite(seconds) && seconds >= 0 ? seconds : 60
  blockedUntil = Math.max(blockedUntil, Date.now() + delay * 1000)
  try {
    localStorage.setItem(storageKey, String(blockedUntil))
  } catch {
    /* In-memory fallback. */
  }
  if (typeof window !== 'undefined')
    window.dispatchEvent(new Event('api-rate-limit'))
}

export function subscribeApiCooldown(listener) {
  window.addEventListener('api-rate-limit', listener)
  window.addEventListener('storage', listener)
  const timer = window.setInterval(listener, 1000)
  return () => {
    window.removeEventListener('api-rate-limit', listener)
    window.removeEventListener('storage', listener)
    window.clearInterval(timer)
  }
}
