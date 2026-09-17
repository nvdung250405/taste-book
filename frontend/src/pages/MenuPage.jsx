import { useState } from 'react'
import {
  Plus, Trash2, Loader2, BookMarked, ChevronRight,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import {
  useRecipeLists,
  useCreateRecipeList, useDeleteRecipeList
} from '../hooks/queries/useRecipeListQueries'
import { toast } from 'sonner'
import RecipeListDetail from '../components/menu/RecipeListDetail'

export default function MenuPage() {
  const { data: res, isLoading } = useRecipeLists()
  const { mutate: createList, isPending: creating } = useCreateRecipeList()
  const { mutate: deleteList, isPending: deleting } = useDeleteRecipeList()

  const [openCreate, setOpenCreate] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const lists = Array.isArray(res?.DT) ? res.DT : (res?.DT?.items || [])

  const handleCreate = () => {
    if (!newListName.trim()) return toast.error('Vui lòng nhập tên thực đơn')
    createList({ name: newListName.trim() }, {
      onSuccess: () => { toast.success('Đã tạo thực đơn mới'); setNewListName(''); setOpenCreate(false) },
      onError: () => toast.error('Tạo thất bại'),
    })
  }

  const handleDelete = () => {
    if (!toDelete) return
    deleteList(toDelete._id || toDelete.id, {
      onSuccess: () => { toast.success('Đã xóa thực đơn'); setToDelete(null) },
      onError: () => toast.error('Xóa thất bại'),
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Thực đơn của tôi</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Lên kế hoạch bữa ăn và quản lý thực đơn hàng tuần</p>
        </div>
        <Button onClick={() => setOpenCreate(true)} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Tạo thực đơn mới
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          <p className="text-slate-500">Đang tải thực đơn...</p>
        </div>
      ) : lists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
            <BookMarked className="w-10 h-10 text-orange-300" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Chưa có thực đơn nào</h3>
          <p className="text-slate-500 text-sm text-center max-w-sm">Tạo thực đơn để lên kế hoạch bữa ăn và chia sẻ danh sách nguyên liệu cùng gia đình!</p>
          <Button onClick={() => setOpenCreate(true)} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Tạo thực đơn đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lists.map(list => (
            <Card key={list._id || list.id} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{list.name}</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                      {list.totalItems || list.recipes?.length || 0} món ·{' '}
                      {list.description || 'Không có mô tả'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-400 hover:text-red-500"
                      onClick={() => setToDelete(list)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => setExpandedId(expandedId === (list._id || list.id) ? null : (list._id || list.id))}
                  className="w-full flex items-center justify-between text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
                >
                  <span>{expandedId === (list._id || list.id) ? 'Ẩn bớt' : 'Xem danh sách món'}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${expandedId === (list._id || list.id) ? 'rotate-90' : ''}`} />
                </button>
                {expandedId === (list._id || list.id) && (
                  <RecipeListDetail list={list} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tạo thực đơn mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Ví dụ: Thực đơn tuần này, Tiệc cuối năm..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="rounded-xl"
            />
          </div>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setOpenCreate(false)}>Hủy</Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tạo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xóa thực đơn?</DialogTitle></DialogHeader>
          <p className="text-slate-500 text-sm">
            Bạn có chắc muốn xóa <span className="font-semibold text-slate-700 dark:text-slate-300">"{toDelete?.name}"</span>? Toàn bộ các món trong thực đơn sẽ bị xóa.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setToDelete(null)}>Hủy</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
