import { useState } from 'react'
import { ChefHat, Image as ImageIcon, Upload, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import uploadApi from '../../api/upload.api'
import { toast } from 'sonner'

const DIFFICULTIES = ['Dễ', 'Trung bình', 'Khó']

export default function RecipeBasicInfoForm({ formData, handleChange, setFormData, categories, toggleCategory }) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Check file size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh quá lớn (tối đa 5MB)')
      return
    }

    try {
      setIsUploading(true)
      const res = await uploadApi.uploadImage(file)
      const uploadedUrl = res?.DT?.imageUrl || res?.DT?.url
      if (uploadedUrl) {
        setFormData(prev => ({ ...prev, thumbnail: uploadedUrl }))
        toast.success('Tải ảnh lên thành công')
      } else {
        toast.error('Không thể lấy đường dẫn ảnh')
      }
    } catch (error) {
      console.error(error)
      toast.error('Lỗi khi tải ảnh lên')
    } finally {
      setIsUploading(false)
      // Reset input value so same file can be uploaded again if needed
      e.target.value = ''
    }
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-orange-500" /> Thông tin cơ bản
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cột trái: Ảnh món ăn */}
          <div className="lg:col-span-5 space-y-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ảnh món ăn</label>
            
            <div className="relative group w-full aspect-[4/3] lg:aspect-[3/2] rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex flex-col items-center justify-center">
              {formData.thumbnail ? (
                <>
                  <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
                      <Upload className="w-4 h-4"/> Đổi ảnh khác
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 text-orange-500" />
                  </div>
                  <p className="text-base font-medium text-slate-700 dark:text-slate-200 mb-1">Tải ảnh lên</p>
                  <p className="text-xs text-slate-500">Kéo thả hoặc bấm để chọn ảnh<br/>PNG, JPG (Max 5MB)</p>
                </div>
              )}
              
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                disabled={isUploading}
                title="Chọn ảnh từ máy tính"
              />
              
              {isUploading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Đang xử lý ảnh...</span>
                </div>
              )}
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ImageIcon className="w-4 h-4 text-slate-400" />
              </div>
              <Input
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="Hoặc dán URL ảnh trực tiếp..."
                className="pl-9 bg-transparent"
              />
            </div>
          </div>

          {/* Cột phải: Thông tin chi tiết */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tên món ăn <span className="text-red-500">*</span></label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: Phở bò gia truyền, Salad gà nướng..."
                className="text-lg font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mô tả ngắn</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Giới thiệu đôi nét hấp dẫn về món ăn của bạn..."
                className="flex w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 dark:border-slate-800 dark:placeholder:text-slate-500 min-h-[120px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">Thời gian nấu (phút)</label>
                <Input type="number" name="prepTime" value={formData.prepTime} onChange={handleChange} placeholder="VD: 30" min="1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">Khẩu phần (người)</label>
                <Input type="number" name="servings" value={formData.servings} onChange={handleChange} min="1" />
              </div>
              <div className="sm:min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">Độ khó</label>
                <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                  {DIFFICULTIES.map(diff => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, difficulty: diff }))}
                      className={`flex-1 py-1.5 px-1 text-xs sm:text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                        formData.difficulty === diff 
                          ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200 dark:border-slate-600'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 border border-transparent'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Danh mục món ăn</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                  const id = cat.categoryId || cat._id || cat.id
                  const selected = formData.categories.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleCategory(id)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border ${
                        selected
                          ? 'bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-500/20'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                      }`}
                    >
                      {cat.categoryName || cat.name || cat.title}
                    </button>
                  )
                })}
              </div>
            </div>
            {/* Visibility Toggle */}
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/60">
              <label className="flex items-start sm:items-center gap-3 cursor-pointer group w-fit">
                <div className="relative flex items-center mt-0.5 sm:mt-0 shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.isPublic !== false} // default to true if undefined
                    onChange={(e) => setFormData(p => ({ ...p, isPublic: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/20 dark:peer-focus:ring-orange-500/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                </div>
                <div>
                  <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Công khai công thức</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Chia sẻ để mọi người cùng xem (bỏ chọn nếu muốn giữ riêng tư)</span>
                </div>
              </label>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
