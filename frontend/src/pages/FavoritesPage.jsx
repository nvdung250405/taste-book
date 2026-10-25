import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Search, Sparkles, BookOpen, Lock } from 'lucide-react'
import { Button } from '../components/ui/button'
import {
  useFavorites,
  useRemoveFavorite,
  useUpdateFavoriteNote,
} from '../hooks/queries/useFavoriteQueries'
import { toast } from 'sonner'
import RecipeCardSkeleton from '../components/recipe/RecipeCardSkeleton'
import QueryError from '../components/ui/QueryError'
import ListPagination from '../components/ui/ListPagination'
import useCollectionParams from '../hooks/useCollectionParams'
import FavoriteNoteDialog from '../components/recipe/FavoriteNoteDialog'
import useRecipeGridColumns from '../hooks/useRecipeGridColumns'
import FavoriteRecipeCard from '../components/recipe/FavoriteRecipeCard'
import { filterFavorites } from '../lib/collectionFilters'

export default function FavoritesPage() {
  const gridColumns = useRecipeGridColumns('favorites')
  const hasToken = !!localStorage.getItem('token')
  const { page, search, searchQuery, setSearchQuery, setPage } =
    useCollectionParams()
  const { data: res, isLoading, isError, isFetching, refetch } = useFavorites()
  const { mutate: removeFav } = useRemoveFavorite()
  const { mutate: updateNote, isPending: updatingNote } =
    useUpdateFavoriteNote()

  const [noteDialog, setNoteDialog] = useState(null) // { recipeId, note }
  const [removingIds, setRemovingIds] = useState(new Set())

  const favorites = filterFavorites(res?.DT?.items || [], search)
  const totalPages = Math.max(1, Math.ceil(favorites.length / 12))
  const visibleFavorites = favorites.slice((page - 1) * 12, page * 12)
  useEffect(() => {
    if (res && !isFetching && page > totalPages) setPage(totalPages)
  }, [res, isFetching, page, totalPages, setPage])

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
      },
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
                {res?.DT?.total || 0}
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base">
            Bộ sưu tập những món ngon bạn đã lưu để sẵn sàng nấu bất cứ lúc nào
          </p>
        </div>

        {/* Search filter if there are items */}
        {hasToken && (
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Tìm trong danh sách..."
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
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            Đăng nhập để xem danh sách yêu thích
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mt-2 mb-6">
            Danh sách món yêu thích được lưu an toàn trên tài khoản của bạn để
            bạn có thể xem lại bất cứ lúc nào.
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
        <QueryError
          title="Không thể tải danh sách yêu thích"
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : favorites.length === 0 && !search ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950">
          <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center mb-4 shadow-inner ring-8 ring-red-50/50 dark:ring-red-950/20">
            <Heart className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            Chưa có món yêu thích nào
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mt-2 mb-6">
            Khi lướt xem các công thức, hãy nhấn vào biểu tượng trái tim để lưu
            lại vào đây và xem lại dễ dàng bất cứ lúc nào!
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
      ) : favorites.length === 0 ? (
        /* Search Not Found State */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            Không tìm thấy công thức phù hợp
          </h2>
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
          {visibleFavorites.map((fav, index) => (
            <FavoriteRecipeCard
              key={fav.recipeId || fav.id}
              {...{ fav, index, gridColumns, removingIds }}
              onRemove={handleQuickRemove}
              onEditNote={setNoteDialog}
            />
          ))}
        </div>
      )}

      {hasToken && !isLoading && !isError && (
        <ListPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Note Dialog */}
      <FavoriteNoteDialog
        value={noteDialog}
        pending={updatingNote}
        onClose={() => setNoteDialog(null)}
        onChange={(note) =>
          setNoteDialog((previous) => ({ ...previous, note }))
        }
        onSave={handleSaveNote}
      />
    </div>
  )
}
