import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useCategories } from '../hooks/queries/useCategoryQueries'
import {
  useRecipeDetail,
  useCreateRecipe,
  useUpdateRecipe
} from '../hooks/queries/useRecipeQueries'
import { toast } from 'sonner'

import RecipeBasicInfoForm from '../components/recipe/RecipeBasicInfoForm'
import RecipeIngredientsForm from '../components/recipe/RecipeIngredientsForm'
import RecipeStepsForm from '../components/recipe/RecipeStepsForm'

export default function RecipeFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: categoriesRes } = useCategories()
  const { data: recipeRes, isLoading: loadingRecipe } = useRecipeDetail(id, { enabled: isEdit })
  const { mutate: createRecipe, isPending: creating } = useCreateRecipe()
  const { mutate: updateRecipe, isPending: updating } = useUpdateRecipe()

  const categories = categoriesRes?.DT || []

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    prepTime: '',
    servings: 4,
    difficulty: 'Trung bình',
    categories: [],
    tags: [],
    ingredients: [{ name: '', quantity: '', unit: '' }],
    steps: [{ title: '', content: '' }],
  })

  // Load edit data
  useEffect(() => {
    if (isEdit && recipeRes?.DT) {
      const r = recipeRes.DT
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: r.title || '',
        description: r.description || '',
        thumbnail: r.thumbnail || r.image || '',
        prepTime: r.prepTime || r.time || '',
        servings: r.servings || r.portions || 4,
        difficulty: r.difficulty || 'Trung bình',
        categories: r.categories?.map(c => c._id || c.id || c) || [],
        tags: r.tags?.map(t => t.name || t) || [],
        ingredients: r.ingredients?.length ? r.ingredients.map(i => ({
          name: i.ingredient?.name || i.name || '',
          quantity: i.quantity || '',
          unit: i.unit || i.ingredient?.unit || ''
        })) : [{ name: '', quantity: '', unit: '' }],
        steps: r.steps?.length ? r.steps.map(s => ({
          title: s.title || '',
          content: s.description || s.content || s.instruction || ''
        })) : [{ title: '', content: '' }],
      })
    }
  }, [isEdit, recipeRes])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Ingredients handlers
  const handleIngChange = (index, field, value) => {
    const newIngs = [...formData.ingredients]
    newIngs[index][field] = value
    setFormData(prev => ({ ...prev, ingredients: newIngs }))
  }
  const addIngredient = () => {
    setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }] }))
  }
  const removeIngredient = (index) => {
    if (formData.ingredients.length <= 1) return
    const newIngs = formData.ingredients.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, ingredients: newIngs }))
  }

  // Steps handlers
  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.steps]
    newSteps[index][field] = value
    setFormData(prev => ({ ...prev, steps: newSteps }))
  }
  const addStep = () => {
    setFormData(prev => ({ ...prev, steps: [...prev.steps, { title: '', content: '' }] }))
  }
  const removeStep = (index) => {
    if (formData.steps.length <= 1) return
    const newSteps = formData.steps.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, steps: newSteps }))
  }

  // Category toggle
  const toggleCategory = (catId) => {
    setFormData(prev => {
      const cats = [...prev.categories]
      if (cats.includes(catId)) return { ...prev, categories: cats.filter(id => id !== catId) }
      cats.push(catId)
      return { ...prev, categories: cats }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate
    if (!formData.title.trim()) return toast.error('Vui lòng nhập tên món')
    const validIngs = formData.ingredients.filter(i => i.name.trim())
    if (validIngs.length === 0) return toast.error('Cần ít nhất 1 nguyên liệu')
    const validSteps = formData.steps.filter(s => s.content.trim())
    if (validSteps.length === 0) return toast.error('Cần ít nhất 1 bước thực hiện')

    const payload = {
      ...formData,
      ingredients: validIngs,
      steps: validSteps,
    }

    if (isEdit) {
      updateRecipe({ recipeId: id, data: payload }, {
        onSuccess: () => {
          toast.success('Cập nhật công thức thành công')
          navigate(`/recipe/${id}`)
        },
        onError: () => toast.error('Lỗi khi cập nhật'),
      })
    } else {
      createRecipe(payload, {
        onSuccess: (res) => {
          toast.success('Đã tạo công thức thành công')
          const newId = res?.DT?._id || res?.DT?.id
          if (newId) navigate(`/recipe/${newId}`)
          else navigate('/my-recipes')
        },
        onError: () => toast.error('Lỗi khi tạo'),
      })
    }
  }

  if (isEdit && loadingRecipe) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="text-slate-500">Đang tải dữ liệu...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            {isEdit ? 'Chỉnh sửa công thức' : 'Tạo công thức mới'}
          </h1>
          <p className="text-slate-500 mt-1">Chia sẻ công thức nấu ăn của bạn với mọi người</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <RecipeBasicInfoForm 
          formData={formData} 
          handleChange={handleChange} 
          setFormData={setFormData} 
          categories={categories} 
          toggleCategory={toggleCategory} 
        />

        <RecipeIngredientsForm 
          formData={formData} 
          handleIngChange={handleIngChange} 
          removeIngredient={removeIngredient} 
          addIngredient={addIngredient} 
        />

        <RecipeStepsForm 
          formData={formData} 
          handleStepChange={handleStepChange} 
          removeStep={removeStep} 
          addStep={addStep} 
        />

        {/* Submit */}
        <div className="flex justify-end gap-3 sticky bottom-4 p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="rounded-xl px-6">
            Hủy
          </Button>
          <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8" disabled={creating || updating}>
            {(creating || updating) ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isEdit ? 'Lưu thay đổi' : 'Đăng công thức'}
          </Button>
        </div>
      </form>
    </div>
  )
}
