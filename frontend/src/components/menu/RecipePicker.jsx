import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import QueryError from '../ui/QueryError'
import { useRecipes } from '../../hooks/queries/useRecipeQueries'
import api from '../../api/recipeLists.api'
import { MEALS, mealListName } from '../../lib/weeklyMenu'
import { recipeThumbnail, handleRecipeImageError } from '../../lib/recipeImages'
const format = (date) =>
  date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
const failure = (error) =>
  toast.error(error?.EM || 'Không thể thêm món. Vui lòng thử lại.')

export default function RecipePicker({ slot, onClose }) {
  const [search, setSearch] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [servings, setServings] = useState(2)
  const [busy, setBusy] = useState(false)
  const client = useQueryClient()
  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])
  const query = useRecipes({ search: keyword, page, limit: 12 })
  const recipes =
    query.data?.DT?.items ||
    query.data?.DT?.recipes ||
    (Array.isArray(query.data?.DT) ? query.data.DT : [])
  const add = async (recipe) => {
    if (busy) return
    if (!Number.isInteger(servings) || servings < 1 || servings > 2147483647)
      return toast.error('Khẩu phần phải là số nguyên dương')
    setBusy(true)
    try {
      let list = slot.list
      if (!list) {
        const name = mealListName(slot.date, slot.meal)
        try {
          list = (await api.createRecipeList({ listName: name })).DT
        } catch (error) {
          if (error?.EC !== 2) throw error
          list = (await api.getRecipeLists()).DT.find(
            (row) => row.listName === name,
          )
          if (!list) throw error
        }
      }
      await api.addRecipeToMenu(list.recipeListId, {
        recipeId: recipe.recipeId || recipe.id,
        targetServings: servings,
      })
      client.invalidateQueries({ queryKey: ['recipe-list', list.recipeListId] })
      toast.success('Đã thêm món vào thực đơn')
      onClose()
    } catch (error) {
      failure(error)
    } finally {
      setBusy(false)
      client.invalidateQueries({ queryKey: ['recipe-lists'] })
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose()
      }}
    >
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
        showCloseButton={!busy}
        onEscapeKeyDown={(e) => {
          if (busy) e.preventDefault()
        }}
        onInteractOutside={(e) => {
          if (busy) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>
            Thêm món ·{' '}
            {slot.list
              ? slot.list.listName
              : `${MEALS[slot.meal]} ${format(slot.date)}`}
          </DialogTitle>
          <DialogDescription>
            Chọn món ăn và số khẩu phần để thêm vào thực đơn.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Tìm tên món ăn…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="flex items-center gap-3 text-sm">
          Số khẩu phần
          <Input
            type="number"
            min="1"
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="w-24"
            disabled={busy}
          />
        </label>
        <div
          className="max-h-[45vh] space-y-2 overflow-y-auto"
          aria-busy={busy}
        >
          {query.isLoading ? (
            <p className="py-8 text-center text-slate-500">Đang tìm món…</p>
          ) : query.isError ? (
            <QueryError onRetry={query.refetch} />
          ) : recipes.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              Không tìm thấy món phù hợp.
            </p>
          ) : (
            recipes.map((recipe) => (
              <button
                key={recipe.recipeId || recipe.id}
                disabled={busy || keyword !== search}
                onClick={() => add(recipe)}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-2 text-left hover:bg-orange-50 disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <img
                  src={recipeThumbnail(recipe.thumbnailUrl, 320)}
                  onError={handleRecipeImageError}
                  alt=""
                  className="size-14 rounded-lg object-cover"
                />
                <span className="flex-1 text-sm font-medium">
                  {recipe.title}
                </span>
                <Plus className="size-4 text-orange-500" />
              </button>
            ))
          )}
        </div>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={busy || page === 1}
            onClick={() => setPage(page - 1)}
          >
            Trước
          </Button>
          <span className="text-sm" role="status">
            {busy ? 'Đang thêm món…' : `Trang ${page}`}
          </span>
          <Button
            variant="outline"
            disabled={busy || query.isFetching || recipes.length < 12}
            onClick={() => setPage(page + 1)}
          >
            Tiếp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
