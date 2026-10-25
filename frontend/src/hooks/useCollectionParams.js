import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'

export default function useCollectionParams() {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const [draft, setDraft] = useState(null)
  const search = params.get('search') || ''
  const searchQuery = draft?.key === location.key ? draft.value : search
  const rawPage = Number(params.get('page'))
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1

  useEffect(() => {
    if (searchQuery === search) return
    const timer = setTimeout(() => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          if (searchQuery) next.set('search', searchQuery)
          else next.delete('search')
          next.delete('page')
          return next
        },
        { replace: true },
      )
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, search, location.key, setParams])

  const update = (changes) => {
    const next = new URLSearchParams(params)
    if (searchQuery) next.set('search', searchQuery)
    else next.delete('search')
    next.delete('page')
    Object.entries(changes).forEach(([key, value]) => {
      if (value && value !== 'all') next.set(key, String(value))
      else next.delete(key)
    })
    setDraft(null)
    setParams(next)
  }

  return {
    page,
    search,
    searchQuery,
    status: params.get('status') || 'all',
    setSearchQuery: (value) => setDraft({ key: location.key, value }),
    setPage: (value) =>
      update({ page: searchQuery === search && value > 1 ? value : '' }),
    setStatus: (value) => update({ status: value }),
    reset: () => {
      setDraft(null)
      setParams({})
    },
  }
}
