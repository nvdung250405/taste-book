import { useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  useCreateRecipeList,
  useUpdateRecipeList,
} from '../../hooks/queries/useRecipeListQueries'
import { menuNameError } from '../../lib/menuLists'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export default function MenuNameDialog({ list, lists, onClose, onSaved }) {
  const [name, setName] = useState(list?.listName || '')
  const [error, setError] = useState('')
  const create = useCreateRecipeList()
  const update = useUpdateRecipeList()
  const sending = useRef(false)
  const busy = create.isPending || update.isPending
  const submit = async (event) => {
    event.preventDefault()
    if (sending.current) return
    const message = menuNameError(name, lists, list?.recipeListId)
    setError(message)
    if (message) return
    sending.current = true
    try {
      const data = { listName: name.trim() }
      const response = list
        ? await update.mutateAsync({ listId: list.recipeListId, data })
        : await create.mutateAsync(data)
      toast.success(list ? 'Đã đổi tên thực đơn' : 'Đã tạo thực đơn')
      onSaved(response.DT)
    } catch (failure) {
      setError(failure?.EM || 'Không thể lưu thực đơn. Vui lòng thử lại.')
    } finally {
      sending.current = false
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
        showCloseButton={!busy}
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (busy) event.preventDefault()
        }}
        className="rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle>
            {list ? 'Đổi tên thực đơn' : 'Tạo thực đơn mới'}
          </DialogTitle>
          <DialogDescription>
            Đặt tên cho thực đơn của riêng bạn, tối đa 100 ký tự.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <label htmlFor="menu-name" className="text-sm font-medium">
            Tên thực đơn
          </label>
          <Input
            id="menu-name"
            autoFocus
            value={name}
            maxLength={100}
            disabled={busy}
            aria-invalid={!!error}
            aria-describedby={error ? 'menu-name-error' : undefined}
            onChange={(event) => {
              setName(event.target.value)
              setError('')
            }}
            placeholder="VD: Thực đơn tiệc cuối tuần"
          />
          {error && (
            <p
              id="menu-name-error"
              role="alert"
              className="text-sm text-red-600"
            >
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
              disabled={busy}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {busy ? 'Đang lưu…' : 'Lưu thực đơn'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
