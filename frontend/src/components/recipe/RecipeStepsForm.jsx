import { Trash2, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

export default function RecipeStepsForm({ formData, handleStepChange, removeStep, addStep }) {
  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Các bước thực hiện</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {formData.steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center shrink-0">
              {idx + 1}
            </div>
            <div className="flex-1 space-y-3">
              <Input
                placeholder={`Tiêu đề bước ${idx + 1} (Không bắt buộc)`}
                value={step.title}
                onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                className="bg-white dark:bg-slate-900"
              />
              <textarea
                placeholder="Mô tả chi tiết cách làm..."
                value={step.content}
                onChange={(e) => handleStepChange(idx, 'content', e.target.value)}
                className="flex w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:border-slate-800 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300 min-h-[80px] bg-white dark:bg-slate-900 resize-none"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => removeStep(idx)}
              disabled={formData.steps.length === 1}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="w-full mt-2 border-dashed border-2 text-slate-500 hover:text-orange-500 hover:border-orange-200"
          onClick={addStep}
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm bước mới
        </Button>
      </CardContent>
    </Card>
  )
}
