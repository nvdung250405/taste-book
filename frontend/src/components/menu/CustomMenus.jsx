import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import {
  useRecipeLists,
  useDeleteRecipeList,
} from '../../hooks/queries/useRecipeListQueries'
import { isWeeklyList } from '../../lib/menuLists'
import { Button } from '../ui/button'
import QueryError from '../ui/QueryError'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import MenuNameDialog from './MenuNameDialog'
import CustomMenuDetail from './CustomMenuDetail'

export default function CustomMenus() {
  const query = useRecipeLists()
  const remove = useDeleteRecipeList()
  const [editor, setEditor] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const lists = Array.isArray(query.data?.DT) ? query.data.DT : []
  const custom = lists.filter((list) => !isWeeklyList(list))
  const active = custom.find((list) => list.recipeListId === selected)
  const deleteList = () => {
    if (remove.isPending) return
    setError('')
    remove.mutate(deleting.recipeListId, {
      onSuccess: () => {
        toast.success('Đã xóa thực đơn')
        if (selected === deleting.recipeListId) setSelected(null)
        setDeleting(null)
      },
      onError: (failure) =>
        setError(failure?.EM || 'Không thể xóa thực đơn. Vui lòng thử lại.'),
    })
  }
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Thực đơn của tôi</h2>
          <p className="mt-1 text-sm text-slate-500">
            Lưu các bộ món ăn cho gia đình, chế độ ăn hoặc những dịp đặc biệt.
          </p>
        </div>
        <Button
          disabled={!query.isSuccess}
          onClick={() => setEditor({ list: null })}
          className="rounded-xl bg-orange-600 text-white hover:bg-orange-700"
        >
          <Plus className="h-4 w-4" />
          Tạo thực đơn mới
        </Button>
      </div>
      {query.isPending ? (
        <p role="status" className="py-8 text-slate-500">
          Đang tải thực đơn…
        </p>
      ) : query.isError ? (
        <QueryError title="Không thể tải thực đơn" onRetry={query.refetch} />
      ) : !custom.length ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-slate-500">
          <BookOpen className="mx-auto mb-3 h-9 w-9 text-orange-400" />
          Bạn chưa có thực đơn tùy biến. Hãy tạo thực đơn đầu tiên!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {custom.map((list) => (
            <article
              key={list.recipeListId}
              className={`rounded-2xl border bg-white p-5 dark:bg-slate-900 ${selected === list.recipeListId ? 'border-orange-400 ring-1 ring-orange-200' : ''}`}
            >
              <h3 className="break-words text-lg font-semibold">
                {list.listName}
              </h3>
              <p className="my-3 text-sm text-slate-500">
                {list.totalItems ?? 0} món ăn
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelected(list.recipeListId)}
                >
                  Xem món
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Đổi tên ${list.listName}`}
                  onClick={() => setEditor({ list })}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600"
                  aria-label={`Xóa ${list.listName}`}
                  onClick={() => {
                    setError('')
                    setDeleting(list)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
      {active && (
        <CustomMenuDetail
          key={active.recipeListId}
          list={active}
          onClose={() => setSelected(null)}
        />
      )}
      {editor && (
        <MenuNameDialog
          list={editor.list}
          lists={lists}
          onClose={() => setEditor(null)}
          onSaved={(list) => {
            setSelected(list.recipeListId)
            setEditor(null)
          }}
        />
      )}
      <Dialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setDeleting(null)
        }}
      >
        <DialogContent
          showCloseButton={!remove.isPending}
          onEscapeKeyDown={(event) => {
            if (remove.isPending) event.preventDefault()
          }}
          onInteractOutside={(event) => {
            if (remove.isPending) event.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>Xóa thực đơn?</DialogTitle>
            <DialogDescription>
              Bạn muốn xóa “{deleting?.listName}”? Toàn bộ món trong thực đơn
              này sẽ được gỡ. Công thức gốc vẫn được giữ lại.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={remove.isPending}
              onClick={() => setDeleting(null)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={deleteList}
            >
              {remove.isPending ? 'Đang xóa…' : 'Xác nhận xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
