import { useId, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog'
import { useCreateCategory, useUpdateCategory } from '../../hooks/queries/useCategoryQueries'

export default function CategoryFormDialog({ category, onClose, onCreated }) {
  const [name, setName] = useState(category?.categoryName || '')
  const [error, setError] = useState('')
  const inputId = useId()
  const create = useCreateCategory()
  const update = useUpdateCategory()
  const pending = create.isPending || update.isPending

  const submit = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (pending) return
    const categoryName = name.trim()
    if (!categoryName) { setError('Vui lòng nhập tên danh mục.'); return }
    setError('')
    const options = {
      onSuccess: (response) => {
        toast.success(category ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục cá nhân')
        if (!category) onCreated?.(response.DT)
        onClose()
      },
      onError: (failure) => setError(failure?.EM || 'Không thể lưu danh mục. Vui lòng thử lại.'),
    }
    if (category) update.mutate({ categoryId: category.categoryId, data: { categoryName } }, options)
    else create.mutate({ categoryName }, options)
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !pending) onClose() }}>
      <DialogContent showCloseButton={!pending} onEscapeKeyDown={(e) => { if (pending) e.preventDefault() }} onInteractOutside={(e) => { if (pending) e.preventDefault() }}>
        <DialogHeader>
          <DialogTitle>{category ? 'Sửa danh mục' : 'Tạo danh mục cá nhân'}</DialogTitle>
          <DialogDescription>Danh mục này chỉ dành cho tài khoản của bạn.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <label htmlFor={inputId} className="block text-sm font-medium">Tên danh mục</label>
          <Input id={inputId} autoFocus value={name} onChange={(e) => { setName(e.target.value); setError('') }} maxLength={255} disabled={pending} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : undefined} placeholder="VD: Món gia đình, Bữa sáng nhanh…" />
          {error && <p id={`${inputId}-error`} role="alert" className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>Hủy</Button>
            <Button type="submit" disabled={pending} className="bg-orange-500 hover:bg-orange-600">{pending ? 'Đang lưu…' : 'Lưu danh mục'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
