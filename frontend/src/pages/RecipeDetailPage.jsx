import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChefHat, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useRecipeDetail } from '../hooks/queries/useRecipeQueries'
import { useAddFavorite, useRemoveFavorite, useFavorites } from '../hooks/queries/useFavoriteQueries'
import { useProfile } from '../hooks/queries/useAuthQueries'
import { toast } from 'sonner'

import { Badge } from '../components/ui/badge'

import RecipeHero from '../components/recipe/RecipeHero'
import RecipeQuickInfo from '../components/recipe/RecipeQuickInfo'
import RecipeIngredients from '../components/recipe/RecipeIngredients'
import RecipeSteps from '../components/recipe/RecipeSteps'
import RecipeSidebar from '../components/recipe/RecipeSidebar'

const DIFFICULTY_TEXT = {
  'Easy': 'Dễ',
  'Medium': 'Trung bình',
  'Hard': 'Khó',
}

export default function RecipeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: recipeRes, isLoading, error } = useRecipeDetail(id)
  const { data: profileRes } = useProfile()
  const { data: favRes } = useFavorites()
  const { mutate: addFav, isPending: adding } = useAddFavorite()
  const { mutate: removeFav, isPending: removing } = useRemoveFavorite()

  const [servings, setServings] = useState(null)  // null = dùng servings gốc
  const [checkedSteps, setCheckedSteps] = useState({})

  const recipe = recipeRes?.DT || null
  const isLoggedIn = !!profileRes?.DT

  // Check if recipe is favorited
  const favorites = Array.isArray(favRes?.DT) ? favRes.DT : (favRes?.DT?.items || [])
  const isFavorited = favorites.some(f => {
    const rid = f.recipe?._id || f.recipe?.id || f._id || f.id
    return rid === id
  })

  const actualServings = servings || recipe?.defaultServings || recipe?.servings || 4
  const originalServings = recipe?.defaultServings || recipe?.servings || 4
  const ratio = actualServings / originalServings

  const toggleStep = (idx) => setCheckedSteps(p => ({ ...p, [idx]: !p[idx] }))

  const handleFavorite = () => {
    if (!isLoggedIn) { toast.error('Vui lòng đăng nhập để thêm yêu thích'); return }
    if (isFavorited) {
      removeFav(id, {
        onSuccess: () => toast.success('Đã xóa khỏi yêu thích'),
        onError: () => toast.error('Thất bại'),
      })
    } else {
      addFav({ recipeId: id, data: {} }, {
        onSuccess: () => toast.success('Đã thêm vào yêu thích ❤️'),
        onError: () => toast.error('Thất bại'),
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        <p className="text-slate-500">Đang tải công thức...</p>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <ChefHat className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">Không tìm thấy công thức</h2>
        <p className="text-slate-500 text-sm">Công thức này có thể đã bị xóa hoặc không tồn tại.</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
      </div>
    )
  }

  const ingredients = recipe.ingredients || []
  const steps = recipe.cookingSteps || recipe.steps || []
  const tags = recipe.categories || recipe.tags || []
  const author = recipe.author || recipe.user || {}

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      {/* Header */}
      <div className="mb-6 lg:mb-8 mt-2">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-slate-50 mb-4 tracking-tight leading-tight">
          {recipe.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag, idx) => (
            <Badge key={tag.categoryId || tag.id || tag._id || idx} variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 border-none px-3 py-1 text-sm font-medium">
              {tag.categoryName || tag.name || String(tag)}
            </Badge>
          ))}
          {recipe.difficulty && (
            <Badge variant="outline" className="px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
              Độ khó: {DIFFICULTY_TEXT[recipe.difficulty] || recipe.difficulty}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <RecipeHero 
            recipe={recipe} 
            isFavorited={isFavorited} 
            handleFavorite={handleFavorite} 
            disabledBtn={adding || removing} 
          />

          <RecipeQuickInfo recipe={recipe} actualServings={actualServings} />

          {/* Description */}
          {recipe.description && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3">Giới thiệu</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{recipe.description}</p>
            </div>
          )}

          <RecipeIngredients 
            ingredients={ingredients} 
            actualServings={actualServings} 
            setServings={setServings} 
            ratio={ratio} 
          />

          <RecipeSteps 
            steps={steps} 
            checkedSteps={checkedSteps} 
            toggleStep={toggleStep} 
          />
        </div>

        {/* Right: Sidebar */}
        <RecipeSidebar 
          author={author} 
          recipe={recipe} 
          tags={tags} 
          isFavorited={isFavorited} 
          handleFavorite={handleFavorite} 
          disabledBtn={adding || removing} 
        />
      </div>
    </div>
  )
}
