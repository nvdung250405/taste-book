import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Pencil,
  Trash2,
  ChefHat,
  Clock,
  Loader2,
  BookOpen,
  CheckCircle2,
  Clock3,
  XCircle,
  Lock,
  Eye,
  AlertCircle,
  Users,
  Search,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'
import { useMyRecipes, useDeleteRecipe } from '../hooks/queries/useRecipeQueries'
import { toast } from 'sonner'
import RecipeCardSkeleton from '../components/recipe/RecipeCardSkeleton'
import QueryError from '../components/ui/QueryError'
import ListPagination from '../components/ui/ListPagination'
import useListPagination from '../hooks/useListPagination'
import useRecipeGridColumns from '../hooks/useRecipeGridColumns'
import { recipeImageProps, handleRecipeImageError } from '../lib/recipeImages'

const STATUS_CONFIG = {
  approved: {
    key: 'approved',
    label: 'Đã duyệt',
    icon: CheckCircle2,
    badgeCls:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    dotCls: 'bg-emerald-500',
  },
  pending: {
    key: 'pending',
    label: 'Chờ duyệt',
    icon: Clock3,
    badgeCls:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    dotCls: 'bg-amber-500',
  },
  rejected: {
    key: 'rejected',
    label: 'Bị từ chối',
    icon: XCircle,
    badgeCls:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    dotCls: 'bg-rose-500',
  },
  draft: {
    key: 'draft',
    label: 'Riêng tư / Nháp',
    icon: Lock,
    badgeCls:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dotCls: 'bg-slate-500',
  },
}

export default function MyRecipesPage() {
  const gridColumns = useRecipeGridColumns()
  const { data: res, isLoading, isError, isFetching, refetch } = useMyRecipes()
  const { mutate: deleteRecipe, isPending: deleting } = useDeleteRecipe()

  const [activeTab, setActiveTab] = useState('all') // 'all' | 'approved' | 'pending' | 'rejected' | 'draft'
  const [toDelete, setToDelete] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Trích xuất danh sách công thức an toàn
  const recipes = useMemo(() => {
    return Array.isArray(res?.DT)
      ? res.DT
      : (res?.DT?.items || res?.DT?.recipes || [])
  }, [res])

  // Xác định trạng thái của từng công thức
  const getRecipeStatusKey = (recipe) => {
    if (!recipe.isPublic) return 'draft'
    const status = (recipe.approvalStatus || '').toLowerCase()
    if (status === 'approved') return 'approved'
    if (status === 'pending') return 'pending'
    if (status === 'rejected') return 'rejected'
    return 'draft'
  }

  // Thống kê số lượng theo từng trạng thái
  const counts = useMemo(() => {
    const c = { all: recipes.length, approved: 0, pending: 0, rejected: 0, draft: 0 }
    recipes.forEach((r) => {
      const s = getRecipeStatusKey(r)
      if (c[s] !== undefined) c[s]++
    })
    return c
  }, [recipes])

  // Lọc theo tab trạng thái và từ khóa tìm kiếm
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesTab =
        activeTab === 'all' || getRecipeStatusKey(recipe) === activeTab
      const matchesSearch =
        !searchQuery.trim() ||
        recipe.title?.toLowerCase().includes(searchQuery.toLowerCase().trim())
      return matchesTab && matchesSearch
    })
  }, [recipes, activeTab, searchQuery])

  const { page, totalPages, visibleItems, setPage } = useListPagination(
    filteredRecipes, JSON.stringify([activeTab, searchQuery]),
  )

  // Tabs cấu hình
  const tabs = [
    { id: 'all', label: 'Tất cả', count: counts.all, icon: BookOpen },
    {
      id: 'approved',
      label: 'Đã duyệt',
      count: counts.approved,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      activeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    },
    {
      id: 'pending',
      label: 'Chờ duyệt',
      count: counts.pending,
      icon: Clock3,
      color: 'text-amber-500',
      activeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    },
    {
      id: 'rejected',
      label: 'Bị từ chối',
      count: counts.rejected,
      icon: XCircle,
      color: 'text-rose-500',
      activeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    },
    ...(counts.draft > 0
      ? [
          {
            id: 'draft',
            label: 'Riêng tư / Nháp',
            count: counts.draft,
            icon: Lock,
            color: 'text-slate-500',
            activeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
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
            Quản lý, theo dõi trạng thái kiểm duyệt và cập nhật các món ăn của bạn
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
        {recipes.length > 0 && (
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Tìm công thức của bạn..." placeholder="Tìm công thức của bạn..."
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
      ) : recipes.length === 0 ? (
        /* Empty State: Chưa tạo công thức nào */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950">
          <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center mb-4 ring-8 ring-orange-50/50 dark:ring-orange-950/20 shadow-inner">
            <BookOpen className="w-10 h-10 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            Bạn chưa có công thức nào
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mt-2 mb-6">
            Hãy chia sẻ bí quyết và hương vị món ăn yêu thích của bạn đến với cộng đồng ẩm thực TasteBook!
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
      ) : filteredRecipes.length === 0 ? (
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
                setActiveTab('all')
                setSearchQuery('')
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
          {visibleItems.map((recipe, index) => {
            const statusKey = getRecipeStatusKey(recipe)
            const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.draft
            const StatusIcon = status.icon
            const rId = recipe.recipeId || recipe.id || recipe._id
            const isApproved = recipe.isPublic && (recipe.approvalStatus || '').toLowerCase() === 'approved'
            const isRejected = (recipe.approvalStatus || '').toLowerCase() === 'rejected'

            return (
              <Card
                key={rId}
                className="overflow-hidden group hover:shadow-xl hover:-translate-y-0.5 transition-[transform,box-shadow] duration-300 motion-reduce:transition-none border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col rounded-2xl"
              >
                {/* Ảnh cover & Badges */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Link
                    to={isApproved ? `/recipe/${rId}` : `/recipe/${rId}/edit`}
                    className="block w-full h-full"
                  >
                    <img
                      {...recipeImageProps(recipe.thumbnailUrl || recipe.thumbnail || recipe.image)}
                      loading={index < gridColumns ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      decoding="async"
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 motion-reduce:transition-none"
                      onError={handleRecipeImageError}
                    />
                  </Link>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border ${status.badgeCls}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>

                    {!recipe.isPublic && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm bg-slate-900/80 text-white backdrop-blur-md">
                        <Lock className="w-3 h-3" /> Riêng tư
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <CardContent className="p-4 sm:p-5 flex flex-col flex-1">
                  <h2 className="font-bold text-slate-900 dark:text-slate-50 line-clamp-2 mb-2 text-base sm:text-lg group-hover:text-orange-500 transition-colors">
                    <Link
                      to={isApproved ? `/recipe/${rId}` : `/recipe/${rId}/edit`}
                      className="hover:underline"
                    >
                      {recipe.title}
                    </Link>
                  </h2>

                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {recipe.cookTimeMinutes || recipe.prepTime || recipe.time || '30'}p
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <ChefHat className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {recipe.difficulty === 'Easy'
                          ? 'Dễ'
                          : recipe.difficulty === 'Hard'
                          ? 'Khó'
                          : 'Trung bình'}
                      </span>
                    </div>

                    {recipe.defaultServings && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{recipe.defaultServings} người</span>
                      </div>
                    )}
                  </div>

                  {/* Cảnh báo lý do từ chối nếu có */}
                  {isRejected && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs">
                      <div className="flex items-start gap-1.5 text-rose-700 dark:text-rose-400 font-semibold mb-1">
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>Lý do từ chối:</span>
                      </div>
                      <p className="text-rose-600/90 dark:text-rose-300/90 pl-5">
                        {recipe.rejectionReason ||
                          'Công thức chưa đáp ứng tiêu chuẩn cộng đồng về nội dung hoặc hình ảnh minh họa.'}
                      </p>
                      <div className="mt-2 pl-5">
                        <Link
                          to={`/recipe/${rId}/edit`}
                          className="inline-flex items-center text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:underline"
                        >
                          Sửa công thức để gửi duyệt lại →
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Action buttons (Sửa / Xóa / Xem) */}
                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                    {isApproved && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium px-2.5"
                        asChild
                        title="Xem trang công thức"
                      >
                        <Link to={`/recipe/${rId}`}>
                          <Eye className="w-3.5 h-3.5 mr-1" /> Xem
                        </Link>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-xl hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 dark:hover:bg-orange-950/30 text-xs font-medium"
                      asChild
                    >
                      <Link to={`/recipe/${rId}/edit`}>
                        <Pencil className="w-3.5 h-3.5 mr-1.5" /> Sửa
                      </Link>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-xs font-medium"
                      onClick={() => setToDelete(recipe)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Xóa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {!isLoading && !isError && (
        <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Modal Xác Nhận Xóa (Delete Confirmation Dialog) */}
      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-2">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">
              Xác nhận xóa công thức
            </DialogTitle>
          </DialogHeader>

          <div className="text-sm text-slate-600 dark:text-slate-300 py-1">
            Bạn có chắc chắn muốn xóa công thức{' '}
            <span className="font-bold text-slate-900 dark:text-slate-100">
              "{toDelete?.title}"
            </span>
            ?
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Hành động này sẽ xóa vĩnh viễn dữ liệu công thức, nguyên liệu và các bước hướng dẫn. Không thể hoàn tác.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setToDelete(null)}
              disabled={deleting}
              className="rounded-xl"
            >
              Hủy bỏ
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1.5" />
              )}
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
