import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  useRecipeListItems,
  useRemoveRecipeFromMenu,
  useUpdateRecipePortion,
} from '../../hooks/queries/useRecipeListQueries'
import { recipeImageProps, handleRecipeImageError } from '../../lib/recipeImages'
import { validServings } from '../../lib/menuLists'
import { Button } from '../ui/button'
import QueryError from '../ui/QueryError'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog'
import RecipePicker from './RecipePicker'
import MenuItemDeleteDialog from './MenuItemDeleteDialog'

export default function CustomMenuDetail({ list, onClose }) {
  const query = useRecipeListItems(list.recipeListId)
  const remove = useRemoveRecipeFromMenu()
  const portion = useUpdateRecipePortion()
  const [picker, setPicker] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const busy = remove.isPending || portion.isPending
  const failure = (error) =>
    toast.error(error?.EM || 'Không thể cập nhật món ăn. Vui lòng thử lại.')
  return (
    <Dialog open onOpenChange={open => { if (!open && !busy) onClose() }}>
    <DialogContent
      className="max-h-[85dvh] overflow-y-auto sm:max-w-4xl"
      showCloseButton={!busy}
      onEscapeKeyDown={event => { if (busy) event.preventDefault() }}
      onInteractOutside={event => { if (busy) event.preventDefault() }}
    >
    <section
      className="min-w-0 space-y-4"
      aria-label={`Chi tiết ${list.listName}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
        <DialogTitle className="break-words text-xl font-bold">{list.listName}</DialogTitle>
        <div className="flex gap-2">
          <Button
            disabled={busy || !query.isSuccess}
            onClick={() => setPicker(true)}
          >
            Thêm món
          </Button>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Đóng chi tiết
          </Button>
        </div>
      </div>
      <DialogDescription>Danh sách món ăn trong thực đơn. Bạn có thể thêm món, thay đổi khẩu phần hoặc bỏ món.</DialogDescription>
      {query.isPending ? (
        <p role="status">Đang tải món ăn…</p>
      ) : query.isError ? (
        <QueryError onRetry={query.refetch} isRetrying={query.isFetching} />
      ) : !query.data?.DT?.items?.length ? (
        <p className="py-6 text-sm text-slate-500">
          Thực đơn chưa có món ăn. Chọn “Thêm món” để bắt đầu.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {query.data.DT.items.map((item) => (
            <li
              key={item.recipeListItemId}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <img {...recipeImageProps(item.thumbnailUrl, '64px')} onError={handleRecipeImageError} alt={item.title} className="size-16 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1 basis-40">
              {item.isRecipeDeleted ? <div className="min-w-0 flex-1 break-words font-medium">{item.title}<span className="ml-2 rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">Công thức đã bị xóa</span></div> : <Link
                to={`/recipe/${item.recipeId}`}
                className="min-w-0 flex-1 break-words font-medium hover:text-orange-600"
              >
                {item.title}
              </Link>}
              <p className="mt-1 break-words text-sm text-slate-500">{item.cookTimeMinutes} phút · {({ Easy: 'Dễ', Medium: 'Trung bình', Hard: 'Khó' })[item.difficulty] || item.difficulty} · {item.authorName}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  Khẩu phần
                  <input
                    key={item.targetServings}
                    type="number"
                    min="1"
                    max="100"
                    defaultValue={item.targetServings}
                    aria-label={`Khẩu phần ${item.title}`}
                    disabled={busy || item.isRecipeDeleted}
                    className="w-20 rounded-lg border bg-transparent p-2"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') event.currentTarget.blur()
                    }}
                    onBlur={(event) => {
                      if (item.isRecipeDeleted) return
                      const servings = Number(event.target.value)
                      if (!validServings(servings)) {
                        event.target.value = item.targetServings
                        toast.error('Khẩu phần phải là số nguyên từ 1 đến 100.')
                        return
                      }
                      if (servings !== item.targetServings)
                        portion.mutate(
                          {
                            listId: list.recipeListId,
                            itemId: item.recipeListItemId,
                            data: { targetServings: servings },
                          },
                          {
                            onSuccess: () => toast.success('Cập nhật khẩu phần thành công!'),
                            onError: (error) => {
                              event.target.value = item.targetServings
                              failure(error)
                            },
                          },
                        )
                    }}
                  />
                </label>
                <Button
                  variant="ghost"
                  className="text-red-600"
                  disabled={busy}
                  aria-label={`Bỏ ${item.title} khỏi thực đơn`}
                  onClick={() => setDeleting(item)}
                >
                  Bỏ món
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {picker && (
        <RecipePicker slot={{ list }} onClose={() => setPicker(false)} />
      )}
      <MenuItemDeleteDialog
        item={deleting}
        pending={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting || busy) return
          remove.mutate(
            { listId: list.recipeListId, itemId: deleting.recipeListItemId },
            {
              onSuccess: () => {
                toast.success('Đã xóa món khỏi thực đơn')
                setDeleting(null)
              },
              onError: failure,
            },
          )
        }}
      />
    </section>
    </DialogContent>
    </Dialog>
  )
}
