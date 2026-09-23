import PortionScaler from './PortionScaler'

export default function RecipeIngredients({ ingredients, actualServings, setServings, ratio }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
          Nguyên liệu
          <span className="ml-2 text-base font-normal text-slate-500">({ingredients.length} loại)</span>
        </h2>
        {/* Servings adjuster */}
        <PortionScaler servings={actualServings} onChange={setServings} />
      </div>

      {ingredients.length === 0 ? (
        <p className="text-slate-400 text-sm">Chưa có thông tin nguyên liệu.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ingredients.map((ing, idx) => {
            const name = ing.ingredient?.name || ing.customIngredientName || ing.name || `Nguyên liệu ${idx + 1}`
            const qty = ing.quantity ? (ing.quantity * ratio).toFixed(ratio !== 1 ? 1 : 0) : ''
            const unit = ing.unitGroup?.name || ing.customUnit || ing.unit || ing.ingredient?.unit || ''
            return (
              <div
                key={ing._id || ing.id || idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-orange-200 dark:hover:border-orange-900 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                <span className="flex-1 text-slate-700 dark:text-slate-300 text-sm">{name}</span>
                {qty && (
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 shrink-0">
                    {qty} {unit}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
