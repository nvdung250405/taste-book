import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Soup,
  Flame,
  Fish,
  UtensilsCrossed,
  Salad,
  CakeSlice,
  Leaf,
  Coffee,
  Users,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'

// Map đúng với 9 danh mục trong seed (theo id và categoryName)
const CATEGORY_STYLES = {
  1: { icon: <UtensilsCrossed className="w-6 h-6" />, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },        // Món chính
  2: { icon: <Soup className="w-6 h-6" />,            color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },       // Món canh
  3: { icon: <Flame className="w-6 h-6" />,           color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' }, // Món kho
  4: { icon: <Fish className="w-6 h-6" />,            color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' }, // Món xào
  5: { icon: <Salad className="w-6 h-6" />,           color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },    // Bún - Mì - Phở
  6: { icon: <CakeSlice className="w-6 h-6" />,       color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },       // Khai vị & Ăn vặt
  7: { icon: <Leaf className="w-6 h-6" />,            color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' }, // Món chay
  8: { icon: <Coffee className="w-6 h-6" />,          color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },   // Tráng miệng & Đồ uống
  9: { icon: <Users className="w-6 h-6" />,           color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' }, // Đóng góp cộng đồng
}

const FALLBACK_STYLE = { icon: <UtensilsCrossed className="w-6 h-6" />, color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' }

function CategorySkeletons() {
  return (
    <div className="flex gap-6 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex-none w-44 flex flex-col items-center gap-4 p-8 rounded-2xl border border-slate-200 dark:border-slate-800"
        >
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

export default function CategorySection({ categories, loadingCats }) {
  const scrollRef = useRef(null)
  const navigate = useNavigate()

  const scroll = (dir) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })
  }

  return (
    <section className="container mx-auto px-4 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Khám phá danh mục
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Lựa chọn món ăn theo sở thích của bạn
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate('/search')}
          className="hidden sm:flex text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/50"
        >
          Xem tất cả <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Content */}
      {loadingCats ? (
        <CategorySkeletons />
      ) : (
        <div className="relative group/carousel">
          {/* Left arrow — overlay căn giữa với card */}
          <button
            onClick={() => scroll('left')}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20
              w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
              shadow-md items-center justify-center text-slate-600 dark:text-slate-300
              hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200
              dark:hover:bg-orange-950/30 dark:hover:text-orange-400
              opacity-0 group-hover/carousel:opacity-100 transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right arrow — overlay căn giữa với card */}
          <button
            onClick={() => scroll('right')}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20
              w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
              shadow-md items-center justify-center text-slate-600 dark:text-slate-300
              hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200
              dark:hover:bg-orange-950/30 dark:hover:text-orange-400
              opacity-0 group-hover/carousel:opacity-100 transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Gradient fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent z-10" />

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-3 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => {
              const id = category.categoryId || category.id || category._id
              const name = category.categoryName || category.name || category.title
              const style = CATEGORY_STYLES[id] || FALLBACK_STYLE

              return (
                <div
                  key={id}
                  onClick={() => navigate(`/search?categoryId=${id}`)}
                  className="flex-none snap-start w-44 flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-300 cursor-pointer group"
                >
                  <div className={`p-4 rounded-full ${style.color} group-hover:scale-110 transition-transform duration-300`}>
                    {style.icon}
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 text-center text-sm line-clamp-2 leading-snug">
                    {name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mobile: view all */}
      <div className="mt-4 flex justify-center sm:hidden">
        <Button
          variant="ghost"
          onClick={() => navigate('/search')}
          className="text-orange-500 hover:text-orange-600"
        >
          Xem tất cả danh mục <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </section>
  )
}
