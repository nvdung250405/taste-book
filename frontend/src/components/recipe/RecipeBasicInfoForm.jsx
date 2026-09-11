import { ChefHat, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'

const DIFFICULTIES = ['Dễ', 'Trung bình', 'Khó']

export default function RecipeBasicInfoForm({ formData, handleChange, setFormData, categories, toggleCategory }) {
  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-orange-500" /> Thông tin cơ bản
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tên món ăn *</label>
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
            placeholder="Giới thiệu về món ăn của bạn..."
            className="flex w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:border-slate-800 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300 min-h-[100px] resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Ảnh món ăn (URL)</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="https://..."
                className="pl-9"
              />
            </div>
          </div>
          {formData.thumbnail && (
            <div className="mt-3 rounded-xl overflow-hidden h-48 w-full bg-slate-100 dark:bg-slate-800">
              <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Thời gian nấu</label>
            <Input name="prepTime" value={formData.prepTime} onChange={handleChange} placeholder="VD: 30 phút" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Khẩu phần (người)</label>
            <Input type="number" name="servings" value={formData.servings} onChange={handleChange} min="1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Độ khó</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map(diff => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, difficulty: diff }))}
                  className={`flex-1 py-2 px-1 text-sm font-medium rounded-lg border transition-colors ${
                    formData.difficulty === diff 
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 mt-2">Danh mục</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const id = cat._id || cat.id
              const selected = formData.categories.includes(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleCategory(id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    selected
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-orange-300'
                  }`}
                >
                  {cat.name || cat.title}
                </button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
