import { Star, Clock, ChefHat, Users } from 'lucide-react'
import { Card, CardContent } from '../ui/card'

export default function RecipeQuickInfo({ recipe, actualServings }) {
  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <Star className="w-5 h-5 text-orange-500 fill-orange-400" />
          <span className="text-lg font-bold text-slate-900 dark:text-slate-50">{recipe.rating || '—'}</span>
          <span className="text-xs text-slate-500">{recipe.reviews || 0} đánh giá</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <Clock className="w-5 h-5 text-blue-500" />
          <span className="text-lg font-bold text-slate-900 dark:text-slate-50">{recipe.prepTime || recipe.time || '—'}</span>
          <span className="text-xs text-slate-500">Thời gian</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <ChefHat className="w-5 h-5 text-purple-500" />
          <span className="text-lg font-bold text-slate-900 dark:text-slate-50">{recipe.difficulty || '—'}</span>
          <span className="text-xs text-slate-500">Độ khó</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <Users className="w-5 h-5 text-green-500" />
          <span className="text-lg font-bold text-slate-900 dark:text-slate-50">{actualServings}</span>
          <span className="text-xs text-slate-500">Khẩu phần</span>
        </div>
      </CardContent>
    </Card>
  )
}
