import { Heart, Share2 } from 'lucide-react'
import { toast } from 'sonner'

<<<<<<< Updated upstream
const DIFFICULTY_STYLES = {
  'Easy': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'Hard': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

const DIFFICULTY_TEXT = {
  'Easy': 'Dễ',
  'Medium': 'Trung bình',
  'Hard': 'Khó',
}

export default function RecipeHero({ recipe, tags, isFavorited, handleFavorite, disabledBtn }) {
=======
export default function RecipeHero({ recipe, isFavorited, handleFavorite, disabledBtn }) {
>>>>>>> Stashed changes
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Đã sao chép link!')
  }

  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-video rounded-3xl overflow-hidden mb-8 shadow-sm border border-slate-100 dark:border-slate-800">
      <img
        src={recipe.thumbnailUrl || recipe.thumbnail || recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=1200&auto=format&fit=crop'}
        alt={recipe.title}
        className="w-full h-full object-cover"
      />
<<<<<<< Updated upstream
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
            {DIFFICULTY_TEXT[recipe.difficulty] || recipe.difficulty}
          </span>
        )}
      </div>
=======
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-50" />
>>>>>>> Stashed changes

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
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-white' : ''}`} />
        </button>
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-orange-500 flex items-center justify-center backdrop-blur-md shadow transition-all"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
