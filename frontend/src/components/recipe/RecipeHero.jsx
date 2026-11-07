import { Heart, Share2 } from 'lucide-react'
import { toast } from 'sonner'

import { recipeImageProps, handleRecipeImageError } from '../../lib/recipeImages'

export default function RecipeHero({ recipe, isFavorited, handleFavorite, disabledBtn }) {
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Đã sao chép link!')
    } catch { toast.error('Không thể sao chép link. Vui lòng sao chép từ thanh địa chỉ.') }
  }

  const rawUrl = recipe.thumbnailUrl || recipe.thumbnail || recipe.image || '';

  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-video rounded-3xl overflow-hidden mb-8 shadow-sm border border-slate-100 dark:border-slate-800">
      <img
        {...recipeImageProps(rawUrl, '(min-width: 1024px) 650px, calc(100vw - 64px)')}
        decoding="async" onError={handleRecipeImageError}
        alt={recipe.title}
        fetchPriority="high"
        loading="eager"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-50" />

      {/* Action buttons overlay */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={handleFavorite}
          disabled={disabledBtn}
          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow transition-all ${
            isFavorited
              ? 'bg-red-500 text-white'
              : 'bg-white/90 hover:bg-white text-slate-600 hover:text-red-500'
          }`}
          aria-label={isFavorited ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-white' : ''}`} />
        </button>
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-orange-500 flex items-center justify-center backdrop-blur-md shadow transition-all"
          aria-label="Chia sẻ công thức"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
