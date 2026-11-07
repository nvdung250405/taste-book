import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '../../api/recipeLists.api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'

export default function DuplicatePortionDialog({
  duplicate,
  onClose,
  onUpdated,
}) {
  const client = useQueryClient()
  const sending = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const update = async () => {
    if (sending.current) return
    sending.current = true
    setBusy(true)
    setError('')
    try {
      await api.updateRecipePortion(
        duplicate.listId,
        duplicate.recipeListItemId,
        { targetServings: duplicate.newServings },
      )
      await Promise.all([
        client.invalidateQueries({
          queryKey: ['recipe-list', duplicate.listId],
        }),
        client.invalidateQueries({ queryKey: ['recipe-lists'] }),
      ])
      toast.success('Cập nhật khẩu phần thành công')
      onUpdated()
    } catch (failure) {
      setError(failure?.EM || 'Không thể cập nhật khẩu phần. Vui lòng thử lại.')
    } finally {
      sending.current = false
      setBusy(false)
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
        onEscapeKeyDown={(e) => {
          if (busy) e.preventDefault()
        }}
        onInteractOutside={(e) => {
          if (busy) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>Cập nhật khẩu phần?</DialogTitle>
          <DialogDescription>
            Món ăn này đã có trong thực đơn với khẩu phần{' '}
            {duplicate.currentServings}. Bạn có muốn cập nhật sang khẩu phần mới{' '}
            {duplicate.newServings} không?
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Hủy
          </Button>
          <Button disabled={busy} onClick={update}>
            {busy ? 'Đang cập nhật…' : 'Cập nhật khẩu phần'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
