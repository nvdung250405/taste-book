import { Heart, Share2 } from 'lucide-react'
import { Badge } from '../ui/badge'
import { toast } from 'sonner'

const DIFFICULTY_STYLES = {
  'Dễ': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Trung bình': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'Khó': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

export default function RecipeHero({ recipe, tags, isFavorited, handleFavorite, disabledBtn }) {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Đã sao chép link!')
  }

  return (
    <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-lg">
      <img
        src={recipe.thumbnail || recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=1200&auto=format&fit=crop'}
        alt={recipe.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Tags overlay */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
        {tags.slice(0, 3).map(tag => (
          <Badge key={tag.id || tag.name || tag} className="bg-black/60 text-white border-none backdrop-blur-sm">
            {tag.name || tag}
          </Badge>
        ))}
        {recipe.difficulty && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DIFFICULTY_STYLES[recipe.difficulty] || 'bg-slate-100 text-slate-600'}`}>
            {recipe.difficulty}
          </span>
        )}
      </div>

      {/* Action buttons overlay */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={handleFavorite}
          disabled={disabledBtn}
          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow transition-all ${
            isFavorited
              ? 'bg-red-500 text-white'
              : 'bg-white/80 hover:bg-white text-slate-600 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-white' : ''}`} />
        </button>
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-orange-500 flex items-center justify-center backdrop-blur-md shadow transition-all"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Title on image */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg leading-tight">{recipe.title}</h1>
      </div>
    </div>
  )
}
