import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, ChefHat, Clock, Star, Loader2, BookOpen } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { useMyRecipes, useDeleteRecipe } from '../hooks/queries/useRecipeQueries'
import { toast } from 'sonner'

const STATUS_STYLES = {
  approved: { label: 'Đã duyệt', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  pending: { label: 'Chờ duyệt', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' },
  rejected: { label: 'Bị từ chối', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
  draft: { label: 'Bản nháp', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
}

export default function MyRecipesPage() {
  const { data: res, isLoading } = useMyRecipes()
  const { mutate: deleteRecipe, isPending: deleting } = useDeleteRecipe()
  const [toDelete, setToDelete] = useState(null)

  const recipes = Array.isArray(res?.DT) ? res.DT : (res?.DT?.items || res?.DT?.recipes || [])

  const handleDelete = () => {
    if (!toDelete) return
    deleteRecipe(toDelete._id || toDelete.id, {
      onSuccess: () => { toast.success('Đã xóa công thức'); setToDelete(null) },
      onError: () => toast.error('Xóa thất bại'),
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Công thức của tôi</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Quản lý tất cả công thức bạn đã tạo</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl" asChild>
          <Link to="/recipe/create">
            <Plus className="w-4 h-4 mr-2" /> Tạo công thức mới
          </Link>
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          <p className="text-slate-500">Đang tải công thức của bạn...</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-orange-300" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Bạn chưa có công thức nào</h3>
          <p className="text-slate-500 text-sm text-center max-w-sm">Hãy chia sẻ những món ăn ngon của bạn với cộng đồng TasteBook!</p>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl" asChild>
            <Link to="/recipe/create">
              <Plus className="w-4 h-4 mr-2" /> Tạo công thức đầu tiên
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => {
            const status = STATUS_STYLES[recipe.status] || STATUS_STYLES['draft']
            return (
              <Card key={recipe._id || recipe.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={recipe.thumbnail || recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=600&auto=format&fit=crop'}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-slate-50 line-clamp-1 mb-2 text-lg group-hover:text-orange-500 transition-colors">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {recipe.prepTime || recipe.time || '—'}
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat className="w-3.5 h-3.5" /> {recipe.difficulty || '—'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" /> {recipe.rating || '—'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 rounded-lg" asChild>
                      <Link to={`/recipe/${recipe._id || recipe.id}/edit`}>
                        <Pencil className="w-3.5 h-3.5 mr-1.5" /> Sửa
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900"
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

      {/* Delete Confirm Dialog */}
      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xóa công thức?</DialogTitle>
          </DialogHeader>
          <p className="text-slate-500 text-sm">
            Bạn có chắc muốn xóa <span className="font-semibold text-slate-700 dark:text-slate-300">"{toDelete?.title}"</span>? Thao tác này không thể hoàn tác.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setToDelete(null)}>Hủy</Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
