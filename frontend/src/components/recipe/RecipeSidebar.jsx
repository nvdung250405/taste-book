import { Link } from 'react-router-dom'
import { Heart, BookMarked, ShoppingCart } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'

export default function RecipeSidebar({ author, recipe, tags, isFavorited, handleFavorite, disabledBtn }) {
  return (
    <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      {/* Author card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-3 text-sm uppercase tracking-wide">Tác giả</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg uppercase shrink-0">
              {(author.name || 'C').charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-50">{author.name || 'TasteBook Chef'}</p>
              <p className="text-xs text-slate-500">{author.email || ''}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="space-y-2">
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-2"
          onClick={handleFavorite}
          disabled={disabledBtn}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white' : ''}`} />
          {isFavorited ? 'Đã thêm yêu thích' : 'Thêm vào yêu thích'}
        </Button>
        <Button variant="outline" className="w-full rounded-xl gap-2" asChild>
          <Link to="/menu">
            <BookMarked className="w-4 h-4" />
            Thêm vào thực đơn
          </Link>
        </Button>
        <Button variant="outline" className="w-full rounded-xl gap-2" asChild>
          <Link to="/shopping-list">
            <ShoppingCart className="w-4 h-4" />
            Thêm vào đi chợ
          </Link>
        </Button>
      </div>

      {/* Nutrition (if available) */}
      {recipe.nutrition && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-3 text-sm uppercase tracking-wide">Dinh dưỡng / khẩu phần</h3>
            <div className="space-y-2">
              {Object.entries(recipe.nutrition).map(([key, val]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-slate-500 capitalize">{key}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{val}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-3 text-sm uppercase tracking-wide">Thẻ</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag.id || tag.name || tag} variant="secondary" className="rounded-full">
                  {tag.name || tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
