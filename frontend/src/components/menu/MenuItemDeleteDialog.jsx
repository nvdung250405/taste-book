import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'

export default function MenuItemDeleteDialog({
  item,
  pending,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog
      open={!!item}
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <DialogContent
        showCloseButton={!pending}
        onEscapeKeyDown={(event) => {
          if (pending) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (pending) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>Xóa món khỏi thực đơn?</DialogTitle>
          <DialogDescription>
            Bạn muốn bỏ “{item?.title}” khỏi thực đơn này? Công thức gốc vẫn
            được giữ lại.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {pending ? 'Đang xóa…' : 'Xác nhận xóa món'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
