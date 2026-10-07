import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { FolderHeart, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCategories, useDeleteCategory } from '../hooks/queries/useCategoryQueries'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog'
import QueryError from '../components/ui/QueryError'
import CategoryFormDialog from '../components/category/CategoryFormDialog'

export default function MyCategoriesPage() {
  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />
  return <MyCategories />
}

function MyCategories() {
  const { data, isPending, isError, isFetching, refetch } = useCategories()
  const removal = useDeleteCategory()
  const [editor, setEditor] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const categories = (data?.DT || []).filter(c => c.createdBy != null)
  const deleteCategory = () => {
    if (removal.isPending) return
    setDeleteError('')
    removal.mutate(deleting.categoryId, {
      onSuccess: () => { toast.success('Đã xóa danh mục'); setDeleting(null) },
      onError: (error) => setDeleteError(error?.EM || 'Không thể xóa danh mục. Vui lòng thử lại.'),
    })
  }
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold flex items-center gap-3"><FolderHeart className="text-orange-500" />Danh mục của tôi</h1><p className="text-slate-500 mt-2">Sắp xếp công thức theo các danh mục riêng của bạn.</p></div>
        <Button onClick={() => setEditor({})} className="bg-orange-500 hover:bg-orange-600"><Plus />Thêm danh mục</Button>
      </div>
      {isPending ? <div role="status" className="flex justify-center py-16"><Loader2 className="animate-spin" /><span className="sr-only">Đang tải danh mục</span></div> : isError ?
        <QueryError title="Không thể tải danh mục cá nhân" onRetry={refetch} isRetrying={isFetching} /> : categories.length === 0 ?
        <div className="rounded-2xl border border-dashed p-10 text-center space-y-3"><FolderHeart className="mx-auto w-12 h-12 text-orange-400" /><h2 className="text-xl font-semibold">Bạn chưa có danh mục cá nhân</h2><p className="text-slate-500">Tạo danh mục để dễ chọn khi viết công thức.</p><Button variant="outline" onClick={() => setEditor({})}>Tạo danh mục đầu tiên</Button></div> :
        <div className="grid sm:grid-cols-2 gap-4">{categories.map(category => (
          <div key={category.categoryId} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
            <h2 className="font-semibold break-words min-w-0">{category.categoryName}</h2>
            <div className="flex shrink-0 gap-1"><Button size="icon" variant="ghost" aria-label={`Sửa ${category.categoryName}`} onClick={() => setEditor(category)}><Pencil className="w-4 h-4" /></Button><Button size="icon" variant="ghost" className="text-red-500" aria-label={`Xóa ${category.categoryName}`} onClick={() => { setDeleting(category); setDeleteError('') }}><Trash2 className="w-4 h-4" /></Button></div>
          </div>
        ))}</div>}
      {editor && <CategoryFormDialog category={editor.categoryId ? editor : null} onClose={() => setEditor(null)} />}
      <Dialog open={!!deleting} onOpenChange={(open) => { if (!open && !removal.isPending) setDeleting(null) }}>
        <DialogContent showCloseButton={!removal.isPending} onEscapeKeyDown={(e) => { if (removal.isPending) e.preventDefault() }} onInteractOutside={(e) => { if (removal.isPending) e.preventDefault() }}>
          <DialogHeader><DialogTitle>Xóa danh mục?</DialogTitle><DialogDescription>Danh mục “{deleting?.categoryName}” sẽ bị gỡ khỏi các công thức đã gắn. Các công thức vẫn được giữ lại.</DialogDescription></DialogHeader>
          {deleteError && <p role="alert" className="text-sm text-red-600">{deleteError}</p>}
          <DialogFooter><Button variant="outline" disabled={removal.isPending} onClick={() => setDeleting(null)}>Hủy</Button><Button variant="destructive" disabled={removal.isPending} onClick={deleteCategory}>{removal.isPending ? 'Đang xóa…' : 'Xóa danh mục'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
