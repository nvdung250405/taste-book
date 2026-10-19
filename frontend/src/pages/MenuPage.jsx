import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import ShoppingMealPicker from '../components/menu/ShoppingMealPicker'
import { ChevronLeft, ChevronRight, Plus, Trash2, ShoppingCart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import QueryError from '../components/ui/QueryError'
import { useRecipeLists, useRecipeListItems } from '../hooks/queries/useRecipeListQueries'
import { useRecipes } from '../hooks/queries/useRecipeQueries'
import api from '../api/recipeLists.api'

import { MEALS, dateKey, moveDate, weekStart, mealListName } from '../lib/weeklyMenu'
import { recipeThumbnail, handleRecipeImageError } from '../lib/recipeImages'

const format = date => date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
const failure = error => toast.error(error?.EM || error?.message || 'Không thể lưu thay đổi. Vui lòng thử lại.')

function MealCell({ list, date, meal, onAdd }) {
  const client = useQueryClient()
  const query = useRecipeListItems(list?.recipeListId)
  const [busy, setBusy] = useState(false)
  const items = query.data?.DT?.items || []
  const update = async (item, servings) => {
    if (busy) return
    setBusy(true)
    const key = ['recipe-list', list.recipeListId]
    await client.cancelQueries({ queryKey: key })
    const previous = client.getQueryData(key)
    client.setQueryData(key, old => ({ ...old, DT: { ...old.DT, items: servings === null ? old.DT.items.filter(row => row.recipeListItemId !== item.recipeListItemId) : old.DT.items.map(row => row.recipeListItemId === item.recipeListItemId ? { ...row, targetServings: servings } : row) } }))
    try {
      if (servings === null) await api.removeRecipeFromMenu(list.recipeListId, item.recipeListItemId)
      else await api.updateRecipePortion(list.recipeListId, item.recipeListItemId, { targetServings: servings })
    } catch (error) { client.setQueryData(key, previous); failure(error) }
    finally {
      setBusy(false)
      client.invalidateQueries({ queryKey: key })
      client.invalidateQueries({ queryKey: ['recipe-lists'] })
    }
  }
  return <div className="min-h-48 border-b border-r border-slate-200 p-2 dark:border-slate-800" aria-label={`${MEALS[meal]} ${format(date)}`}>
    {query.isLoading && list ? <Loader2 className="mx-auto my-6 size-5 animate-spin text-orange-500" /> : query.isError ? <button onClick={() => query.refetch()} className="text-sm text-red-500">Tải lỗi · Thử lại</button> : <div className="space-y-2">
      {items.map(item => <article key={item.recipeListItemId} className="rounded-xl border border-orange-100 bg-orange-50/60 p-2 dark:border-slate-700 dark:bg-slate-800">
        <img src={recipeThumbnail(item.thumbnailUrl, 320)} onError={handleRecipeImageError} alt="" loading="lazy" className="mb-2 h-20 w-full rounded-lg object-cover" />
        <p className="mb-2 text-sm font-semibold leading-snug">{item.title}</p>
        <div className="flex items-center justify-between gap-1">
          <label className="flex items-center gap-1 text-xs text-slate-500"><input key={item.targetServings} type="number" min="1" max="2147483647" defaultValue={item.targetServings} disabled={busy} aria-label={`Khẩu phần ${item.title}`} className="w-12 rounded border bg-white p-1 text-center dark:bg-slate-900" onBlur={e => {
            const value = Number(e.target.value)
            if (!Number.isInteger(value) || value < 1 || value > 2147483647) { e.target.value = item.targetServings; toast.error('Khẩu phần phải là số nguyên dương'); return }
            if (value !== item.targetServings) update(item, value)
          }} onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }} /> phần</label>
          <button disabled={busy} onClick={() => update(item, null)} aria-label={`Xóa ${item.title}`} className="rounded p-2 text-slate-400 hover:text-red-500 disabled:opacity-40"><Trash2 className="size-4" /></button>
        </div>
      </article>)}
    </div>}
    <button onClick={() => onAdd({ date, meal, list })} disabled={busy || query.isError || (!!list && query.isLoading)} className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 py-3 text-xs text-slate-500 transition-colors hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"><Plus className="size-4" /> Thêm món</button>
  </div>
}

function RecipePicker({ slot, onClose }) {
  const [search, setSearch] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [servings, setServings] = useState(2)
  const [busy, setBusy] = useState(false)
  const client = useQueryClient()
  useEffect(() => { const timer = setTimeout(() => { setKeyword(search); setPage(1) }, 300); return () => clearTimeout(timer) }, [search])
  const query = useRecipes({ search: keyword, page, limit: 12 })
  const recipes = query.data?.DT?.items || query.data?.DT?.recipes || (Array.isArray(query.data?.DT) ? query.data.DT : [])
  const add = async recipe => {
    if (busy) return
    if (!Number.isInteger(servings) || servings < 1 || servings > 2147483647) return toast.error('Khẩu phần phải là số nguyên dương')
    setBusy(true)
    try {
      let list = slot.list
      if (!list) {
        const name = mealListName(slot.date, slot.meal)
        try { list = (await api.createRecipeList({ listName: name })).DT }
        catch (error) {
          if (error?.EC !== 2) throw error
          list = (await api.getRecipeLists()).DT.find(row => row.listName === name)
          if (!list) throw error
        }
      }
      await api.addRecipeToMenu(list.recipeListId, { recipeId: recipe.recipeId || recipe.id, targetServings: servings })
      client.invalidateQueries({ queryKey: ['recipe-list', list.recipeListId] })
      toast.success('Đã thêm món vào lịch'); onClose()
    } catch (error) { failure(error) }
    finally { setBusy(false); client.invalidateQueries({ queryKey: ['recipe-lists'] }) }
  }
  return <Dialog open onOpenChange={open => { if (!open && !busy) onClose() }}><DialogContent className="max-w-xl">
    <DialogHeader><DialogTitle>Thêm món · {MEALS[slot.meal]} {format(slot.date)}</DialogTitle></DialogHeader>
    <Input autoFocus placeholder="Tìm tên món ăn…" value={search} onChange={e => setSearch(e.target.value)} />
    <label className="flex items-center gap-3 text-sm">Số khẩu phần<Input type="number" min="1" value={servings} onChange={e => setServings(Number(e.target.value))} className="w-24" disabled={busy} /></label>
    <div className="max-h-[45vh] space-y-2 overflow-y-auto" aria-busy={busy}>
      {query.isLoading ? <p className="py-8 text-center text-slate-500">Đang tìm món…</p> : query.isError ? <QueryError onRetry={query.refetch} /> : recipes.length === 0 ? <p className="py-8 text-center text-slate-500">Không tìm thấy món phù hợp.</p> : recipes.map(recipe => <button key={recipe.recipeId || recipe.id} disabled={busy || keyword !== search} onClick={() => add(recipe)} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-2 text-left hover:bg-orange-50 disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-800"><img src={recipeThumbnail(recipe.thumbnailUrl, 320)} onError={handleRecipeImageError} alt="" className="size-14 rounded-lg object-cover" /><span className="flex-1 text-sm font-medium">{recipe.title}</span><Plus className="size-4 text-orange-500" /></button>)}
    </div>
    <div className="flex items-center justify-between"><Button variant="outline" disabled={busy || page === 1} onClick={() => setPage(page - 1)}>Trước</Button><span className="text-sm" role="status">{busy ? 'Đang thêm món…' : `Trang ${page}`}</span><Button variant="outline" disabled={busy || query.isFetching || recipes.length < 12} onClick={() => setPage(page + 1)}>Tiếp</Button></div>
  </DialogContent></Dialog>
}

export default function MenuPage() {
  const [week, setWeek] = useState(() => weekStart())
  const [slot, setSlot] = useState(null)
  const [shoppingOpen, setShoppingOpen] = useState(false)
  const query = useRecipeLists()
  const days = Array.from({ length: 7 }, (_, index) => moveDate(week, index))
  const lists = Array.isArray(query.data?.DT) ? query.data.DT : []
  const names = new Set(days.flatMap(date => MEALS.map((_, meal) => mealListName(date, meal))))
  const weekLists = lists.filter(list => names.has(list.listName))
  const count = weekLists.reduce((sum, list) => sum + list.totalItems, 0)
  return <div className="container mx-auto space-y-6 px-4 py-8">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-sm font-medium text-orange-500">KẾ HOẠCH BỮA ĂN</p><h1 className="text-3xl font-bold tracking-tight">Thực đơn tuần</h1><p className="mt-2 text-sm text-slate-500">Một tuần ngon miệng, bắt đầu từ kế hoạch nhỏ.</p></div><Button onClick={() => setShoppingOpen(true)} disabled={!count || query.isError} className="rounded-xl bg-orange-500 text-white hover:bg-orange-600"><ShoppingCart className="mr-2 size-4" /> Tạo danh sách đi chợ</Button></div>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2"><Button variant="outline" size="icon" aria-label="Tuần trước" onClick={() => setWeek(moveDate(week, -7))}><ChevronLeft className="size-4" /></Button><span className="min-w-48 text-center font-semibold" aria-live="polite">{format(week)} – {format(days[6])}/{days[6].getFullYear()}</span><Button variant="outline" size="icon" aria-label="Tuần sau" onClick={() => setWeek(moveDate(week, 7))}><ChevronRight className="size-4" /></Button></div><div className="flex items-center gap-4"><span className="text-sm text-slate-500">{count} món đã lên lịch</span><Button variant="outline" onClick={() => setWeek(weekStart())}>Tuần này</Button></div></div>
    {query.isError ? <QueryError title="Không thể tải lịch thực đơn" onRetry={query.refetch} /> : query.isLoading ? <div className="h-96 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" aria-label="Đang tải lịch" /> : <>
      <p className="text-xs text-slate-500 sm:hidden">Vuốt ngang để xem đủ 7 ngày.</p>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="grid min-w-[1150px] grid-cols-[72px_repeat(7,minmax(0,1fr))]">
        <div className="border-b border-r border-slate-200 dark:border-slate-800" />
        {days.map((date, index) => <div key={dateKey(date)} className={`border-b border-r border-slate-200 p-4 text-center dark:border-slate-800 ${dateKey(date) === dateKey(new Date()) ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30' : ''}`}><p className="text-xs text-slate-500">{index === 6 ? 'Chủ nhật' : `Thứ ${index + 2}`}</p><p className="mt-1 text-lg font-bold">{format(date)}</p></div>)}
        {MEALS.flatMap((meal, mealIndex) => [<div key={meal} className="border-b border-r border-slate-200 bg-slate-50 px-2 py-5 text-center text-sm font-semibold dark:border-slate-800 dark:bg-slate-800/40">{meal}</div>, ...days.map(date => <MealCell key={`${dateKey(date)}-${mealIndex}`} date={date} meal={mealIndex} list={lists.find(list => list.listName === mealListName(date, mealIndex))} onAdd={setSlot} />)])}
      </div></div><p className="text-xs text-slate-500">Thêm món vào từng bữa. Nhập khẩu phần rồi nhấn Enter hoặc rời ô để lưu.</p>
    </>}
    {shoppingOpen && <ShoppingMealPicker days={days} lists={lists} refreshing={query.isFetching} onClose={() => setShoppingOpen(false)} />}
    {slot && <RecipePicker slot={slot} onClose={() => setSlot(null)} />}
  </div>
}
