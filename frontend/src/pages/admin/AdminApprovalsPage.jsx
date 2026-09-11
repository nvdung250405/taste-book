import { useState } from 'react'
import {
  BookOpenCheck,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Clock,
  User,
  AlertCircle
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { 
  usePendingRecipes, 
  useModerateRecipe 
} from '../../hooks/queries/useRecipeQueries'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'

export default function AdminApprovalsPage() {
  const { data: pendingRes, isLoading } = usePendingRecipes()
  const { mutate: moderateRecipe, isPending: isModerating } = useModerateRecipe()

  const pendingRecipes = pendingRes?.DT || []

  const handleModerate = (recipeId, status) => {
    if (status === 'REJECTED') {
      const reason = window.prompt('Nhập lý do từ chối (Tùy chọn):')
      if (reason === null) return // User cancelled
      
      moderateRecipe({ recipeId, data: { approvalStatus: 'REJECTED', rejectionReason: reason } }, {
        onSuccess: () => toast.success('Đã từ chối công thức'),
        onError: () => toast.error('Có lỗi xảy ra')
      })
    } else {
      moderateRecipe({ recipeId, data: { approvalStatus: 'APPROVED' } }, {
        onSuccess: () => toast.success('Đã duyệt công thức thành công'),
        onError: () => toast.error('Có lỗi xảy ra')
      })
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-orange-500" />
            Kiểm duyệt công thức
          </h1>
          <p className="text-slate-500 mt-1">Quản lý và phê duyệt các công thức do người dùng đóng góp.</p>
        </div>
        <Badge variant="secondary" className="px-4 py-1.5 text-sm">
          <span className="font-bold text-orange-500 mr-1">{pendingRecipes.length}</span> chờ duyệt
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          <p className="text-slate-500">Đang tải danh sách chờ duyệt...</p>
        </div>
      ) : pendingRecipes.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Không có công thức nào chờ duyệt</h3>
            <p className="text-slate-500">Tất cả các công thức đóng góp đã được xử lý xong.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingRecipes.map((recipe) => (
            <Card key={recipe._id || recipe.id} className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                <img 
                  src={recipe.thumbnail || recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=600&auto=format&fit=crop'} 
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none shadow-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Chờ duyệt
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-50 line-clamp-1 mb-2">
                  {recipe.title}
                </h3>
                
                <div className="flex flex-col gap-2 mt-auto text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">Bởi: <span className="font-medium text-slate-700 dark:text-slate-300">{recipe.author?.name || 'Ẩn danh'}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Thời gian nấu: {recipe.prepTime || recipe.time || '—'}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 mt-5 pt-4 grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    className="col-span-1 rounded-xl text-slate-500 hover:text-blue-500 hover:bg-blue-50"
                    asChild
                  >
                    <Link to={`/recipe/${recipe._id || recipe.id}`} target="_blank">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline"
                    className="col-span-1 rounded-xl text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                    onClick={() => handleModerate(recipe._id || recipe.id, 'REJECTED')}
                    disabled={isModerating}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                  <Button 
                    className="col-span-1 rounded-xl bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => handleModerate(recipe._id || recipe.id, 'APPROVED')}
                    disabled={isModerating}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
