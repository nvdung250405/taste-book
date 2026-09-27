import { Heart, Share2 } from 'lucide-react'
import { toast } from 'sonner'

function getOptimizedImageUrl(url, width = 1200) {
  const FALLBACK = `https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=${width}&auto=format&fit=crop`;
  if (!url) return FALLBACK;
  if (url.includes('res.cloudinary.com')) {
    if (url.includes('/upload/') && !url.includes('/upload/c_')) {
      return url.replace('/upload/', `/upload/c_limit,w_${width},q_auto,f_auto/`);
    }
  } else if (url.includes('images.unsplash.com') && !url.includes('w=')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}q=80&w=${width}&auto=format&fit=crop`;
  }
  return url;
}

export default function RecipeHero({ recipe, isFavorited, handleFavorite, disabledBtn }) {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Đã sao chép link!')
  }

  const rawUrl = recipe.thumbnailUrl || recipe.thumbnail || recipe.image || '';
  const src600 = getOptimizedImageUrl(rawUrl, 600);
  const src1200 = getOptimizedImageUrl(rawUrl, 1200);

  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-video rounded-3xl overflow-hidden mb-8 shadow-sm border border-slate-100 dark:border-slate-800">
      <img
        src={src1200}
        srcSet={`${src600} 600w, ${src1200} 1200w`}
        sizes="(max-width: 640px) 100vw, 1200px"
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
