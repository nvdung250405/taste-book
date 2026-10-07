import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  Star,
  Clock,
  ChefHat,
  Trash2,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  BookOpen,
  Lock,
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
import {
  useFavorites,
  useRemoveFavorite,
  useUpdateFavoriteNote,
} from '../hooks/queries/useFavoriteQueries'
import { toast } from 'sonner'
import RecipeCardSkeleton from '../components/recipe/RecipeCardSkeleton'
import QueryError from '../components/ui/QueryError'
import ListPagination from '../components/ui/ListPagination'
import useListPagination from '../hooks/useListPagination'

export default function FavoritesPage() {
  const hasToken = !!localStorage.getItem('token')
  const { data: res, isLoading, isError, isFetching, refetch } = useFavorites()
  const { mutate: removeFav } = useRemoveFavorite()
  const { mutate: updateNote, isPending: updatingNote } = useUpdateFavoriteNote()

  const [noteDialog, setNoteDialog] = useState(null) // { recipeId, note }
  const [searchQuery, setSearchQuery] = useState('')
  const [removingIds, setRemovingIds] = useState(new Set())

  const favorites = useMemo(() => {
    return Array.isArray(res?.DT) ? res.DT : (res?.DT?.items || [])
  }, [res])

  // Lọc nhanh theo từ khóa tìm kiếm
  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return favorites
    const q = searchQuery.toLowerCase().trim()
    return favorites.filter((fav) => {
      const recipe = fav.recipe || fav
      const title = (recipe.title || '').toLowerCase()
      const author = (
        recipe.author?.name ||
        recipe.author?.username ||
        recipe.user?.name ||
        ''
      ).toLowerCase()
      const note = (fav.personalNotes || fav.note || '').toLowerCase()
      return title.includes(q) || author.includes(q) || note.includes(q)
    })
  }, [favorites, searchQuery])

  const { page, totalPages, visibleItems, setPage } = useListPagination(filteredFavorites, searchQuery)

  // Xử lý hủy lưu nhanh và cập nhật UI tức thì
  const handleQuickRemove = (recipeId, title) => {
    setRemovingIds((prev) => new Set([...prev, String(recipeId)]))

    removeFav(recipeId, {
      onSuccess: () => {
        toast.success(`Đã bỏ lưu "${title || 'công thức'}" khỏi yêu thích`, {
          duration: 2500,
        })
      },
      onError: () => {
        toast.error('Không thể bỏ lưu công thức. Vui lòng thử lại!')
      },
      onSettled: () => {
        setRemovingIds((prev) => {
          const next = new Set(prev)
          next.delete(String(recipeId))
          return next
        })
      },
    })
  }

  const handleSaveNote = () => {
    if (!noteDialog) return
    updateNote(
      {
        recipeId: noteDialog.recipeId,
        data: { personalNotes: noteDialog.note, note: noteDialog.note },
      },
      {
        onSuccess: () => {
          toast.success('Đã lưu ghi chú thành công')
          setNoteDialog(null)
        },
        onError: () => toast.error('Lưu ghi chú thất bại'),
      }
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              Món Ăn Yêu Thích
            </h1>
            {hasToken && (
              <span className="inline-flex items-center justify-center bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-900">
                {favorites.length}
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base">
            Bộ sưu tập những món ngon bạn đã lưu để sẵn sàng nấu bất cứ lúc nào
          </p>
        </div>

        {/* Search filter if there are items */}
        {hasToken && favorites.length > 0 && (
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm trong danh sách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
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

      {/* Content */}
      {!hasToken ? (
        /* Chưa đăng nhập */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center mb-4 text-orange-500 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            Đăng nhập để xem danh sách yêu thích
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mt-2 mb-6">
            Danh sách món yêu thích được lưu an toàn trên tài khoản của bạn để bạn có thể xem lại bất cứ lúc nào.
          </p>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20 px-6 py-2.5 font-medium"
            asChild
          >
            <Link to="/login">Đăng nhập ngay</Link>
          </Button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <RecipeCardSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <QueryError title="Không thể tải danh sách yêu thích" onRetry={() => refetch()} isRetrying={isFetching} />
      ) : favorites.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950">
          <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center mb-4 shadow-inner ring-8 ring-red-50/50 dark:ring-red-950/20">
            <Heart className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            Chưa có món yêu thích nào
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mt-2 mb-6">
            Khi lướt xem các công thức, hãy nhấn vào biểu tượng trái tim để lưu lại vào đây và xem lại dễ dàng bất cứ lúc nào!
          </p>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20 px-6 py-2.5 font-medium transition-transform active:scale-95"
            asChild
          >
            <Link to="/search">
              <Sparkles className="w-4 h-4 mr-2" /> Khám phá công thức ngay
            </Link>
          </Button>
        </div>
      ) : filteredFavorites.length === 0 ? (
        /* Search Not Found State */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            Không tìm thấy công thức phù hợp
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc tìm kiếm
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="mt-4 rounded-xl"
          >
            Hiển thị tất cả
          </Button>
        </div>
      ) : (
        /* Favorites Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleItems.map((fav) => {
            const recipe = fav.recipe || fav
            const recipeId = recipe.id || recipe._id || fav.recipeId
            const isRemoving = removingIds.has(String(recipeId))
            const noteText = fav.personalNotes || fav.note

            return (
              <Card
                key={fav.id || recipeId}
                className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col ${
                  isRemoving
                    ? 'opacity-0 scale-95 pointer-events-none'
                    : 'opacity-100'
                }`}
              >
                {/* Image Cover */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Link
                    to={`/recipe/${recipeId}`}
                    className="block w-full h-full"
                  >
                    <img
                      src={
                        recipe.thumbnailUrl ||
                        recipe.thumbnail ||
                        recipe.image ||
                        'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=600&auto=format&fit=crop'
                      }
                      alt={recipe.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=600&auto=format&fit=crop'
                      }}
                    />
                  </Link>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Nút Tim HỦY LƯU NHANH TRỰC TIẾP */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setNoteDialog({ recipeId, note: noteText || '' })
                      }}
                      className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-sm hover:shadow flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-all hover:scale-110 active:scale-95"
                      title="Ghi chú cá nhân"
                      aria-label="Thêm hoặc sửa ghi chú cá nhân"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleQuickRemove(recipeId, recipe.title)
                      }}
                      className="group/btn w-8 h-8 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow hover:shadow-md flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all hover:scale-110 active:scale-90"
                      title="Bỏ lưu khỏi yêu thích"
                      aria-label="Bỏ lưu khỏi yêu thích"
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500 transition-transform group-hover/btn:scale-110" />
                    </button>
                  </div>

                  {/* Difficulty Badge */}
                  <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-md shadow-sm">
                      {recipe.difficulty === 'Easy'
                        ? 'Dễ'
                        : recipe.difficulty === 'Hard'
                        ? 'Khó'
                        : 'Trung bình'}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <CardContent className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-slate-50 line-clamp-2 text-base group-hover:text-orange-500 transition-colors mb-2">
                    <Link
                      to={`/recipe/${recipeId}`}
                      className="hover:underline"
                    >
                      {recipe.title}
                    </Link>
                  </h3>

                  {/* Personal note if exists */}
                  {noteText ? (
                    <div
                      onClick={() =>
                        setNoteDialog({ recipeId, note: noteText })
                      }
                      className="cursor-pointer text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2 mb-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 p-2 rounded-xl hover:border-amber-400 transition-colors"
                      title="Nhấn để sửa ghi chú"
                    >
                      💬 "{noteText}"
                    </div>
                  ) : (
                    <div className="mb-2" />
                  )}

                  {/* Recipe Meta Info */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1 font-medium text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{recipe.rating || '4.8'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {recipe.cookTimeMinutes ||
                          recipe.prepTime ||
                          recipe.time ||
                          '30'}
                        p
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-1 max-w-[100px] truncate"
                      title={
                        recipe.author?.name ||
                        recipe.author?.username ||
                        recipe.user?.name ||
                        'Chef'
                      }
                    >
                      <ChefHat className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {recipe.author?.name ||
                          recipe.author?.username ||
                          recipe.user?.name ||
                          'Đầu bếp'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Remove Action Button */}
                  <div className="mt-3 pt-2 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickRemove(recipeId, recipe.title)}
                      className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg py-1.5 h-auto transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hủy lưu món này
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {hasToken && !isLoading && !isError && (
        <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Note Dialog */}
      <Dialog
        open={!!noteDialog}
        onOpenChange={(open) => !open && setNoteDialog(null)}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-orange-500" /> Ghi chú cho
              món ăn
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
              Ghi chú cá nhân (chỉ bạn nhìn thấy)
            </label>
            <textarea
              placeholder="Ví dụ: Giảm đường khi kho, cho nhiều tiêu hơn, công thức ngon nấu vào dịp cuối tuần..."
              value={noteDialog?.note || ''}
              onChange={(e) =>
                setNoteDialog((prev) => ({ ...prev, note: e.target.value }))
              }
              className="w-full min-h-[120px] rounded-xl resize-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setNoteDialog(null)}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
              onClick={handleSaveNote}
              disabled={updatingNote}
            >
              {updatingNote && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu ghi chú
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
