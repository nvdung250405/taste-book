import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import QueryError from '../ui/QueryError'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'
import { useShoppingListDetail } from '../../hooks/queries/useShoppingListQueries'
import { useSearchIngredients } from '../../hooks/queries/useIngredientQueries'
import IngredientNameInput from '../recipe/IngredientNameInput'
import api from '../../api/shoppingLists.api'
import {
  conflictingUnits,
  customItemPayload,
  isQualitativeUnit,
} from '../../lib/shoppingList'

export default function ShoppingListDetail({ list }) {
  const id = list.shoppingListId
  const client = useQueryClient()
  const ingredientQuery = useSearchIngredients({}, { staleTime: 5 * 60 * 1000 })
  const ingredients = ingredientQuery.data?.DT || []
  const [ingredientId, setIngredientId] = useState(null)
  // A focus/reconnect refetch must not overwrite optimistic checkbox changes.
  const query = useShoppingListDetail(id, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  const pending = useRef(new Set())
  const [pendingIds, setPendingIds] = useState(new Set())
  const addingRef = useRef(false)
  const [adding, setAdding] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState('')
  const nameInput = useRef(null)
  const key = ['shopping-list', id]
  const items = query.data?.DT?.items || []
  const purchased = items.filter((item) => item.isPurchased).length
  const conflicts = conflictingUnits(items)
  const changeIngredient = (_, field, value) => {
    if (field === 'name') {
      setName(value)
      setIngredientId(null)
      return
    }
    const selected = ingredients.find(
      (item) => String(item.ingredientId) === String(value),
    )
    setIngredientId(selected?.ingredientId || null)
    if (selected) {
      setName(selected.ingredientName)
      setUnit(selected.defaultUnit?.unitName || '')
      if (isQualitativeUnit(selected.defaultUnit?.unitName || ''))
        setQuantity('')
    }
  }
  const errorToast = (error) =>
    toast.error(
      error?.EM || error?.message || 'Không thể lưu. Vui lòng thử lại.',
    )
  const toggle = async (item) => {
    if (pending.current.has(item.itemId) || clearing || addingRef.current) return
    pending.current.add(item.itemId)
    setPendingIds(new Set(pending.current))
    await client.cancelQueries({ queryKey: key })
    const patch = (value) =>
      client.setQueryData(key, (old) =>
        old
          ? {
              ...old,
              DT: {
                ...old.DT,
                items: old.DT.items.map((row) =>
                  row.itemId === item.itemId
                    ? { ...row, isPurchased: value }
                    : row,
                ),
              },
            }
          : old,
      )
    patch(!item.isPurchased)
    try {
      await api.toggleItemStatus(id, item.itemId, {
        isPurchased: !item.isPurchased,
      })
    } catch (error) {
      patch(item.isPurchased)
      errorToast(error)
    } finally {
      pending.current.delete(item.itemId)
      setPendingIds(new Set(pending.current))
      if (!pending.current.size) client.invalidateQueries({ queryKey: key })
    }
  }
  const add = async (event) => {
    event.preventDefault()
    if (addingRef.current || adding || clearing || pending.current.size) return
    let data
    try {
      data = customItemPayload(name, quantity, unit)
    } catch (error) {
      errorToast(error)
      return
    }
    if (ingredientId)
      data = {
        ingredientId,
        ...(data.totalQuantity !== undefined
          ? { totalQuantity: data.totalQuantity }
          : {}),
      }
    addingRef.current = true
    setAdding(true)
    try {
      const result = await api.addCustomItem(id, data)
      await client.cancelQueries({ queryKey: key })
      client.setQueryData(key, (old) =>
        old
          ? {
              ...old,
              DT: {
                ...old.DT,
                items: old.DT.items.some(item => item.itemId === result.DT.itemId)
                  ? old.DT.items.map(item => item.itemId === result.DT.itemId ? result.DT : item)
                  : [...old.DT.items, result.DT],
              },
            }
          : old,
      )
      setName('')
      setQuantity('1')
      setUnit('')
      setIngredientId(null)
      nameInput.current?.focus()
      toast.success(
        result.DT.merged
          ? 'Đã cộng số lượng vào nguyên liệu có sẵn'
          : 'Đã thêm nguyên liệu',
      )
    } catch (error) {
      if (ingredientId && error?.EC === 1 && /Tên món phát sinh/.test(error?.EM || '')) {
        toast.error('Chức năng thêm nguyên liệu chuẩn chưa sẵn sàng. Vui lòng thử lại sau.')
      } else errorToast(error)
    } finally {
      addingRef.current = false
      setAdding(false)
      if (!pending.current.size) client.invalidateQueries({ queryKey: key })
    }
  }
  const clear = async () => {
    if (clearing || pending.current.size || addingRef.current) return
    setClearing(true)
    await client.cancelQueries({ queryKey: key })
    const previous = client.getQueryData(key)
    client.setQueryData(key, (old) => ({
      ...old,
      DT: {
        ...old.DT,
        items: old.DT.items.filter((item) => !item.isPurchased),
      },
    }))
    try {
      await api.deletePurchasedItems(id)
      toast.success('Đã xóa các mục đã mua')
      setConfirm(false)
    } catch (error) {
      client.setQueryData(key, previous)
      errorToast(error)
    } finally {
      setClearing(false)
      client.invalidateQueries({ queryKey: key })
    }
  }
  if (query.isLoading)
    return (
      <div role="status" className="flex justify-center p-12">
        <Loader2 className="size-6 animate-spin text-orange-500" />
        <span className="sr-only">Đang tải danh sách</span>
      </div>
    )
  if (query.isError && !query.data)
    return (
      <QueryError title="Không thể tải nguyên liệu" onRetry={query.refetch} />
    )
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-orange-50 p-4 dark:bg-orange-950/20">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-sm font-medium" aria-live="polite">
            Đã mua {purchased}/{items.length} mục
          </span>
          <span role="status" className="text-xs text-slate-500">
            {pendingIds.size || clearing || adding ? 'Đang lưu…' : 'Đã đồng bộ'}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Tiến độ mua sắm"
          aria-valuemin={0}
          aria-valuemax={items.length || 1}
          aria-valuenow={purchased}
          className="h-2 overflow-hidden rounded-full bg-orange-100 dark:bg-slate-800"
        >
          <div
            className="h-full rounded-full bg-orange-500 transition-[width] duration-300 motion-reduce:transition-none"
            style={{
              width: `${items.length ? (purchased / items.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
      {!!conflicts.size && (
        <p
          role="note"
          className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
        >
          <AlertTriangle className="size-5 shrink-0" /> Có nguyên liệu trùng tên
          nhưng khác đơn vị. Các lượng được giữ riêng, không tự cộng hoặc quy
          đổi.
        </p>
      )}
      <div className="space-y-2">
        {!items.length && (
          <p className="py-8 text-center text-sm text-slate-500">
            Danh sách trống. Thêm nguyên liệu cần mua bên dưới.
          </p>
        )}
        {items.map((item) => (
          <label
            key={item.itemId}
            className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors duration-200 motion-reduce:transition-none ${item.isPurchased ? 'border-green-100 bg-green-50 dark:border-green-900 dark:bg-green-950/20' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}
          >
            <input
              type="checkbox"
              checked={item.isPurchased}
              disabled={pendingIds.has(item.itemId) || clearing || adding}
              onChange={() => toggle(item)}
              className="size-6 shrink-0 accent-orange-500"
            />
            <span
              className={`min-w-0 flex-1 break-words text-base transition-colors ${item.isPurchased ? 'text-slate-400 line-through decoration-2' : 'font-medium'}`}
            >
              {item.itemName}
              {conflicts.has(item.itemId) && (
                <span className="mt-1 block text-xs text-amber-700 no-underline dark:text-amber-300">
                  Khác đơn vị
                </span>
              )}
            </span>
            <span className="max-w-[35%] break-words text-right text-sm text-slate-500">
              {item.totalQuantity === 0
                ? ''
                : Number(item.totalQuantity).toLocaleString('vi-VN', {
                    maximumFractionDigits: 6,
                  })}{' '}
              {item.unit}
            </span>
          </label>
        ))}
      </div>
      <form
        noValidate
        onSubmit={add}
        className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
      >
        <h3 className="font-semibold">Thêm nhanh nguyên liệu</h3>
        <label className="block space-y-1 text-sm">
          <span>Tên nguyên liệu</span>
          <IngredientNameInput inputRef={nameInput} row={{ name }} index={0} ingredients={ingredients} onChange={changeIngredient} disabled={adding || clearing} />
        </label>
        {ingredientQuery.isLoading && <p role="status">Đang tải nguyên liệu chuẩn…</p>}
        {ingredientQuery.isError && <QueryError title="Không thể tải nguyên liệu chuẩn" onRetry={ingredientQuery.refetch} />}
        {ingredientId && <div className="text-sm text-emerald-700">Nguyên liệu chuẩn <button type="button" disabled={adding || clearing} onClick={() => setIngredientId(null)} className="ml-2 underline">Dùng tự do</button></div>}
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-sm">
            <span>Số lượng</span>
            <Input
              inputMode="decimal"
              required={!isQualitativeUnit(unit)}
              placeholder={
                isQualitativeUnit(unit) ? 'Có thể bỏ trống' : 'Ví dụ: 1,5'
              }
              value={quantity}
              onChange={(e) => { if (/^\d*(?:[.,]\d*)?$/.test(e.target.value)) setQuantity(e.target.value) }}
              disabled={adding || clearing}
              className="h-11 text-base"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Đơn vị</span>
            <Input
              required
              maxLength={255}
              readOnly={!!ingredientId}
              aria-readonly={!!ingredientId}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="kg, g, hộp…"
              disabled={adding || clearing}
              className="h-11 text-base"
            />
          </label>
        </div>
        <Button
          type="submit"
          disabled={adding || clearing || !!pendingIds.size}
          className="h-11 w-full bg-orange-500 text-white hover:bg-orange-600"
        >
          {adding ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Plus className="mr-2 size-4" />
          )}
          Thêm vào danh sách
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={adding || clearing}
          onClick={() => {
            setName('')
            setQuantity('')
            setUnit('')
            setIngredientId(null)
            nameInput.current?.focus()
          }}
          className="h-11 w-full"
        >
          Đặt lại
        </Button>
      </form>
      <Button
        variant="outline"
        onClick={() => setConfirm(true)}
        disabled={!purchased || !!pendingIds.size || clearing || adding}
        className="min-h-11 w-full text-red-600"
      >
        <Trash2 className="mr-2 size-4" />
        Xóa {purchased} mục đã mua
      </Button>
      <Dialog
        open={confirm}
        onOpenChange={(value) => {
          if (!clearing) setConfirm(value)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa {purchased} mục đã mua?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            Các mục chưa mua sẽ được giữ lại. Thao tác xóa không thể hoàn tác.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={clearing}
              onClick={() => setConfirm(false)}
            >
              Hủy
            </Button>
            <Button
              disabled={clearing}
              onClick={clear}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {clearing ? 'Đang xóa…' : 'Xóa mục đã mua'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
