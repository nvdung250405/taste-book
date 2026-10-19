import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import QueryError from '../components/ui/QueryError'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog'
import { useShoppingLists, useCreateShoppingList, useDeleteShoppingList } from '../hooks/queries/useShoppingListQueries'
import { useRecipeLists } from '../hooks/queries/useRecipeListQueries'
import ShoppingListDetail from '../components/shopping-list/ShoppingListDetail'

function CreateDialog({ onClose, onCreated }) {
  const query = useRecipeLists()
  const mutation = useCreateShoppingList()
  const [title, setTitle] = useState('')
  const [selected, setSelected] = useState([])
  const lists = (query.data?.DT || []).filter(list => list.totalItems > 0)
  const submit = event => {
    event.preventDefault()
    if (mutation.isPending || !selected.length || !title.trim()) return
    mutation.mutate({ title: title.trim(), recipeListIds: selected }, {
      onSuccess: result => { toast.success('Đã tạo danh sách đi chợ'); onCreated(result.DT.shoppingListId) },
      onError: error => toast.error(error?.EM || 'Không thể tạo danh sách'),
    })
  }
  return <Dialog open onOpenChange={open => { if (!open && !mutation.isPending) onClose() }}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Tạo danh sách từ thực đơn</DialogTitle></DialogHeader><form onSubmit={submit} className="space-y-4"><label className="block space-y-1 text-sm"><span>Tên danh sách</span><Input required maxLength={100} value={title} disabled={mutation.isPending} onChange={e => setTitle(e.target.value)} placeholder="Ví dụ: Đi chợ cuối tuần" className="h-11 text-base" /></label><p className="text-sm text-slate-500">Chọn thực đơn để tổng hợp nguyên liệu theo khẩu phần.</p>
    {query.isLoading ? <p role="status">Đang tải thực đơn…</p> : query.isError ? <QueryError title="Không thể tải thực đơn" onRetry={query.refetch} /> : !lists.length ? <p className="text-sm">Chưa có thực đơn có món. <Link to="/menu" className="text-orange-600 underline">Lên lịch thực đơn</Link></p> : <div className="max-h-64 space-y-2 overflow-y-auto">{lists.map(list => <label key={list.recipeListId} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><input type="checkbox" disabled={mutation.isPending} checked={selected.includes(list.recipeListId)} onChange={e => setSelected(current => e.target.checked ? [...current, list.recipeListId] : current.filter(id => id !== list.recipeListId))} className="size-5 shrink-0 accent-orange-500" /><span className="min-w-0 break-words text-sm">{list.listName} · {list.totalItems} món</span></label>)}</div>}
    <Button type="submit" disabled={!selected.length || !title.trim() || mutation.isPending} className="h-11 w-full bg-orange-500 text-white hover:bg-orange-600">{mutation.isPending ? 'Đang tổng hợp…' : `Tạo từ ${selected.length} thực đơn`}</Button></form></DialogContent></Dialog>
}

export default function ShoppingListPage() {
  const query = useShoppingLists()
  const deletion = useDeleteShoppingList()
  const [selectedId, setSelectedId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const lists = Array.isArray(query.data?.DT) ? query.data.DT : []
  const selected = lists.find(list => list.shoppingListId === selectedId) || lists[0]
  const remove = () => {
    if (deletion.isPending) return
    deletion.mutate(toDelete.shoppingListId, { onSuccess: () => { toast.success('Đã xóa danh sách'); setToDelete(null) }, onError: error => toast.error(error?.EM || 'Không thể xóa danh sách') })
  }
  return <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 pb-24 sm:py-10">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-xs font-semibold tracking-widest text-orange-500">MUA ĐỦ · NẤU NGON</p><h1 className="text-2xl font-bold sm:text-3xl">Danh sách đi chợ</h1><p className="mt-2 text-sm text-slate-500">Chạm để đánh dấu, bớt một điều phải nhớ.</p></div><Button onClick={() => setCreating(true)} className="h-11 rounded-xl bg-orange-500 text-white hover:bg-orange-600"><Plus className="mr-2 size-4" />Tạo danh sách</Button></header>
    {query.isLoading ? <div className="h-80 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" aria-label="Đang tải danh sách" /> : query.isError ? <QueryError title="Không thể tải danh sách đi chợ" onRetry={query.refetch} /> : !selected ? <div className="space-y-4 rounded-2xl border border-dashed border-slate-300 px-5 py-16 text-center dark:border-slate-700"><ShoppingCart className="mx-auto size-12 text-orange-400" /><h2 className="text-lg font-semibold">Sẵn sàng cho chuyến đi chợ?</h2><p className="text-sm text-slate-500">Tạo danh sách từ thực đơn, sau đó thêm những món cần mua ngoài công thức.</p><Button variant="outline" onClick={() => setCreating(true)}>Chọn thực đơn</Button></div> : <>
      <label className="block space-y-2 text-sm font-medium"><span>Chuyến đi chợ</span><select value={selected.shoppingListId} onChange={e => setSelectedId(Number(e.target.value))} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base dark:border-slate-700 dark:bg-slate-900">{lists.map(list => <option key={list.shoppingListId} value={list.shoppingListId}>{list.title}</option>)}</select></label>
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="break-words text-xl font-semibold">{selected.title}</h2><p className="mt-1 text-xs text-slate-500">{selected.status === 'Completed' ? 'Chuyến đi đã hoàn thành' : 'Đang mua sắm'}</p></div><Button variant="ghost" size="icon" className="size-11 shrink-0 text-slate-400 hover:text-red-500" aria-label="Xóa danh sách này" onClick={() => setToDelete(selected)}><Trash2 className="size-4" /></Button></div><ShoppingListDetail key={selected.shoppingListId} list={selected} /></section>
    </>}
    {creating && <CreateDialog onClose={() => setCreating(false)} onCreated={id => { setSelectedId(id); setCreating(false) }} />}
    <Dialog open={!!toDelete} onOpenChange={open => { if (!open && !deletion.isPending) setToDelete(null) }}><DialogContent><DialogHeader><DialogTitle>Xóa danh sách đi chợ?</DialogTitle></DialogHeader><p className="break-words text-sm text-slate-500">Xóa “{toDelete?.title}” và toàn bộ các mục bên trong? Thao tác không thể hoàn tác.</p><DialogFooter><Button variant="outline" disabled={deletion.isPending} onClick={() => setToDelete(null)}>Hủy</Button><Button disabled={deletion.isPending} onClick={remove} className="bg-red-600 text-white hover:bg-red-700">{deletion.isPending ? 'Đang xóa…' : 'Xóa danh sách'}</Button></DialogFooter></DialogContent></Dialog>
  </div>
}
