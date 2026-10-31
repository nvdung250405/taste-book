import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { Button } from '../components/ui/button'
import {
  useCategories,
  useAdminCategories,
} from '../hooks/queries/useCategoryQueries'
import {
  useRecipeDetail,
  useCreateRecipe,
  useUpdateRecipe,
  useAdminRecipes,
  useCreateAdminRecipe,
  useUpdateAdminRecipe,
} from '../hooks/queries/useRecipeQueries'
import { toast } from 'sonner'
import QueryError from '../components/ui/QueryError'
import { adminRecipePayload } from '../lib/adminRecipeForm'

import RecipeBasicInfoForm from '../components/recipe/RecipeBasicInfoForm'
import RecipeIngredientsForm from '../components/recipe/RecipeIngredientsForm'
import RecipeStepsForm from '../components/recipe/RecipeStepsForm'

export default function RecipeFormPage({ admin = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: recipeRes, isPending, refetch } = useRecipeDetail(id)
  const adminList = useAdminRecipes({}, { enabled: admin && !!id })
  if (admin && id) {
    if (adminList.isPending)
      return (
        <p role="status" className="p-8">
          Đang kiểm tra công thức chuẩn…
        </p>
      )
    if (adminList.isError)
      return (
        <QueryError
          title="Không thể kiểm tra công thức chuẩn"
          onRetry={adminList.refetch}
          isRetrying={adminList.isFetching}
        />
      )
    if (
      !adminList.data?.DT?.recipes?.some(
        (row) => String(row.recipeId) === String(id),
      )
    )
      return (
        <div role="alert" className="space-y-4 p-8">
          <h1 className="text-xl font-bold">
            Công thức không thuộc danh sách chuẩn hệ thống hoặc đã bị xóa.
          </h1>
          <Button onClick={() => navigate('/admin/recipes')}>
            Về danh sách công thức
          </Button>
        </div>
      )
  }

  if (id && !recipeRes?.DT) {
    if (isPending) {
      return (
        <div
          role="status"
          aria-label="Đang tải công thức"
          className="max-w-4xl mx-auto px-4 py-8 animate-pulse"
        >
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-8"></div>
          <div className="space-y-6">
            <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          </div>
        </div>
      )
    }

    return (
      <div
        role="alert"
        className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center"
      >
        <h1 className="text-2xl font-bold">Không thể tải công thức</h1>
        <p className="text-slate-500">
          Vui lòng thử lại để chỉnh sửa công thức.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
          <Button onClick={() => refetch()}>Thử lại</Button>
        </div>
      </div>
    )
  }

  // A different recipe (or create mode) gets its own form state.
  return (
    <RecipeForm
      key={`${admin ? 'admin' : 'user'}-${id || 'create'}`}
      id={id}
      recipe={recipeRes?.DT}
      admin={admin}
    />
  )
}

function RecipeForm({ id, recipe, admin }) {
  const navigate = useNavigate()
  const isEdit = !!id

  const userCategories = useCategories({ enabled: !admin })
  const adminCategories = useAdminCategories({ enabled: admin })
  const {
    data: categoriesRes,
    isError: categoriesError,
    isFetching: fetchingCategories,
    refetch: refetchCategories,
  } = admin ? adminCategories : userCategories
  const [isUploading, setIsUploading] = useState(false)
  const userCreate = useCreateRecipe()
  const userUpdate = useUpdateRecipe()
  const adminCreate = useCreateAdminRecipe()
  const adminUpdate = useUpdateAdminRecipe()
  const { mutate: createRecipe, isPending: creating } = admin
    ? adminCreate
    : userCreate
  const { mutate: updateRecipe, isPending: updating } = admin
    ? adminUpdate
    : userUpdate
  const [submitError, setSubmitError] = useState('')
  const back = () => (admin ? navigate('/admin/recipes') : navigate(-1))

  const categories = categoriesRes?.DT || []

  // Initialize once after the recipe loads; refetches must not replace the draft.
  const [formData, setFormData] = useState(() => {
    if (!recipe)
      return {
        title: '',
        description: '',
        thumbnail: '',
        prepTime: '',
        servings: 4,
        difficulty: 'Trung bình',
        categories: [],
        tags: [],
        isPublic: true,
        ingredients: [{ name: '', quantity: '', unit: '' }],
        steps: [{ title: '', content: '' }],
      }

    const r = recipe
    return {
      title: r.title || '',
      description: r.description || '',
      thumbnail: r.thumbnailUrl || r.thumbnail || r.image || '',
      prepTime: r.cookTimeMinutes || r.prepTime || r.time || '',
      servings: r.defaultServings || r.servings || r.portions || 4,
      difficulty:
        r.difficulty === 'Easy'
          ? 'Dễ'
          : r.difficulty === 'Hard'
            ? 'Khó'
            : 'Trung bình',
      categories:
        r.categories?.map((c) => c.categoryId || c._id || c.id || c) || [],
      tags: r.tags?.map((t) => t.name || t) || [],
      isPublic: r.isPublic !== undefined ? r.isPublic : true,
      ingredients: r.ingredients?.length
        ? r.ingredients.map((i) => ({
            name: i.ingredientName || i.ingredient?.name || i.name || '',
            quantity: i.quantity ?? '',
            unit: i.unit || i.ingredient?.unit || '',
            ...(admin && { ingredientId: i.ingredientId, unitId: i.unitId }),
          }))
        : [{ name: '', quantity: '', unit: '' }],
      steps: r.steps?.length
        ? r.steps.map((s, idx) => {
            let title = s.title || ''
            let content = s.instruction || s.description || s.content || ''
            // Try to extract title from "Title: Content" format if instruction has it
            if (!s.title && s.instruction && s.instruction.includes(': ')) {
              const parts = s.instruction.split(': ')
              if (parts.length > 1 && parts[0].length < 30) {
                // arbitrary length check for title
                title = parts[0]
                content = parts.slice(1).join(': ')
              }
            }
            return {
              title: title || `Bước ${s.stepNumber || idx + 1}`,
              content: content,
            }
          })
        : [{ title: '', content: '' }],
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Ingredients handlers
  const handleIngChange = (index, field, value) => {
    const newIngs = [...formData.ingredients]
    newIngs[index][field] = value
    if (admin && (field === 'name' || field === 'unit')) {
      newIngs[index].ingredientId = null
      if (field === 'unit') newIngs[index].unitId = null
    }
    setFormData((prev) => ({ ...prev, ingredients: newIngs }))
  }
  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }],
    }))
  }
  const removeIngredient = (index) => {
    if (formData.ingredients.length <= 1) return
    const newIngs = formData.ingredients.filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, ingredients: newIngs }))
  }

  // Steps handlers
  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.steps]
    newSteps[index][field] = value
    setFormData((prev) => ({ ...prev, steps: newSteps }))
  }
  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, { title: '', content: '' }],
    }))
  }
  const removeStep = (index) => {
    if (formData.steps.length <= 1) return
    const newSteps = formData.steps.filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, steps: newSteps }))
  }

  // Category toggle
  const toggleCategory = (catId) => {
    setFormData((prev) => {
      const cats = [...prev.categories]
      if (cats.includes(catId))
        return { ...prev, categories: cats.filter((id) => id !== catId) }
      cats.push(catId)
      return { ...prev, categories: cats }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (creating || updating) return
    if (isUploading) return toast.error('Vui lòng đợi ảnh tải lên hoàn tất')
    setSubmitError('')
    let standardPayload
    if (admin) {
      if (categoriesError || fetchingCategories) {
        setSubmitError('Vui lòng tải danh mục hệ thống trước khi lưu.')
        return
      }
      try {
        standardPayload = adminRecipePayload(formData, categories)
      } catch (error) {
        setSubmitError(error.message)
        return
      }
    }

    // Validate
    if (!formData.title.trim()) return toast.error('Vui lòng nhập tên món')
    if (!formData.description.trim())
      return toast.error('Vui lòng nhập mô tả món ăn')
    if (!formData.prepTime || Number(formData.prepTime) <= 0)
      return toast.error('Thời gian nấu phải lớn hơn 0')
    if (!formData.servings || Number(formData.servings) <= 0)
      return toast.error('Khẩu phần phải lớn hơn 0')
    if (formData.categories.length === 0)
      return toast.error('Vui lòng chọn ít nhất 1 danh mục')

    const validIngs = formData.ingredients.filter((i) => i.name.trim())
    if (validIngs.length === 0) return toast.error('Cần ít nhất 1 nguyên liệu')
    const validSteps = formData.steps.filter((s) => s.content.trim())
    if (validSteps.length === 0)
      return toast.error('Cần ít nhất 1 bước thực hiện')

    const payload = standardPayload || {
      title: formData.title,
      description: formData.description,
      thumbnailUrl: formData.thumbnail,
      cookTimeMinutes: Number(formData.prepTime),
      difficulty:
        formData.difficulty === 'Dễ'
          ? 'Easy'
          : formData.difficulty === 'Khó'
            ? 'Hard'
            : 'Medium',
      defaultServings: Number(formData.servings),
      isPublic: formData.isPublic,
      categoryIds: formData.categories,
      ingredients: validIngs.map((i) => ({
        customIngredientName: i.name,
        quantity: Number(i.quantity),
        customUnit: i.unit,
      })),
      steps: validSteps.map((s) => ({
        instruction: s.title ? `${s.title}: ${s.content}` : s.content,
      })),
    }

    if (isEdit) {
      updateRecipe(
        { recipeId: id, data: payload },
        {
          onSuccess: () => {
            toast.success('Cập nhật công thức thành công')
            if (admin) navigate('/admin/recipes')
            else navigate(`/recipe/${id}`)
          },
          onError: (error) => {
            setSubmitError(error?.EM || 'Lỗi khi cập nhật')
            toast.error(error?.EM || 'Lỗi khi cập nhật')
          },
        },
      )
    } else {
      createRecipe(payload, {
        onSuccess: (res) => {
          toast.success('Đã tạo công thức thành công')
          const newId = res?.DT?.recipeId || res?.DT?.id || res?.DT?._id
          if (admin) navigate('/admin/recipes')
          else if (newId) navigate(`/recipe/${newId}`)
          else navigate('/my-recipes')
        },
        onError: (error) => {
          setSubmitError(error?.EM || 'Lỗi khi tạo')
          toast.error(error?.EM || 'Lỗi khi tạo')
        },
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          aria-label="Quay lại"
          type="button"
          onClick={back}
          disabled={creating || updating || isUploading}
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            {admin
              ? isEdit
                ? 'Sửa công thức chuẩn'
                : 'Thêm công thức chuẩn'
              : isEdit
                ? 'Chỉnh sửa công thức'
                : 'Tạo công thức mới'}
          </h1>
          <p className="text-slate-500 mt-1">
            {admin
              ? 'Công thức hệ thống được công khai và duyệt ngay sau khi lưu.'
              : 'Chia sẻ công thức nấu ăn của bạn với mọi người'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <fieldset disabled={creating || updating} className="min-w-0 space-y-8">
          <RecipeBasicInfoForm
            admin={admin}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
            formData={formData}
            handleChange={handleChange}
            setFormData={setFormData}
            categories={categories}
            categoriesError={categoriesError}
            fetchingCategories={fetchingCategories}
            refetchCategories={refetchCategories}
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
        </fieldset>
        {submitError && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"
          >
            {submitError}
          </p>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3 sticky bottom-4 p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={back}
            disabled={creating || updating || isUploading}
            className="rounded-xl px-6"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="bg-orange-700 hover:bg-orange-800 text-white rounded-xl px-8"
            disabled={creating || updating || isUploading}
          >
            {creating || updating || isUploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isUploading
              ? 'Đang tải ảnh...'
              : isEdit
                ? 'Lưu thay đổi'
                : 'Đăng công thức'}
          </Button>
        </div>
      </form>
    </div>
  )
}
