import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Star,
  Clock,
  ChefHat,
  Heart,
  Sparkles,
  Users,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { toast } from 'sonner'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RecipeCardSkeleton() {
  return (
    <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <Skeleton className="h-56 w-full rounded-none" />
      <CardContent className="p-5 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}

function RecipeSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ─── Recipe Card ──────────────────────────────────────────────────────────────

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800&auto=format&fit=crop'

const DIFFICULTY_MAP = {
  Easy: 'Dễ',
  Medium: 'Trung bình',
  Hard: 'Khó',
}

function RecipeCard({ recipe, rank }) {
  return (
    <div className="relative">
      {/* Rank badge (top 3 of trending) */}
      {rank != null && rank < 3 && (
        <div
          className={`absolute -top-3 -left-3 z-20 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md
            ${rank === 0 ? 'bg-yellow-400 text-yellow-900' : rank === 1 ? 'bg-slate-300 text-slate-700' : 'bg-orange-400 text-orange-900'}`}
        >
          {rank + 1}
        </div>
      )}

      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full">
        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={recipe.thumbnailUrl || recipe.thumbnail || recipe.image || FALLBACK_IMAGE}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = FALLBACK_IMAGE }}
          />
          {/* Tags (Categories) */}
          <div className="absolute top-4 left-4 flex gap-2">
            {(recipe.categories || recipe.tags || []).slice(0, 2).map((cat, idx) => (
              <Badge
                key={cat.categoryId || cat.id || cat._id || idx}
                className="bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border-none text-xs"
              >
                {cat.categoryName || cat.name || String(cat)}
              </Badge>
            ))}
          </div>
          {/* Favorite */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              size="icon"
              variant="secondary"
              onClick={(e) => { e.preventDefault(); toast.info('Chức năng yêu thích yêu cầu đăng nhập'); }}
              className="rounded-full w-8 h-8 bg-white/80 hover:bg-white text-slate-400 hover:text-red-500 transition-colors backdrop-blur-sm relative"
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-5">
          {/* Meta */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-orange-500">
              <Star className="w-4 h-4 fill-orange-500" />
              <span className="font-semibold">{recipe.rating || '4.5'}</span>
              <span className="text-slate-400 text-sm">({recipe.reviews || 0})</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {recipe.cookTimeMinutes ? `${recipe.cookTimeMinutes}p` : recipe.prepTime || recipe.time || '30p'}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {recipe.defaultServings || recipe.servings || 2}
              </div>
              <div className="flex items-center gap-1">
                <ChefHat className="w-4 h-4" />
                {DIFFICULTY_MAP[recipe.difficulty] || recipe.difficulty || 'Dễ'}
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2 line-clamp-1 group-hover:text-orange-500 transition-colors">
            <Link to={`/recipe/${recipe.recipeId || recipe.id || recipe._id}`} className="after:absolute after:inset-0">{recipe.title}</Link>
          </h3>

          {/* Author */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold text-xs uppercase">
              {(recipe.author?.username || recipe.author?.name || recipe.user?.username || recipe.user?.name || 'C').charAt(0)}
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 line-clamp-1">
              {recipe.author?.username || recipe.author?.name || recipe.user?.username || recipe.user?.name || 'TasteBook Chef'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Latest Recipes Section ───────────────────────────────────────────────────

export function LatestRecipesSection({ recipes, isLoading }) {
  const navigate = useNavigate()
  return (
    <section className="container mx-auto px-4 mt-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Công thức mới nhất
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Những công thức vừa được chia sẻ từ cộng đồng
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

      {isLoading ? (
        <RecipeSkeletonGrid count={6} />
      ) : recipes.length === 0 ? (
        <div className="text-center py-12 text-slate-500">Chưa có công thức nào.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.recipeId || recipe.id || recipe._id} recipe={recipe} />
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Trending Recipes Section ─────────────────────────────────────────────────

export function TrendingRecipesSection({ recipes, isLoading }) {
  const navigate = useNavigate()
  return (
    <section className="container mx-auto px-4 mt-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              Món ngon thịnh hành
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <Sparkles className="w-3 h-3" />
              HOT
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Được yêu thích và tìm kiếm nhiều nhất tuần này
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

      {isLoading ? (
        <RecipeSkeletonGrid count={6} />
      ) : recipes.length === 0 ? (
        <div className="text-center py-12 text-slate-500">Chưa có công thức nào.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe, idx) => (
            <RecipeCard key={recipe.recipeId || recipe.id || recipe._id || idx} recipe={recipe} rank={idx} />
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Legacy default export (backward compat) ─────────────────────────────────

export default function FeaturedRecipesSection({ recipes, loadingRecipes }) {
  return <LatestRecipesSection recipes={recipes} isLoading={loadingRecipes} />
}
