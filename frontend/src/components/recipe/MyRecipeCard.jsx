import { Link } from 'react-router-dom'
import {
  Pencil,
  Trash2,
  ChefHat,
  Clock,
  CheckCircle2,
  Clock3,
  XCircle,
  Lock,
  Eye,
  AlertCircle,
  Users,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import {
  recipeImageProps,
  handleRecipeImageError,
} from '../../lib/recipeImages'

const STATUS_CONFIG = {
  approved: {
    key: 'approved',
    label: 'Đã duyệt',
    icon: CheckCircle2,
    badgeCls:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    dotCls: 'bg-emerald-500',
  },
  pending: {
    key: 'pending',
    label: 'Chờ duyệt',
    icon: Clock3,
    badgeCls:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    dotCls: 'bg-amber-500',
  },
  rejected: {
    key: 'rejected',
    label: 'Bị từ chối',
    icon: XCircle,
    badgeCls:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    dotCls: 'bg-rose-500',
  },
  draft: {
    key: 'draft',
    label: 'Riêng tư / Nháp',
    icon: Lock,
    badgeCls:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dotCls: 'bg-slate-500',
  },
}

export default function MyRecipeCard({ recipe, index, gridColumns, onDelete }) {
  // Xác định trạng thái của từng công thức
  const getRecipeStatusKey = (recipe) => {
    if (!recipe.isPublic) return 'draft'
    const status = (recipe.approvalStatus || '').toLowerCase()
    if (status === 'approved') return 'approved'
    if (status === 'pending') return 'pending'
    if (status === 'rejected') return 'rejected'
    return 'draft'
  }

  const statusKey = getRecipeStatusKey(recipe)
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.draft
  const StatusIcon = status.icon
  const rId = recipe.recipeId || recipe.id || recipe._id
  const isApproved =
    recipe.isPublic &&
    (recipe.approvalStatus || '').toLowerCase() === 'approved'
  const isRejected = (recipe.approvalStatus || '').toLowerCase() === 'rejected'

  return (
    <Card
      key={rId}
      className="overflow-hidden group hover:shadow-xl hover:-translate-y-0.5 transition-[transform,box-shadow] duration-300 motion-reduce:transition-none border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col rounded-2xl"
    >
      {/* Ảnh cover & Badges */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Link
          to={isApproved ? `/recipe/${rId}` : `/recipe/${rId}/edit`}
          className="block w-full h-full"
        >
          <img
            {...recipeImageProps(
              recipe.thumbnailUrl || recipe.thumbnail || recipe.image,
            )}
            loading={index < gridColumns ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            decoding="async"
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 motion-reduce:transition-none"
            onError={handleRecipeImageError}
          />
        </Link>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border ${status.badgeCls}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </span>

          {!recipe.isPublic && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm bg-slate-900/80 text-white backdrop-blur-md">
              <Lock className="w-3 h-3" /> Riêng tư
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="p-4 sm:p-5 flex flex-col flex-1">
        <h2 className="font-bold text-slate-900 dark:text-slate-50 line-clamp-2 mb-2 text-base sm:text-lg group-hover:text-orange-500 transition-colors">
          <Link
            to={isApproved ? `/recipe/${rId}` : `/recipe/${rId}/edit`}
            className="hover:underline"
          >
            {recipe.title}
          </Link>
        </h2>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {recipe.cookTimeMinutes || recipe.prepTime || recipe.time || '30'}
              p
            </span>
          </div>

          <div className="flex items-center gap-1">
            <ChefHat className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {recipe.difficulty === 'Easy'
                ? 'Dễ'
                : recipe.difficulty === 'Hard'
                  ? 'Khó'
                  : 'Trung bình'}
            </span>
          </div>

          {recipe.defaultServings && (
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{recipe.defaultServings} người</span>
            </div>
          )}
        </div>

        {/* Cảnh báo lý do từ chối nếu có */}
        {isRejected && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs">
            <div className="flex items-start gap-1.5 text-rose-700 dark:text-rose-400 font-semibold mb-1">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>Lý do từ chối:</span>
            </div>
            <p className="text-rose-600/90 dark:text-rose-300/90 pl-5">
              {recipe.rejectionReason ||
                'Công thức chưa đáp ứng tiêu chuẩn cộng đồng về nội dung hoặc hình ảnh minh họa.'}
            </p>
            <div className="mt-2 pl-5">
              <Link
                to={`/recipe/${rId}/edit`}
                className="inline-flex items-center text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:underline"
              >
                Sửa công thức để gửi duyệt lại →
              </Link>
            </div>
          </div>
        )}

        {/* Action buttons (Sửa / Xóa / Xem) */}
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
          {isApproved && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium px-2.5"
              asChild
              title="Xem trang công thức"
            >
              <Link to={`/recipe/${rId}`}>
                <Eye className="w-3.5 h-3.5 mr-1" /> Xem
              </Link>
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            className="flex-1 rounded-xl hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 dark:hover:bg-orange-950/30 text-xs font-medium"
            asChild
          >
            <Link to={`/recipe/${rId}/edit`}>
              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Sửa
            </Link>
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="flex-1 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-xs font-medium"
            onClick={() => onDelete(recipe)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Xóa
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
