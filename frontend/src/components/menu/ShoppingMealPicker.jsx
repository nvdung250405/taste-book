import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import shoppingApi from '../../api/shoppingLists.api'
import { MEALS, mealListName, dateKey, shoppingMealTitle } from '../../lib/weeklyMenu'

const format = date => date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })

export default function ShoppingMealPicker({ days, lists, refreshing, onClose }) {
  const rows = days.map(date => ({ date, meals: MEALS.map((name, index) => ({ name, list: lists.find(list => list.listName === mealListName(date, index) && list.totalItems > 0) })) }))
  const available = rows.flatMap(row => row.meals.flatMap(meal => meal.list ? [meal.list] : []))
  const [selected, setSelected] = useState(() => new Set(available.map(list => list.recipeListId)))
  const [saving, setSaving] = useState(false)
  const client = useQueryClient()
  const navigate = useNavigate()
  const chosen = available.filter(list => selected.has(list.recipeListId))
  const title = shoppingMealTitle(rows, selected)
  const setGroup = (ids, checked) => setSelected(previous => {
    const next = new Set(previous)
    ids.forEach(id => { if (checked) next.add(id); else next.delete(id) })
    return next
  })
  const create = async () => {
    if (saving || refreshing || !chosen.length) return
    setSaving(true)
    try {
      await shoppingApi.createShoppingList({ title, recipeListIds: chosen.map(list => list.recipeListId) })
      client.invalidateQueries({ queryKey: ['shopping-lists'] })
      toast.success('Đã tạo danh sách đi chợ')
      navigate('/shopping-list')
    } catch (error) { toast.error(error?.EM || 'Không thể tạo danh sách đi chợ. Vui lòng thử lại.') }
    finally { setSaving(false) }
  }
  return <Dialog open onOpenChange={open => { if (!open && !saving) onClose() }}>
    <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-xl">
      <DialogHeader><DialogTitle>Chọn ngày và bữa đi chợ</DialogTitle></DialogHeader>
      <p className="text-sm text-slate-500">Tuần {format(days[0])} – {format(days[6])}. Chỉ tổng hợp nguyên liệu từ các bữa được chọn.</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={saving || !available.length} onClick={() => setGroup(available.map(list => list.recipeListId), true)}>Chọn tất cả</Button>
        <Button variant="ghost" disabled={saving || !chosen.length} onClick={() => setSelected(new Set())}>Bỏ chọn tất cả</Button>
      </div>
      <div className="min-h-0 space-y-3 overflow-y-auto pr-1">
        {rows.map(({ date, meals }, index) => {
          const ids = meals.flatMap(meal => meal.list ? [meal.list.recipeListId] : [])
          const count = ids.filter(id => selected.has(id)).length
          return <fieldset key={dateKey(date)} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <legend className="px-1 text-sm font-semibold">{index === 6 ? 'Chủ nhật' : `Thứ ${index + 2}`} · {format(date)}</legend>
            <label className="mb-2 flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" ref={node => { if (node) node.indeterminate = count > 0 && count < ids.length }} checked={ids.length > 0 && count === ids.length} disabled={saving || !ids.length} onChange={e => setGroup(ids, e.target.checked)} className="size-5 accent-orange-500" />Chọn cả ngày</label>
            <div className="grid grid-cols-3 gap-2">{meals.map(({ name, list }) => <label key={name} className={`flex min-h-16 items-center gap-2 rounded-lg border p-2 text-sm ${list && selected.has(list.recipeListId) ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/30' : 'border-slate-200 dark:border-slate-700'} ${!list ? 'opacity-50' : ''}`}><input type="checkbox" checked={!!list && selected.has(list.recipeListId)} disabled={saving || !list} onChange={e => setGroup([list.recipeListId], e.target.checked)} className="size-5 shrink-0 accent-orange-500" /><span>{name}<span className="mt-1 block text-xs text-slate-500">{list ? `${list.totalItems} món` : 'Chưa có món'}</span></span></label>)}</div>
          </fieldset>
        })}
      </div>
      <p role="status" className="text-sm text-slate-500">{refreshing ? 'Đang cập nhật thực đơn…' : `Đã chọn ${chosen.length} bữa · ${chosen.reduce((sum, list) => sum + list.totalItems, 0)} món`}</p>
      {!!chosen.length && <div className="rounded-lg bg-orange-50 p-3 text-sm dark:bg-orange-950/30"><p className="break-words"><span className="font-medium">Tên chuyến đi chợ: </span>{title}</p>{title.includes(':S') || title.includes(':Tr') || title.includes(':T') ? <p className="mt-1 text-xs text-slate-500">S: Sáng · Tr: Trưa · T: Tối</p> : null}</div>}
      <DialogFooter><Button variant="outline" disabled={saving} onClick={onClose}>Hủy</Button><Button disabled={saving || refreshing || !chosen.length} onClick={create} className="bg-orange-500 text-white hover:bg-orange-600">{saving && <Loader2 className="mr-2 size-4 animate-spin" />}{saving ? 'Đang tạo…' : 'Tạo danh sách đi chợ'}</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}
