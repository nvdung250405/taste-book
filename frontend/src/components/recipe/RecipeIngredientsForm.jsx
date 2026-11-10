import { isQualitativeUnit } from '../../lib/shoppingList'
import { useId } from 'react'
import { GripVertical, Trash2, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

export default function RecipeIngredientsForm({
  formData,
  handleIngChange,
  removeIngredient,
  addIngredient,
  ingredients = [],
  units = [],
  loading,
  error,
  onRetry,
}) {
  const listId = useId()
  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Nguyên liệu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-500">
          Nhập tên nguyên liệu riêng hoặc bấm “Dùng nguyên liệu chuẩn” bên dưới
          ô tên để chọn nguyên liệu có sẵn và tự điền đơn vị.
        </p>
        {loading && (
          <p role="status" className="text-sm text-slate-500">
            Đang tải gợi ý nguyên liệu và đơn vị…
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-amber-700">
            Không thể tải một số gợi ý.{' '}
            <button type="button" onClick={onRetry} className="underline">
              Thử lại
            </button>
          </p>
        )}
        <datalist id={listId + '-ingredients'}>
          {ingredients.map((item) => (
            <option key={item.ingredientId} value={item.ingredientName}>
              {item.defaultUnit?.unitName || 'Nguyên liệu chuẩn'}
            </option>
          ))}
        </datalist>
        <datalist id={listId + '-units'}>
          {units.map((item) => (
            <option key={item.unitId} value={item.unitName} />
          ))}
        </datalist>
        {formData.ingredients.map((ing, idx) => (
          <div key={idx} className="flex items-start gap-2 group">
            <div className="pt-2.5 cursor-move text-slate-400 hidden sm:block">
              <GripVertical className="w-4 h-4" />
            </div>
            <div className="flex-1 grid grid-cols-12 gap-2">
              <div className="col-span-12 sm:col-span-6">
                <Input
                  aria-label={`Tên nguyên liệu ${idx + 1}`}
                  placeholder="Tên nguyên liệu (VD: Thịt bò)"
                  list={listId + '-ingredients'}
                  autoComplete="off"
                  value={ing.name}
                  onChange={(e) => handleIngChange(idx, 'name', e.target.value)}
                />
                {ing.ingredientId ? (
                  <span className="text-xs text-emerald-700">
                    Nguyên liệu chuẩn
                    <button type="button" onClick={() => handleIngChange(idx, 'ingredientId', null)} className="ml-2 underline">Dùng tự do</button>
                  </span>
                ) : <span className="text-xs text-slate-500">Tự nhập</span>}
                {!ing.ingredientId && ingredients.filter(item => item.ingredientName.trim().toLocaleLowerCase('vi') === ing.name.trim().toLocaleLowerCase('vi')).map(item => (
                  <button key={item.ingredientId} type="button" className="mt-1 block text-left text-xs text-emerald-700 underline" onClick={() => handleIngChange(idx, 'ingredientId', item.ingredientId)}>
                    Dùng nguyên liệu chuẩn: {item.ingredientName} ({item.defaultUnit?.unitName || 'Chưa có đơn vị'})
                  </button>
                ))}
              </div>
              <div className="col-span-6 sm:col-span-3">
                <Input
                  aria-label={`Số lượng nguyên liệu ${idx + 1}`}
                  placeholder="Số lượng"
                  disabled={isQualitativeUnit(ing.unit)}
                  value={isQualitativeUnit(ing.unit) ? '' : ing.quantity}
                  onChange={(e) =>
                    handleIngChange(idx, 'quantity', e.target.value)
                  }
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <Input
                  aria-label={`Đơn vị nguyên liệu ${idx + 1}`}
                  placeholder="Đơn vị (VD: gram)"
                  list={listId + '-units'}
                  disabled={!!ing.ingredientId}
                  title={
                    ing.ingredientId
                      ? 'Đơn vị mặc định của nguyên liệu chuẩn'
                      : undefined
                  }
                  value={ing.unit}
                  onChange={(e) => handleIngChange(idx, 'unit', e.target.value)}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label={`Xóa nguyên liệu ${idx + 1}`}
              onClick={() => removeIngredient(idx)}
              disabled={formData.ingredients.length === 1}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="w-full mt-2 border-dashed border-2 text-slate-500 hover:text-orange-500 hover:border-orange-200"
          onClick={addIngredient}
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm nguyên liệu
        </Button>
      </CardContent>
    </Card>
  )
}
