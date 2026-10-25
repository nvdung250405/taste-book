import { Link } from 'react-router-dom'
import {
  Heart,
  Star,
  Clock,
  ChefHat,
  Trash2,
  MessageSquare,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import {
  recipeImageProps,
  handleRecipeImageError,
} from '../../lib/recipeImages'

export default function FavoriteRecipeCard({
  fav,
  index,
  gridColumns,
  removingIds,
  onRemove,
  onEditNote,
}) {
  const recipe = fav.recipe || fav
  const recipeId = recipe.id || recipe._id || fav.recipeId
  const isRemoving = removingIds.has(String(recipeId))
  const noteText = fav.personalNotes || fav.note

  return (
    <Card
      key={fav.id || recipeId}
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-[transform,box-shadow,opacity] duration-300 motion-reduce:transition-none hover:shadow-xl hover:-translate-y-1 flex flex-col ${
        isRemoving ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Image Cover */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Link to={`/recipe/${recipeId}`} className="block w-full h-full">
          <img
            {...recipeImageProps(
              recipe.thumbnailUrl || recipe.thumbnail || recipe.image,
            )}
            sizes="(min-width: 1536px) 350px, (min-width: 1280px) 285px, (min-width: 1024px) 305px, (min-width: 768px) 340px, (min-width: 640px) 276px, calc(100vw - 96px)"
            loading={index < gridColumns ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            decoding="async"
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={handleRecipeImageError}
          />
        </Link>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Nút Tim HỦY LƯU NHANH TRỰC TIẾP */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onEditNote({ recipeId, note: noteText || '' })
            }}
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-sm hover:shadow flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-all hover:scale-110 active:scale-95"
            title="Ghi chú cá nhân"
            aria-label="Thêm hoặc sửa ghi chú cá nhân"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRemove(recipeId, recipe.title)
            }}
            className="group/btn w-8 h-8 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow hover:shadow-md flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all hover:scale-110 active:scale-90"
            title="Bỏ lưu khỏi yêu thích"
            aria-label="Bỏ lưu khỏi yêu thích"
          >
            <Heart className="w-4 h-4 fill-red-500 text-red-500 transition-transform group-hover/btn:scale-110" />
          </button>
        </div>

        {/* Difficulty Badge */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-md shadow-sm">
            {recipe.difficulty === 'Easy'
              ? 'Dễ'
              : recipe.difficulty === 'Hard'
                ? 'Khó'
                : 'Trung bình'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="p-4 flex flex-col flex-1">
        <h2 className="font-bold text-slate-900 dark:text-slate-50 line-clamp-2 text-base group-hover:text-orange-500 transition-colors mb-2">
          <Link to={`/recipe/${recipeId}`} className="hover:underline">
            {recipe.title}
          </Link>
        </h2>

        {/* Personal note if exists */}
        {noteText ? (
          <div
            onClick={() => onEditNote({ recipeId, note: noteText })}
            className="cursor-pointer text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2 mb-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 p-2 rounded-xl hover:border-amber-400 transition-colors"
            title="Nhấn để sửa ghi chú"
          >
            💬 "{noteText}"
          </div>
        ) : (
          <div className="mb-2" />
        )}

        {/* Recipe Meta Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1 font-medium text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{recipe.rating || '4.8'}</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {recipe.cookTimeMinutes || recipe.prepTime || recipe.time || '30'}
              p
            </span>
          </div>

          <div
            className="flex items-center gap-1 max-w-[100px] truncate"
            title={
              recipe.author?.name ||
              recipe.author?.username ||
              recipe.user?.name ||
              'Chef'
            }
          >
            <ChefHat className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {recipe.author?.name ||
                recipe.author?.username ||
                recipe.user?.name ||
                'Đầu bếp'}
            </span>
          </div>
        </div>

        {/* Quick Remove Action Button */}
        <div className="mt-3 pt-2 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(recipeId, recipe.title)}
            className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg py-1.5 h-auto transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hủy lưu món này
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
