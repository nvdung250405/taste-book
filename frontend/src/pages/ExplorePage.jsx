import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, Clock, ChefHat, Heart, Loader2, X } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import { useRecipes } from '../hooks/queries/useRecipeQueries'
import { useCategories } from '../hooks/queries/useCategoryQueries'
import { toast } from 'sonner'

const DIFFICULTY_COLORS = {
  'Dễ': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  'Trung bình': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  'Khó': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

export default function ExplorePage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [inputValue, setInputValue] = useState('')

  const params = {
    ...(search && { search }),
    ...(selectedCategory && { category: selectedCategory }),
    limit: 12,
  }

  const { data: recipesRes, isLoading } = useRecipes(params)
  const { data: categoriesRes } = useCategories()

  const recipes = Array.isArray(recipesRes?.DT) ? recipesRes.DT : (recipesRes?.DT?.items || recipesRes?.DT?.recipes || [])
  const categories = categoriesRes?.DT || []

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(inputValue)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Khám phá công thức</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Tìm kiếm món ăn ngon từ kho tàng hàng nghìn công thức</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
          <Search className="absolute left-3 w-5 h-5 text-slate-400" />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tìm kiếm tên món, nguyên liệu..."
            className="pl-10 pr-4 h-11 rounded-xl bg-white dark:bg-slate-900"
          />
          {inputValue && (
            <button type="button" onClick={() => { setInputValue(''); setSearch('') }} className="absolute right-3 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
        <Button type="submit" onClick={handleSearch} className="h-11 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
          <Search className="w-4 h-4 mr-2" /> Tìm kiếm
        </Button>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${!selectedCategory ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-300'}`}
        >
          Tất cả
        </button>
        {categories.map(cat => (
          <button
            key={cat._id || cat.id}
            onClick={() => setSelectedCategory(cat._id || cat.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${selectedCategory === (cat._id || cat.id) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-300'}`}
          >
            {cat.name || cat.title}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          <p className="text-slate-500">Đang tải công thức...</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
            <Search className="w-10 h-10 text-orange-300" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Không tìm thấy công thức</h3>
          <p className="text-slate-500 text-sm">Thử tìm với từ khóa khác hoặc chọn danh mục khác</p>
          <Button variant="outline" onClick={() => { setSearch(''); setInputValue(''); setSelectedCategory(null) }}>
            Xóa bộ lọc
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">{recipes.length} công thức được tìm thấy</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map(recipe => (
              <Card key={recipe._id || recipe.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={recipe.thumbnail || recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=600&auto=format&fit=crop'}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => toast.info('Chức năng yêu thích yêu cầu đăng nhập')}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors shadow"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  {recipe.difficulty && (
                    <div className="absolute bottom-3 left-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[recipe.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                        {recipe.difficulty}
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-slate-50 line-clamp-1 group-hover:text-orange-500 transition-colors mb-2">
                    <Link to={`/recipe/${recipe._id || recipe.id}`}>{recipe.title}</Link>
                  </h3>
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                      <span className="font-medium text-orange-500">{recipe.rating || '4.5'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{recipe.prepTime || recipe.time || '30p'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>{recipe.author?.name || recipe.user?.name || 'Chef'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
