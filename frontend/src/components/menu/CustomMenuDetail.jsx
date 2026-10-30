import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  useRecipeListItems,
  useRemoveRecipeFromMenu,
  useUpdateRecipePortion,
} from '../../hooks/queries/useRecipeListQueries'
import { validServings } from '../../lib/menuLists'
import { Button } from '../ui/button'
import QueryError from '../ui/QueryError'
import RecipePicker from './RecipePicker'

export default function CustomMenuDetail({ list, onClose }) {
  const query = useRecipeListItems(list.recipeListId)
  const remove = useRemoveRecipeFromMenu()
  const portion = useUpdateRecipePortion()
  const [picker, setPicker] = useState(false)
  const busy = remove.isPending || portion.isPending
  const failure = (error) =>
    toast.error(error?.EM || 'Không thể cập nhật món ăn. Vui lòng thử lại.')
  return (
    <section
      className="space-y-4 rounded-2xl border bg-white p-5 dark:bg-slate-900"
      aria-label={`Chi tiết ${list.listName}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="break-words text-xl font-bold">{list.listName}</h2>
        <div className="flex gap-2">
          <Button
            disabled={busy || !query.isSuccess}
            onClick={() => setPicker(true)}
          >
            Thêm món
          </Button>
          <Button variant="outline" onClick={onClose}>
            Đóng chi tiết
          </Button>
        </div>
      </div>
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
              <Link
                to={`/recipe/${item.recipeId}`}
                className="min-w-0 flex-1 break-words font-medium hover:text-orange-600"
              >
                {item.title}
              </Link>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  Khẩu phần
                  <input
                    key={item.targetServings}
                    type="number"
                    min="1"
                    max="2147483647"
                    defaultValue={item.targetServings}
                    aria-label={`Khẩu phần ${item.title}`}
                    disabled={busy}
                    className="w-20 rounded-lg border bg-transparent p-2"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') event.currentTarget.blur()
                    }}
                    onBlur={(event) => {
                      const servings = Number(event.target.value)
                      if (!validServings(servings)) {
                        event.target.value = item.targetServings
                        toast.error('Khẩu phần phải là số nguyên dương.')
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
                  onClick={() =>
                    remove.mutate(
                      {
                        listId: list.recipeListId,
                        itemId: item.recipeListItemId,
                      },
                      { onError: failure },
                    )
                  }
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
    </section>
  )
}
