import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  apiCooldownSeconds,
  subscribeApiCooldown,
} from '../../lib/apiRateLimit'

export default function ApiRateLimitNotice() {
  const seconds = useSyncExternalStore(
    subscribeApiCooldown,
    apiCooldownSeconds,
    () => 0,
  )
  const previous = useRef(seconds)
  const client = useQueryClient()
  useEffect(() => {
    if (previous.current > 0 && seconds === 0) {
      // Resume only visible failed reads, never replay a mutation/user action.
      client.refetchQueries({
        type: 'active',
        predicate: (query) => query.state.error?.httpStatus === 429,
      })
    }
    previous.current = seconds
  }, [client, seconds])
  if (!seconds) return null
  return (
    <div
      role="status"
      className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900"
    >
      Máy chủ đang giới hạn yêu cầu. Vui lòng chờ {seconds} giây. Dữ liệu sẽ
      được tải lại khi hết thời gian chờ.
    </div>
  )
}
