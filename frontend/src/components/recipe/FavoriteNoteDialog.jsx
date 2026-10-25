import { MessageSquare, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'

export default function FavoriteNoteDialog({
  value,
  pending,
  onClose,
  onChange,
  onSave,
}) {
  return (
    <Dialog open={!!value} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-orange-500" /> Ghi chú cho
            món ăn
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
            Ghi chú cá nhân (chỉ bạn nhìn thấy)
          </label>
          <textarea
            placeholder="Ví dụ: Giảm đường khi kho, cho nhiều tiêu hơn, công thức ngon nấu vào dịp cuối tuần..."
            value={value?.note || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-h-[120px] rounded-xl resize-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onClose()}
            className="rounded-xl"
          >
            Hủy
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
            onClick={onSave}
            disabled={pending}
          >
            {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Lưu ghi chú
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
