
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Loader2
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import {
  useAdminCategories,
  useCreateAdminCategory,
  useUpdateAdminCategory,
  useDeleteAdminCategory
} from '../../hooks/queries/useCategoryQueries'
import { toast } from 'sonner'
import QueryError from '../../components/ui/QueryError'

export default function AdminCategoriesPage() {
  const { data: categoriesRes, isLoading, isError, isFetching, refetch } = useAdminCategories()
  const { mutate: createCat, isPending: creating } = useCreateAdminCategory()
  const { mutate: updateCat, isPending: updating } = useUpdateAdminCategory()
  const { mutate: deleteCat, isPending: deleting } = useDeleteAdminCategory()

  const categories = categoriesRes?.DT || []

  const handleCreate = () => {
    const name = window.prompt('Nhập tên danh mục mới:')
    if (!name?.trim()) return

    createCat({ categoryName: name.trim() }, {
      onSuccess: () => toast.success('Thêm danh mục thành công'),
      onError: (error) => toast.error(error?.EM || 'Có lỗi xảy ra')
    })
  }

  const handleEdit = (cat) => {
    const name = window.prompt('Tên danh mục:', cat.categoryName)
    if (name === null) return // cancelled
    if (!name.trim()) return toast.error('Tên không hợp lệ')
    

    updateCat({ categoryId: cat.categoryId, data: { categoryName: name.trim() } }, {
      onSuccess: () => toast.success('Cập nhật thành công'),
      onError: (error) => toast.error(error?.EM || 'Có lỗi xảy ra')
    })
  }

  const handleDelete = (catId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Các công thức thuộc danh mục có thể bị ảnh hưởng.')) {
      deleteCat(catId, {
        onSuccess: () => toast.success('Đã xóa danh mục'),
        onError: (error) => toast.error(error?.EM || 'Có lỗi xảy ra')
      })
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Tags className="w-6 h-6 text-orange-500" />
            Quản lý danh mục
          </h1>
          <p className="text-slate-500 mt-1">Quản lý các chuyên mục ẩm thực trên hệ thống.</p>
        </div>
        <Button onClick={handleCreate} disabled={creating} className="bg-orange-700 hover:bg-orange-800 text-white rounded-xl shadow-sm shrink-0">
          {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          Thêm danh mục
        </Button>
      </div>

      {isError ? <QueryError title="Không thể tải danh mục hệ thống" onRetry={refetch} isRetrying={isFetching} /> : <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Mã danh mục</th>
                <th className="px-6 py-4 font-medium">Tên danh mục</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                    Chưa có danh mục nào. Hãy thêm mới!
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.categoryId} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-3 w-24">
                      {cat.categoryId}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-50">
                      {cat.categoryName}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        aria-label={`Sửa ${cat.categoryName}`}
                        onClick={() => handleEdit(cat)}
                        disabled={updating || deleting}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        aria-label={`Xóa ${cat.categoryName}`}
                        onClick={() => handleDelete(cat.categoryId)}
                        disabled={updating || deleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>}
    </div>
  )
}
