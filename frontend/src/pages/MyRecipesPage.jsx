import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  BookOpen,
  CheckCircle2,
  Clock3,
  XCircle,
  Lock,
  Search,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import {
  useMyRecipes,
  useDeleteRecipe,
} from '../hooks/queries/useRecipeQueries'
import { toast } from 'sonner'
import RecipeCardSkeleton from '../components/recipe/RecipeCardSkeleton'
import QueryError from '../components/ui/QueryError'
import ListPagination from '../components/ui/ListPagination'
import useCollectionParams from '../hooks/useCollectionParams'
import RecipeDeleteDialog from '../components/recipe/RecipeDeleteDialog'
import useRecipeGridColumns from '../hooks/useRecipeGridColumns'
import MyRecipeCard from '../components/recipe/MyRecipeCard'
import { filterRecipes, recipeCounts } from '../lib/collectionFilters'

export default function MyRecipesPage() {
  const gridColumns = useRecipeGridColumns()
  const {
    page,
    search,
    searchQuery,
    setSearchQuery,
    status: activeTab,
    setStatus: setActiveTab,
    setPage,
    reset,
  } = useCollectionParams()
  const { data: res, isLoading, isError, isFetching, refetch } = useMyRecipes()
  const { mutate: deleteRecipe, isPending: deleting } = useDeleteRecipe()

  const [toDelete, setToDelete] = useState(null)

  const allRecipes = res?.DT?.items || []
  const counts = recipeCounts(allRecipes)
  const recipes = filterRecipes(allRecipes, activeTab, search)
  const totalPages = Math.max(1, Math.ceil(recipes.length / 12))
  const visibleRecipes = recipes.slice((page - 1) * 12, page * 12)
  useEffect(() => {
    if (res && !isFetching && page > totalPages) setPage(totalPages)
  }, [res, isFetching, page, totalPages, setPage])

  // Tabs cấu hình
  const tabs = [
    { id: 'all', label: 'Tất cả', count: counts.all, icon: BookOpen },
    {
      id: 'approved',
      label: 'Đã duyệt',
      count: counts.approved,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      activeColor:
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    },
    {
      id: 'pending',
      label: 'Chờ duyệt',
      count: counts.pending,
      icon: Clock3,
      color: 'text-amber-500',
      activeColor:
        'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    },
    {
      id: 'rejected',
      label: 'Bị từ chối',
      count: counts.rejected,
      icon: XCircle,
      color: 'text-rose-500',
      activeColor:
        'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    },
    ...(counts.draft > 0
      ? [
          {
            id: 'draft',
            label: 'Riêng tư / Nháp',
            count: counts.draft,
            icon: Lock,
            color: 'text-slate-500',
            activeColor:
              'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
          },
        ]
      : []),
  ]

  const handleDelete = () => {
    if (!toDelete) return
    const id = toDelete.recipeId || toDelete._id || toDelete.id
    deleteRecipe(id, {
      onSuccess: () => {
        toast.success(`Đã xóa công thức "${toDelete.title}"`)
        setToDelete(null)
      },
      onError: () => toast.error('Xóa công thức thất bại, vui lòng thử lại!'),
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Công Thức Của Tôi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base">
            Quản lý, theo dõi trạng thái kiểm duyệt và cập nhật các món ăn của
            bạn
          </p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20 px-5 py-2.5 font-medium transition-transform active:scale-95 shrink-0"
          asChild
        >
          <Link to="/recipe/create">
            <Plus className="w-4 h-4 mr-2" /> Tạo công thức mới
          </Link>
        </Button>
      </div>

      {/* Tabs bar & Quick Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        {/* Tabs chia theo trạng thái */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-white dark:text-slate-900'
                      : tab.color || 'text-slate-400'
                  }`}
                />
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Tìm kiếm nhanh */}
        {(counts.all > 0 || searchQuery) && (
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Tìm công thức của bạn..."
              placeholder="Tìm công thức của bạn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Xóa
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content list */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <RecipeCardSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <QueryError onRetry={() => refetch()} isRetrying={isFetching} />
      ) : recipes.length === 0 && activeTab === 'all' && !search ? (
        /* Empty State: Chưa tạo công thức nào */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950">
          <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center mb-4 ring-8 ring-orange-50/50 dark:ring-orange-950/20 shadow-inner">
            <BookOpen className="w-10 h-10 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            Bạn chưa có công thức nào
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mt-2 mb-6">
            Hãy chia sẻ bí quyết và hương vị món ăn yêu thích của bạn đến với
            cộng đồng ẩm thực TasteBook!
          </p>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20 px-6 py-2.5 font-medium transition-transform active:scale-95"
            asChild
          >
            <Link to="/recipe/create">
              <Plus className="w-4 h-4 mr-2" /> Tạo công thức đầu tiên
            </Link>
          </Button>
        </div>
      ) : recipes.length === 0 ? (
        /* Empty State: Tab hoặc tìm kiếm không có kết quả */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
            {activeTab === 'pending' ? (
              <Clock3 className="w-8 h-8 text-amber-500" />
            ) : activeTab === 'rejected' ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            ) : (
              <Search className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {activeTab === 'pending'
              ? 'Không có công thức nào đang chờ duyệt'
              : activeTab === 'rejected'
                ? 'Tuyệt vời! Không có công thức nào bị từ chối'
                : activeTab === 'approved'
                  ? 'Chưa có công thức nào được phê duyệt'
                  : activeTab === 'draft'
                    ? 'Không có bản nháp hoặc công thức riêng tư'
                    : 'Không tìm thấy công thức phù hợp'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {searchQuery
              ? 'Hãy thử tìm kiếm bằng từ khóa khác hoặc xóa bộ lọc tìm kiếm.'
              : activeTab === 'rejected'
                ? 'Mọi công thức của bạn đều tuân thủ tốt tiêu chuẩn cộng đồng.'
                : 'Hãy tiếp tục sáng tạo các món ăn hấp dẫn cùng TasteBook!'}
          </p>
          {(activeTab !== 'all' || searchQuery) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                reset()
              }}
              className="mt-4 rounded-xl"
            >
              Xem tất cả công thức
            </Button>
          )}
        </div>
      ) : (
        /* Grid công thức */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleRecipes.map((recipe, index) => (
            <MyRecipeCard
              key={recipe.recipeId || recipe.id || recipe._id}
              {...{ recipe, index, gridColumns }}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      {!isLoading && !isError && (
        <ListPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Modal Xác Nhận Xóa (Delete Confirmation Dialog) */}
      <RecipeDeleteDialog
        recipe={toDelete}
        pending={deleting}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
