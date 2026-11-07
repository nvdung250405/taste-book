import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'

export default function RecipeDeleteDialog({
  recipe,
  pending,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog open={!!recipe} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-2">
            <Trash2 className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">
            Xác nhận xóa công thức
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-slate-600 dark:text-slate-300 py-1">
          Bạn có chắc chắn muốn xóa công thức{' '}
          <span className="font-bold text-slate-900 dark:text-slate-100">
            "{recipe?.title}"
          </span>
          ?
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Hành động này sẽ xóa vĩnh viễn dữ liệu công thức, nguyên liệu và các
            bước hướng dẫn. Không thể hoàn tác.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            onClick={() => onClose()}
            disabled={pending}
            className="rounded-xl"
          >
            Hủy bỏ
          </Button>
          <Button
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-1.5" />
            )}
            Xác nhận xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
