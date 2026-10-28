import { useRef, useState } from 'react'
import { Popover } from 'radix-ui'
import { ChevronsUpDown, X } from 'lucide-react'
import { useSearchIngredients } from '../../hooks/queries/useIngredientQueries'
import { normalizeMasterName } from '../../lib/masterData'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import QueryError from '../ui/QueryError'

export default function IngredientFilter({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const optionsRef = useRef(null)
  const query = useSearchIngredients(
    {},
    { enabled: open || !!value, staleTime: 5 * 60 * 1000 },
  )
  const ingredients = Array.isArray(query.data?.DT) ? query.data.DT : []
  const selected = ingredients.find(
    (item) => String(item.ingredientId) === value,
  )
  const filtered = ingredients.filter((item) =>
    normalizeMasterName(item.ingredientName).includes(
      normalizeMasterName(search),
    ),
  )
  const choose = (id) => {
    onChange(id)
    setOpen(false)
    setSearch('')
  }
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-label="Lọc theo nguyên liệu chuẩn"
            aria-expanded={open}
            aria-haspopup="listbox"
            className="h-10 rounded-xl"
          >
            {selected?.ingredientName ||
              (value ? `Nguyên liệu #${value}` : 'Chọn nguyên liệu chuẩn')}
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className="z-50 w-80 max-w-[90vw] space-y-3 rounded-xl border bg-white p-3 shadow-xl dark:bg-slate-900"
          >
            <Input
              aria-label="Tìm nguyên liệu chuẩn"
              placeholder="Tìm nguyên liệu…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  optionsRef.current?.querySelector('button')?.focus()
                }
              }}
            />
            {query.isPending ? (
              <p role="status" className="p-3 text-sm">
                Đang tải nguyên liệu…
              </p>
            ) : query.isError ? (
              <QueryError
                title="Không thể tải nguyên liệu"
                onRetry={query.refetch}
                isRetrying={query.isFetching}
              />
            ) : (
              <div
                role="listbox"
                aria-label="Nguyên liệu chuẩn"
                ref={optionsRef}
                className="max-h-56 overflow-y-auto"
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault()
                    const next =
                      event.key === 'ArrowDown'
                        ? event.target.nextElementSibling
                        : event.target.previousElementSibling
                    next?.focus()
                  }
                }}
              >
                {filtered.length ? (
                  filtered.map((item) => (
                    <button
                      key={item.ingredientId}
                      role="option"
                      aria-selected={String(item.ingredientId) === value}
                      onClick={() => choose(String(item.ingredientId))}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-orange-50 focus:bg-orange-50 dark:hover:bg-slate-800 dark:focus:bg-slate-800 ${String(item.ingredientId) === value ? 'font-semibold text-orange-600' : ''}`}
                    >
                      {item.ingredientName}
                    </button>
                  ))
                ) : (
                  <p className="p-3 text-sm text-slate-500">
                    Không tìm thấy nguyên liệu.
                  </p>
                )}
              </div>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {value && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => choose('')}
          aria-label="Bỏ lọc nguyên liệu"
          className="rounded-full text-orange-700 dark:text-orange-300"
        >
          {selected?.ingredientName || `Nguyên liệu #${value}`}
          <X className="ml-1 h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
