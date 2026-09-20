import {
  ArrowRight,
  Flame,
  Leaf,
  Beef,
  CakeSlice,
  Salad,
  Pizza,
  Loader2
} from 'lucide-react'
import { Button } from '../ui/button'

const CATEGORY_STYLES = [
  { icon: <Salad className="w-6 h-6" />, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
  { icon: <Pizza className="w-6 h-6" />, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  { icon: <Leaf className="w-6 h-6" />, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { icon: <Beef className="w-6 h-6" />, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  { icon: <CakeSlice className="w-6 h-6" />, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
  { icon: <Flame className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
]

export default function CategorySection({ categories, loadingCats }) {
  return (
    <section className="container mx-auto px-4 mt-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Khám phá danh mục</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Lựa chọn món ăn theo sở thích của bạn</p>
        </div>
        <Button variant="ghost" className="hidden sm:flex text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/50">
          Xem tất cả <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {loadingCats ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((category, idx) => {
            const style = CATEGORY_STYLES[idx % CATEGORY_STYLES.length];
            return (
              <div 
                key={category._id || category.id} 
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900 transition-all cursor-pointer group"
              >
                <div className={`p-4 rounded-full ${style.color} group-hover:scale-110 transition-transform duration-300`}>
                  {style.icon}
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-center line-clamp-1">{category.name || category.title}</span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
