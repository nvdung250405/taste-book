import { Minus, Plus } from 'lucide-react'

export default function PortionScaler({ servings, onChange }) {
  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
      <button
        onClick={() => onChange(Math.max(1, servings - 1))}
        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm hover:text-orange-500 transition-colors"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="text-sm font-semibold w-14 text-center text-slate-700 dark:text-slate-200">
        {servings} người
      </span>
      <button
        onClick={() => onChange(servings + 1)}
        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm hover:text-orange-500 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
