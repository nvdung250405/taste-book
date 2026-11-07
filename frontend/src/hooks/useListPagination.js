import { useState } from 'react'

export default function useListPagination(items, filterKey, pageSize = 12) {
  const [position, setPosition] = useState({ filterKey, page: 1 })
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const page = position.filterKey === filterKey ? Math.min(position.page, totalPages) : 1

  if (position.filterKey !== filterKey || position.page !== page) {
    setPosition({ filterKey, page })
  }

  return {
    page,
    totalPages,
    visibleItems: items.slice((page - 1) * pageSize, page * pageSize),
    setPage: next => setPosition({ filterKey, page: Math.max(1, Math.min(next, totalPages)) }),
  }
}
