import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChefHat, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useRecipeDetail } from '../hooks/queries/useRecipeQueries'
import { useAddFavorite, useRemoveFavorite, useFavorites } from '../hooks/queries/useFavoriteQueries'
import { useProfile } from '../hooks/queries/useAuthQueries'
import { toast } from 'sonner'

import RecipeHero from '../components/recipe/RecipeHero'
import RecipeQuickInfo from '../components/recipe/RecipeQuickInfo'
import RecipeIngredients from '../components/recipe/RecipeIngredients'
import RecipeSteps from '../components/recipe/RecipeSteps'
import RecipeSidebar from '../components/recipe/RecipeSidebar'

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

  const actualServings = servings || recipe?.servings || recipe?.portions || 4
  const originalServings = recipe?.servings || recipe?.portions || 4
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
  const steps = recipe.steps || recipe.instructions || []
  const tags = recipe.tags || []
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

      <RecipeHero 
        recipe={recipe} 
        tags={tags} 
        isFavorited={isFavorited} 
        handleFavorite={handleFavorite} 
        disabledBtn={adding || removing} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-8">
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
