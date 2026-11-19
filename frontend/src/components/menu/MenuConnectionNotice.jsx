import { useEffect, useSyncExternalStore } from 'react'
import { toast } from 'sonner'

const subscribe = callback => {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}
const snapshot = () => navigator.onLine !== false

export default function MenuConnectionNotice({ query }) {
  const online = useSyncExternalStore(subscribe, snapshot, () => true)
  const { refetch } = query
  useEffect(() => {
    let active = true
    const reconnect = async () => {
      const result = await refetch()
      if (active && !result.isError && navigator.onLine !== false) toast.success('Đã khôi phục kết nối mạng. Dữ liệu đã được cập nhật.')
    }
    window.addEventListener('online', reconnect)
    return () => { active = false; window.removeEventListener('online', reconnect) }
  }, [refetch])
  if (online && !query.error?.isNetworkError) return null
  return <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Mất kết nối Internet. {query.data ? 'Dữ liệu thực đơn đang được hiển thị từ bộ nhớ đệm' : 'Không thể tải dữ liệu thực đơn'} và các thay đổi sẽ không được lưu. Kết nối lại để tiếp tục.</p>
}
