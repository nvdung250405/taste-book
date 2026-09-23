import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Clock, ChefHat, Heart, Loader2, X, Filter, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useRecipes } from '../hooks/queries/useRecipeQueries'
import { useCategories } from '../hooks/queries/useCategoryQueries'
import { toast } from 'sonner'

// Custom hook for debouncing input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

const DIFFICULTY_COLORS = {
  'Easy': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  'Medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  'Hard': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

const DIFFICULTY_LABELS = {
  'Easy': 'Dễ',
  'Medium': 'Trung bình',
  'Hard': 'Khó',
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=600&auto=format&fit=crop'
const ITEMS_PER_PAGE = 12

export default function RecipeSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Initialize state from URL params (lazy init - runs once on mount)
  const [inputValue, setInputValue] = useState(() => searchParams.get('search') || '')
  const debouncedSearch = useDebounce(inputValue, 500)

  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('categoryId') || '')
  const [selectedDifficulty, setSelectedDifficulty] = useState(() => searchParams.get('difficulty') || '')
  const [selectedMaxTime, setSelectedMaxTime] = useState(() => searchParams.get('maxTime') || '')

  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get('page')) || 1)

  // Sync URL params when filters change (updates external system = URL, not React state)
  useEffect(() => {
    const urlParams = {}
    if (debouncedSearch) urlParams.search = debouncedSearch
    if (selectedCategory) urlParams.categoryId = selectedCategory
    if (selectedDifficulty) urlParams.difficulty = selectedDifficulty
    if (selectedMaxTime) urlParams.maxTime = selectedMaxTime
    if (currentPage > 1) urlParams.page = currentPage
    setSearchParams(urlParams, { replace: true })
  }, [debouncedSearch, selectedCategory, selectedDifficulty, selectedMaxTime, currentPage, setSearchParams])

  // Wrapper handlers that also reset page to 1 when filter changes
  const handleCategoryChange = (id) => {
    setSelectedCategory(id)
    setCurrentPage(1)
  }

  const handleDifficultyChange = (val) => {
    setSelectedDifficulty(val)
    setCurrentPage(1)
  }

  const handleMaxTimeChange = (val) => {
    setSelectedMaxTime(val)
    setCurrentPage(1)
  }

  const handleSearchChange = (val) => {
    setInputValue(val)
    setCurrentPage(1)
  }

  // Build query params for backend (server-side pagination)
  const params = {
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedCategory && { categoryId: selectedCategory }),
    ...(selectedDifficulty && { difficulty: selectedDifficulty }),
    ...(selectedMaxTime && { maxTime: selectedMaxTime }),
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  }

  // Fetch data
  const { data: recipesRes, isLoading } = useRecipes(params)
  const { data: categoriesRes } = useCategories()

  // Backend trả về: { EC:0, DT: { page, limit, total, totalPages, recipes: [...] } }
  const allRecipes = Array.isArray(recipesRes?.DT?.recipes) ? recipesRes.DT.recipes : []
  const totalItems = recipesRes?.DT?.total || 0
  const totalPages = recipesRes?.DT?.totalPages || 1
  const categories = categoriesRes?.DT || []

  // currentRecipes = allRecipes (backend đã phân trang sẵn)
  const currentRecipes = allRecipes

  // Handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const clearAllFilters = () => {
    setInputValue('')
    setSelectedCategory('')
    setSelectedDifficulty('')
    setSelectedMaxTime('')
    setCurrentPage(1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Tìm kiếm công thức</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Khám phá hàng nghìn công thức nấu ăn ngon được chia sẻ từ cộng đồng</p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <Input
            value={inputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Nhập tên món ăn hoặc nguyên liệu (VD: Thịt bò, Canh chua)..."
            className="pl-12 pr-10 h-12 rounded-xl bg-white dark:bg-slate-900 text-base shadow-sm"
          />
          {inputValue && (
            <button 
              type="button" 
              onClick={() => { setInputValue(''); setCurrentPage(1) }}
              className="absolute right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Additional Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
          <Filter className="w-4 h-4" /> Bộ lọc:
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select 
            value={selectedDifficulty} 
            onChange={e => handleDifficultyChange(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-orange-500 min-w-[140px]"
          >
            <option value="">Độ khó (Tất cả)</option>
            <option value="Easy">Dễ</option>
            <option value="Medium">Trung bình</option>
            <option value="Hard">Khó</option>
          </select>

          <select 
            value={selectedMaxTime} 
            onChange={e => handleMaxTimeChange(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-orange-500 min-w-[140px]"
          >
            <option value="">Thời gian (Tất cả)</option>
            <option value="15">Dưới 15 phút</option>
            <option value="30">Dưới 30 phút</option>
            <option value="60">Dưới 1 tiếng</option>
            <option value="120">Dưới 2 tiếng</option>
          </select>

          {(selectedDifficulty || selectedMaxTime || selectedCategory) && (
            <Button variant="ghost" onClick={clearAllFilters} className="h-10 text-slate-500">
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => handleCategoryChange('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${!selectedCategory ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-300'}`}
        >
          Tất cả danh mục
        </button>
        {categories.map(cat => {
          const id = String(cat.categoryId || cat.id || cat._id);
          const name = cat.categoryName || cat.name || cat.title;
          return (
            <button
              key={id}
              onClick={() => handleCategoryChange(id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${selectedCategory === id ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-300'}`}
            >
              {name}
            </button>
          )
        })}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          <p className="text-slate-500 font-medium">Đang tìm kiếm công thức...</p>
        </div>
      ) : allRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
            <Search className="w-10 h-10 text-orange-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Không tìm thấy công thức</h3>
          <p className="text-slate-500 text-sm max-w-sm text-center">Rất tiếc, không có món ăn nào khớp với bộ lọc của bạn. Vui lòng thử từ khóa hoặc tiêu chí khác.</p>
          <Button onClick={clearAllFilters} className="mt-2 bg-orange-500 hover:bg-orange-600 text-white">
            Xóa toàn bộ bộ lọc
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              Tìm thấy <span className="text-orange-600 font-bold">{totalItems}</span> công thức
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {currentRecipes.map(recipe => (
              <Card key={recipe.recipeId} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full">
                <div className="relative h-52 overflow-hidden shrink-0">
                  <img
                    src={recipe.thumbnailUrl || FALLBACK_IMAGE}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = FALLBACK_IMAGE }}
                  />
                  
                  {/* Tags (Categories) */}
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    {(recipe.categories || recipe.tags || []).slice(0, 2).map((cat, idx) => (
                      <Badge 
                        key={cat.categoryId || cat.id || cat._id || idx}
                        className="bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border-none text-xs px-2 py-0.5"
                      >
                        {cat.categoryName || cat.name || String(cat)}
                      </Badge>
                    ))}
                  </div>

                  <button
                    onClick={(e) => { e.preventDefault(); toast.info('Chức năng yêu thích yêu cầu đăng nhập'); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shadow-sm"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  
                  {recipe.difficulty && (
                    <div className="absolute bottom-3 left-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${DIFFICULTY_COLORS[recipe.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                        {DIFFICULTY_LABELS[recipe.difficulty] || recipe.difficulty}
                      </span>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-50 line-clamp-2 group-hover:text-orange-500 transition-colors mb-4 flex-1">
                    <Link to={`/recipe/${recipe.recipeId}`}>{recipe.title}</Link>
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.cookTimeMinutes ? `${recipe.cookTimeMinutes}p` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>{recipe.defaultServings || 2}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ChefHat className="w-4 h-4" />
                      <span className="truncate max-w-[80px]">{recipe.authorName || 'Chef'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-xl border-slate-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNumber = idx + 1;
                  // Show max 5 pages logic
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? 'default' : 'ghost'}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-10 h-10 rounded-xl font-medium ${currentPage === pageNumber ? 'bg-orange-500 text-white hover:bg-orange-600' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        {pageNumber}
                      </Button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber} className="px-2 text-slate-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-xl border-slate-200"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
