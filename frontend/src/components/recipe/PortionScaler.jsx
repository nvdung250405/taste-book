import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { validServings } from '../../lib/menuLists'

export default function PortionScaler({ servings, onChange }) {
  const [draft, setDraft] = useState(null)
  const commit = () => {
    if (draft === null) return
    if (validServings(draft)) onChange(Number(draft))
    else toast.error('Khẩu phần phải là số nguyên từ 1 đến 100 người.')
    setDraft(null)
  }
  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
      <button
        type="button" disabled={servings <= 1}
        aria-label="Giảm khẩu phần" onClick={() => onChange(Math.max(1, servings - 1))}
        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm hover:text-orange-500 transition-colors disabled:opacity-40"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <label className="flex w-14 flex-col items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
        <input
          aria-label="Số người"
          type="text"
          inputMode="numeric"
          value={draft ?? String(servings)}
          onChange={event => { if (/^\d*$/.test(event.target.value)) setDraft(event.target.value) }}
          onBlur={commit}
          onKeyDown={event => {
            if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur() }
            if (event.key === 'Escape') { event.preventDefault(); setDraft(null) }
          }}
          className="w-full rounded bg-transparent text-center outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        />
        <span>người</span>
      </label>
      <button
        type="button" disabled={servings >= 100}
        aria-label="Tăng khẩu phần" onClick={() => onChange(Math.min(100, servings + 1))}
        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm hover:text-orange-500 transition-colors disabled:opacity-40"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
