import { GripVertical, Trash2, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

export default function RecipeIngredientsForm({ formData, handleIngChange, removeIngredient, addIngredient }) {
  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Nguyên liệu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {formData.ingredients.map((ing, idx) => (
          <div key={idx} className="flex items-start gap-2 group">
            <div className="pt-2.5 cursor-move text-slate-400 hidden sm:block">
              <GripVertical className="w-4 h-4" />
            </div>
            <div className="flex-1 grid grid-cols-12 gap-2">
              <div className="col-span-12 sm:col-span-6">
                <Input
                  placeholder="Tên nguyên liệu (VD: Thịt bò)"
                  value={ing.name}
                  onChange={(e) => handleIngChange(idx, 'name', e.target.value)}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <Input
                  placeholder="Số lượng"
                  value={ing.quantity}
                  onChange={(e) => handleIngChange(idx, 'quantity', e.target.value)}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <Input
                  placeholder="Đơn vị (VD: gram)"
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
