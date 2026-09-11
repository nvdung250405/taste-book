import { useState } from 'react'
import { ShoppingCart, Loader2, Plus, Trash2, Package } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../components/ui/dialog'
import {
  useShoppingLists,
  useCreateShoppingList, useDeleteShoppingList,
} from '../hooks/queries/useShoppingListQueries'
import { toast } from 'sonner'
import { cn } from '../lib/utils'

import ShoppingListDetail from '../components/shopping-list/ShoppingListDetail'

export default function ShoppingListPage() {
  const { data: res, isLoading } = useShoppingLists()
  const { mutate: createList, isPending: creating } = useCreateShoppingList()
  const { mutate: deleteList, isPending: deleting } = useDeleteShoppingList()

  const [openCreate, setOpenCreate] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const lists = Array.isArray(res?.DT) ? res.DT : (res?.DT?.items || [])

  const handleCreate = () => {
    if (!newListName.trim()) return toast.error('Vui lòng nhập tên danh sách')
    createList({ name: newListName.trim() }, {
      onSuccess: (data) => {
        toast.success('Đã tạo danh sách mới')
        setNewListName('')
        setOpenCreate(false)
        setExpandedId(data?.DT?._id || data?.DT?.id)
      },
      onError: () => toast.error('Tạo thất bại'),
    })
  }

  const handleDelete = () => {
    if (!toDelete) return
    deleteList(toDelete._id || toDelete.id, {
      onSuccess: () => { toast.success('Đã xóa danh sách'); setToDelete(null) },
      onError: () => toast.error('Xóa thất bại'),
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Danh sách đi chợ</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Quản lý nguyên liệu cần mua cho các bữa ăn</p>
        </div>
        <Button onClick={() => setOpenCreate(true)} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Tạo danh sách mới
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          <p className="text-slate-500">Đang tải danh sách...</p>
        </div>
      ) : lists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-orange-300" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Chưa có danh sách đi chợ nào</h3>
          <p className="text-slate-500 text-sm text-center max-w-sm">
            Tạo danh sách từ thực đơn của bạn hoặc thêm nguyên liệu thủ công để không bao giờ quên mua gì nữa!
          </p>
          <Button onClick={() => setOpenCreate(true)} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Tạo danh sách đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lists.map(list => {
            const listId = list._id || list.id
            const isExpanded = expandedId === listId
            return (
              <Card key={listId} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{list.name}</CardTitle>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" />
                          {list.totalItems || 0} nguyên liệu
                        </span>
                        {list.status && (
                          <span className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            list.status === 'completed'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                          )}>
                            {list.status === 'completed' ? 'Hoàn thành' : 'Đang mua'}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-400 hover:text-red-500"
                      onClick={() => setToDelete(list)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : listId)}
                    className="w-full flex items-center justify-between text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors mb-2"
                  >
                    <span className="flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4" />
                      {isExpanded ? 'Ẩn bớt' : 'Xem danh sách'}
                    </span>
                  </button>
                  {isExpanded && <ShoppingListDetail list={list} />}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tạo danh sách đi chợ mới</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Ví dụ: Chợ thứ 7, Bữa tiệc sinh nhật..."
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="rounded-xl"
          />
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
          <DialogHeader><DialogTitle>Xóa danh sách?</DialogTitle></DialogHeader>
          <p className="text-slate-500 text-sm">
            Bạn có chắc muốn xóa <span className="font-semibold text-slate-700 dark:text-slate-300">"{toDelete?.name}"</span>?
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
