import { useState } from 'react'
import { Loader2, Plus, Check } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  useShoppingListDetail,
  useToggleItemStatus,
  useAddCustomItem,
} from '../../hooks/queries/useShoppingListQueries'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

export default function ShoppingListDetail({ list }) {
  const listId = list._id || list.id
  const { data: res, isLoading } = useShoppingListDetail(listId)
  const { mutate: toggleItem } = useToggleItemStatus()
  const { mutate: addItem, isPending: addingItem } = useAddCustomItem()

  const [newItemName, setNewItemName] = useState('')
  const [newItemQty, setNewItemQty] = useState('')

  const detail = res?.DT || {}
  const items = detail.items || []
  const checkedCount = items.filter(i => i.isChecked || i.checked || i.status === 'checked').length

  const handleToggle = (itemId) => {
    const item = items.find(i => (i._id || i.id) === itemId)
    const checked = item?.isChecked || item?.checked || item?.status === 'checked'
    toggleItem({ shoppingListId: listId, itemId, data: { isChecked: !checked } }, {
      onError: () => toast.error('Cập nhật thất bại'),
    })
  }

  const handleAddCustom = (e) => {
    e.preventDefault()
    if (!newItemName.trim()) return
    addItem({ shoppingListId: listId, data: { name: newItemName.trim(), quantity: newItemQty || '1', unit: '' } }, {
      onSuccess: () => { setNewItemName(''); setNewItemQty('') },
      onError: () => toast.error('Thêm thất bại'),
    })
  }

  if (isLoading) return <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-orange-400" /></div>

  return (
    <div className="space-y-3">
      {/* Progress */}
      {items.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Tiến độ</span>
            <span className="font-medium text-orange-500">{checkedCount}/{items.length} nguyên liệu</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${items.length ? (checkedCount / items.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Items */}
      {items.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-4">Chưa có nguyên liệu nào.</p>
      ) : (
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {items.map(item => {
            const itemId = item._id || item.id
            const checked = item.isChecked || item.checked || item.status === 'checked'
            return (
              <div
                key={itemId}
                onClick={() => handleToggle(itemId)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all',
                  checked
                    ? 'bg-green-50 dark:bg-green-900/20 opacity-70'
                    : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/10'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                  checked ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-600'
                )}>
                  {checked && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={cn(
                  'text-sm font-medium flex-1',
                  checked ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                )}>
                  {item.ingredient?.name || item.name || 'Nguyên liệu'}
                </span>
                <span className="text-xs text-slate-400">
                  {item.quantity} {item.unit || item.ingredient?.unit || ''}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Add custom item */}
      <form onSubmit={handleAddCustom} className="flex gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        <Input
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Thêm nguyên liệu..."
          className="flex-1 h-9 rounded-lg text-sm"
        />
        <Input
          value={newItemQty}
          onChange={(e) => setNewItemQty(e.target.value)}
          placeholder="SL"
          className="w-16 h-9 rounded-lg text-sm"
        />
        <Button type="submit" size="sm" className="h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-lg" disabled={addingItem}>
          <Plus className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
