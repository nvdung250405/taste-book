import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Star,
  Clock,
  ChefHat,
  Heart,
  Loader2
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'

export default function FeaturedRecipesSection({ recipes, loadingRecipes }) {
  return (
    <section className="container mx-auto px-4 mt-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Công thức nổi bật</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Những công thức được yêu thích nhất hôm nay</p>
        </div>
        <Button variant="ghost" className="hidden sm:flex text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/50">
          Xem tất cả <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {loadingRecipes ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-12 text-slate-500">Chưa có công thức nào.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.slice(0, 6).map((recipe) => (
            <Card key={recipe._id || recipe.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              {/* Recipe Image with overlay */}
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={recipe.thumbnail || recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800&auto=format&fit=crop'} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {(recipe.tags || ['Mới']).slice(0,2).map(tag => (
                    <Badge key={tag.id || tag.name || tag} className="bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border-none">
                      {tag.name || tag}
                    </Badge>
                  ))}
                </div>
                <div className="absolute top-4 right-4">
                  <Button size="icon" variant="secondary" className="rounded-full w-8 h-8 bg-white/80 hover:bg-white text-slate-700 backdrop-blur-sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-orange-500">
                    <Star className="w-4 h-4 fill-orange-500" />
                    <span className="font-semibold">{recipe.rating || '4.5'}</span>
                    <span className="text-slate-400 text-sm">({recipe.reviews || 0})</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {recipe.prepTime || recipe.time || '30p'}
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat className="w-4 h-4" /> {recipe.difficulty || 'Dễ'}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2 line-clamp-1 group-hover:text-orange-500 transition-colors">
                  <Link to={`/recipe/${recipe._id || recipe.id}`}>{recipe.title}</Link>
                </h3>
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs uppercase">
                    {(recipe.author?.name || recipe.user?.name || 'Chef').charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300 line-clamp-1">
                    {recipe.author?.name || recipe.user?.name || 'TasteBook Chef'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
