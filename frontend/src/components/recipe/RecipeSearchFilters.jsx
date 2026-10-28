import { Search, X, Filter } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import QueryError from '../ui/QueryError'
import IngredientFilter from './IngredientFilter'

export default function RecipeSearchFilters({
  inputValue,
  handleSearchChange,
  updateFilters,
  selectedDifficulty,
  handleDifficultyChange,
  selectedMaxTime,
  handleMaxTimeChange,
  selectedCategory,
  clearAllFilters,
  categoriesError,
  retryCategories,
  categoriesFetching,
  handleCategoryChange,
  categories,
  selectedIngredient,
  handleIngredientChange,
}) {
  return (
    <>
      {' '}
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <Input
            aria-label="Tìm kiếm công thức"
            value={inputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Nhập tên món ăn hoặc nguyên liệu (VD: Thịt bò, Canh chua)..."
            className="pl-12 pr-10 h-12 rounded-xl bg-white dark:bg-slate-900 text-base shadow-sm"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => updateFilters({ search: '' })}
              className="absolute right-4 text-slate-400 hover:text-slate-600"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <IngredientFilter
        value={selectedIngredient}
        onChange={handleIngredientChange}
      />
      {/* Additional Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
          <Filter className="w-4 h-4" /> Bộ lọc:
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            aria-label="Lọc độ khó"
            value={selectedDifficulty}
            onChange={(e) => handleDifficultyChange(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-orange-500 min-w-[140px]"
          >
            <option value="">Độ khó (Tất cả)</option>
            <option value="Easy">Dễ</option>
            <option value="Medium">Trung bình</option>
            <option value="Hard">Khó</option>
          </select>

          <select
            aria-label="Lọc thời gian nấu"
            value={selectedMaxTime}
            onChange={(e) => handleMaxTimeChange(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-orange-500 min-w-[140px]"
          >
            <option value="">Thời gian (Tất cả)</option>
            <option value="15">Dưới 15 phút</option>
            <option value="30">Dưới 30 phút</option>
            <option value="60">Dưới 1 tiếng</option>
            <option value="120">Dưới 2 tiếng</option>
          </select>

          {(selectedDifficulty ||
            selectedMaxTime ||
            selectedCategory ||
            selectedIngredient) && (
            <Button
              variant="ghost"
              onClick={clearAllFilters}
              className="h-10 text-slate-500"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>
      {/* Category filter pills */}
      {categoriesError && (
        <QueryError
          title="Không thể tải bộ lọc danh mục"
          onRetry={retryCategories}
          isRetrying={categoriesFetching}
        />
      )}
      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => handleCategoryChange('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${!selectedCategory ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-300'}`}
        >
          Tất cả danh mục
        </button>
        {categories.map((cat) => {
          const id = String(cat.categoryId || cat.id || cat._id)
          const name = cat.categoryName || cat.name || cat.title
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
    </>
  )
}
