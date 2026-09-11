import { Loader2, Trash2, Clock, Users } from 'lucide-react'
import { useRecipeListItems, useRemoveRecipeFromMenu } from '../../hooks/queries/useRecipeListQueries'
import { toast } from 'sonner'

export default function RecipeListDetail({ list }) {
  const { data: res, isLoading } = useRecipeListItems(list._id || list.id)
  const { mutate: removeRecipe, isPending: removing } = useRemoveRecipeFromMenu()
  const items = res?.DT?.items || res?.DT || []

  return (
    <div className="mt-4">
      {isLoading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-orange-400" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-sm">Thực đơn này chưa có món nào.</div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item._id || item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors group">
              <img
                src={item.recipe?.thumbnail || item.recipe?.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=100&auto=format&fit=crop'}
                alt={item.recipe?.title}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{item.recipe?.title || 'Chưa đặt tên'}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <Users className="w-3 h-3" />
                  <span>{item.portions || item.servings || 1} phần ăn</span>
                  {item.recipe?.prepTime && (
                    <>
                      <span>·</span>
                      <Clock className="w-3 h-3" />
                      <span>{item.recipe.prepTime}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeRecipe({ listId: list._id || list.id, itemId: item._id || item.id }, {
                  onSuccess: () => toast.success('Đã xóa món khỏi thực đơn'),
                  onError: () => toast.error('Xóa thất bại'),
                })}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                disabled={removing}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
