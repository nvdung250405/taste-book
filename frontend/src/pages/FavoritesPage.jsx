import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, Clock, ChefHat, Trash2, Loader2, MessageSquare } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../components/ui/dialog'
import { useFavorites, useRemoveFavorite, useUpdateFavoriteNote } from '../hooks/queries/useFavoriteQueries'
import { toast } from 'sonner'

export default function FavoritesPage() {
  const { data: res, isLoading } = useFavorites()
  const { mutate: removeFav, isPending: removing } = useRemoveFavorite()
  const { mutate: updateNote, isPending: updatingNote } = useUpdateFavoriteNote()

  const [noteDialog, setNoteDialog] = useState(null) // { recipeId, note }

  const favorites = Array.isArray(res?.DT) ? res.DT : (res?.DT?.items || [])

  const handleRemove = (recipeId, title) => {
    removeFav(recipeId, {
      onSuccess: () => toast.success(`Đã xóa "${title}" khỏi yêu thích`),
      onError: () => toast.error('Xóa thất bại'),
    })
  }

  const handleSaveNote = () => {
    if (!noteDialog) return
    updateNote({ recipeId: noteDialog.recipeId, data: { note: noteDialog.note } }, {
      onSuccess: () => { toast.success('Đã lưu ghi chú'); setNoteDialog(null) },
      onError: () => toast.error('Lưu thất bại'),
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Yêu thích</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Những công thức bạn đã lưu · <span className="font-medium text-orange-500">{favorites.length} món</span>
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          <p className="text-slate-500">Đang tải danh sách yêu thích...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <Heart className="w-10 h-10 text-red-300" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Chưa có món yêu thích nào</h3>
          <p className="text-slate-500 text-sm text-center max-w-sm">
            Khi bạn nhấn tim một công thức, nó sẽ xuất hiện tại đây để bạn xem lại bất cứ lúc nào.
          </p>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl" asChild>
            <Link to="/explore">Khám phá ngay</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map(fav => {
            const recipe = fav.recipe || fav
            const recipeId = recipe._id || recipe.id
            return (
              <Card key={fav._id || fav.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={recipe.thumbnail || recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=600&auto=format&fit=crop'}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Action buttons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setNoteDialog({ recipeId, note: fav.note || '' })}
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-600 hover:text-blue-500 transition-colors shadow"
                      title="Thêm ghi chú"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(recipeId, recipe.title)}
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors shadow"
                      title="Xóa khỏi yêu thích"
                      disabled={removing}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Heart badge */}
                  <div className="absolute top-3 left-3">
                    <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shadow">
                      <Heart className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-slate-50 line-clamp-1 group-hover:text-orange-500 transition-colors mb-1">
                    <Link to={`/recipe/${recipeId}`}>{recipe.title}</Link>
                  </h3>
                  {fav.note && (
                    <p className="text-xs text-slate-400 italic line-clamp-1 mb-2 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                      "{fav.note}"
                    </p>
                  )}
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
            )
          })}
        </div>
      )}

      {/* Note Dialog */}
      <Dialog open={!!noteDialog} onOpenChange={(open) => !open && setNoteDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ghi chú cá nhân</DialogTitle>
          </DialogHeader>
          <textarea
            placeholder="Viết ghi chú của bạn về công thức này..."
            value={noteDialog?.note || ''}
            onChange={(e) => setNoteDialog(prev => ({ ...prev, note: e.target.value }))}
            className="w-full min-h-[100px] rounded-xl resize-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setNoteDialog(null)}>Hủy</Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSaveNote} disabled={updatingNote}>
              {updatingNote && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
