import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRecipeLists } from '../../hooks/queries/useRecipeListQueries'
import api from '../../api/recipeLists.api'
import { MEALS, dateKey } from '../../lib/weeklyMenu'
import {
  ensureMealList,
  isWeeklyList,
  validServings,
} from '../../lib/menuLists'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import QueryError from '../ui/QueryError'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'

export default function AddToMenuDialog({ recipeId, servings, onClose }) {
  const query = useRecipeLists()
  const client = useQueryClient()
  const sending = useRef(false)
  const [type, setType] = useState('weekly')
  const [date, setDate] = useState(() => dateKey(new Date()))
  const [meal, setMeal] = useState('0')
  const [listId, setListId] = useState('')
  const [portion, setPortion] = useState(String(servings))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const lists = Array.isArray(query.data?.DT) ? query.data.DT : []
  const custom = lists.filter((list) => !isWeeklyList(list))
  const submit = async (event) => {
    event.preventDefault()
    if (sending.current) return
    setError('')
    if (!validServings(portion)) {
      setError('Khẩu phần phải là số nguyên từ 1 đến 2147483647.')
      return
    }
    if (!query.isSuccess) {
      setError('Vui lòng tải danh sách thực đơn trước khi thêm món.')
      return
    }
    let list = custom.find((row) => String(row.recipeListId) === listId)
    const parsedDate = new Date(`${date}T12:00:00`)
    if (
      type === 'weekly' &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        Number.isNaN(parsedDate.getTime()) ||
        dateKey(parsedDate) !== date ||
        !['0', '1', '2'].includes(meal))
    ) {
      setError('Vui lòng chọn ngày và bữa ăn hợp lệ.')
      return
    }
    if (type === 'custom' && !list) {
      setError('Vui lòng chọn thực đơn có sẵn.')
      return
    }
    sending.current = true
    setBusy(true)
    try {
      if (type === 'weekly')
        list = await ensureMealList(api, lists, parsedDate, Number(meal))
      await api.addRecipeToMenu(list.recipeListId, {
        recipeId: Number(recipeId),
        targetServings: Number(portion),
      })
      client.invalidateQueries({ queryKey: ['recipe-list', list.recipeListId] })
      toast.success('Đã thêm món vào thực đơn')
      onClose()
    } catch (failure) {
      setError(failure?.EM || 'Không thể thêm món. Vui lòng thử lại.')
    } finally {
      sending.current = false
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
        className="max-h-[90dvh] overflow-y-auto rounded-2xl"
        showCloseButton={!busy}
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (busy) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>Thêm vào thực đơn</DialogTitle>
          <DialogDescription>
            Chọn bữa ăn trong lịch tuần hoặc một thực đơn bạn đã tạo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-4">
          <fieldset disabled={busy} className="space-y-4">
            <legend className="sr-only">Vị trí thêm món</legend>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="menu-target"
                  checked={type === 'weekly'}
                  onChange={() => {
                    setType('weekly')
                    setError('')
                  }}
                />
                Lịch tuần
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="menu-target"
                  checked={type === 'custom'}
                  onChange={() => {
                    setType('custom')
                    setError('')
                  }}
                />
                Thực đơn của tôi
              </label>
            </div>
            {type === 'weekly' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                  Ngày
                  <Input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </label>
                <div className="space-y-2 text-sm">
                  <label htmlFor="menu-meal">Bữa</label>
                  <select
                    id="menu-meal"
                    value={meal}
                    onChange={(event) => setMeal(event.target.value)}
                    className="h-9 w-full rounded-md border bg-background px-3"
                  >
                    {MEALS.map((name, index) => (
                      <option key={name} value={index}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="block space-y-2 text-sm">
                <label htmlFor="menu-list">Chọn thực đơn</label>
                <select
                  id="menu-list"
                  value={listId}
                  onChange={(event) => setListId(event.target.value)}
                  className="h-10 w-full rounded-lg border bg-background px-3"
                >
                  <option value="">Chọn thực đơn…</option>
                  {custom.map((list) => (
                    <option key={list.recipeListId} value={list.recipeListId}>
                      {list.listName}
                    </option>
                  ))}
                </select>
                {query.isSuccess && !custom.length && (
                  <span className="block text-slate-500">
                    Chưa có thực đơn tùy biến. Hãy tạo tại trang Thực đơn hoặc
                    chọn Lịch tuần.
                  </span>
                )}
              </div>
            )}
            <label className="block space-y-2 text-sm">
              Số khẩu phần
              <Input
                type="number"
                min="1"
                max="2147483647"
                value={portion}
                onChange={(event) => setPortion(event.target.value)}
              />
            </label>
          </fieldset>
          {query.isPending && <p role="status">Đang tải thực đơn…</p>}
          {query.isError && (
            <QueryError
              title="Không thể tải thực đơn"
              onRetry={query.refetch}
              isRetrying={query.isFetching}
            />
          )}
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button
              disabled={
                busy ||
                !query.isSuccess ||
                (type === 'custom' && !custom.length)
              }
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {busy ? 'Đang thêm…' : 'Thêm món'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
