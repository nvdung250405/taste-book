import { CheckCircle2 } from 'lucide-react'

export default function RecipeSteps({ steps, checkedSteps, toggleStep }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">
        Các bước thực hiện
        <span className="ml-2 text-base font-normal text-slate-500">({steps.length} bước)</span>
      </h2>
      {steps.length === 0 ? (
        <p className="text-slate-400 text-sm">Chưa có hướng dẫn.</p>
      ) : (
        <div className="space-y-4 mb-8">
          {steps.map((step, idx) => {
            const checked = !!checkedSteps[idx]
            return (
              <div
                key={step._id || step.id || idx}
                onClick={() => toggleStep(idx)}
                className={`flex gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  checked
                    ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20 opacity-75'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-200 dark:hover:border-orange-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-all ${
                  checked
                    ? 'bg-green-500 text-white'
                    : 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
                }`}>
                  {checked ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <div className="flex-1">
                  {step.title && <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{step.title}</p>}
                  <p className={`text-sm leading-relaxed ${checked ? 'line-through text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    {step.description || step.content || step.instruction || step}
                  </p>
                  {step.image && (
                    <img src={step.image} alt={`Bước ${idx + 1}`} className="mt-3 rounded-xl w-full max-h-48 object-cover" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Progress indicator */}
      {steps.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">Tiến độ nấu ăn</span>
            <span className="font-semibold text-orange-500">
              {Object.values(checkedSteps).filter(Boolean).length}/{steps.length} bước
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${(Object.values(checkedSteps).filter(Boolean).length / steps.length) * 100}%` }}
            />
          </div>
          {Object.values(checkedSteps).filter(Boolean).length === steps.length && steps.length > 0 && (
            <p className="text-center text-green-600 dark:text-green-400 font-semibold text-sm mt-3">
              🎉 Hoàn thành! Chúc bạn ngon miệng!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
