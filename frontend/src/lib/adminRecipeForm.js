import { isQualitativeUnit } from './shoppingList.js'

export function adminRecipePayload(form, categories) {
  const title = form.title.trim()
  if (!title || title.length > 255)
    throw new Error('Tên món phải có từ 1 đến 255 ký tự.')
  if (!form.description.trim()) throw new Error('Vui lòng nhập mô tả món ăn.')
  for (const [value, label] of [
    [form.prepTime, 'Thời gian nấu'],
    [form.servings, 'Khẩu phần'],
  ]) {
    if (
      !Number.isInteger(Number(value)) ||
      Number(value) < 1 ||
      Number(value) > 2147483647
    )
      throw new Error(`${label} phải là số nguyên dương hợp lệ.`)
  }
  if (!['Dễ', 'Trung bình', 'Khó'].includes(form.difficulty))
    throw new Error('Vui lòng chọn độ khó hợp lệ.')
  if (
    !form.categories.length ||
    form.categories.some(
      (id) =>
        !categories.some(
          (category) => String(category.categoryId) === String(id),
        ),
    )
  )
    throw new Error('Vui lòng chọn danh mục hệ thống hợp lệ.')
  if (form.thumbnail.trim()) {
    try {
      const url = new URL(form.thumbnail)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    } catch {
      throw new Error('Đường dẫn ảnh phải là URL http hoặc https hợp lệ.')
    }
  }
  if (!form.ingredients.length) throw new Error('Cần ít nhất một nguyên liệu.')
  const ingredients = form.ingredients.map((item, index) => {
    const name = item.name.trim(),
      unit = item.unit.trim()
    const quantity = Number(String(item.quantity).trim().replace(',', '.'))
    if (!name || name.length > 255 || !unit || unit.length > 255)
      throw new Error(
        `Vui lòng điền tên và đơn vị nguyên liệu ${index + 1} (tối đa 255 ký tự).`,
      )
    if (
      String(item.quantity).trim() === '' ||
      !Number.isFinite(quantity) ||
      quantity < 0 ||
      quantity > 99999999.99 ||
      (!isQualitativeUnit(unit) && quantity < 0.01)
    )
      throw new Error(
        `Định lượng nguyên liệu ${index + 1} không hợp lệ; chỉ đơn vị định tính được dùng 0.`,
      )
    return item.ingredientId
      ? {
          ingredientId: Number(item.ingredientId),
          quantity,
          ...(item.unitId && { unitId: Number(item.unitId) }),
        }
      : {
          customIngredientName: name,
          quantity,
          ...(item.unitId
            ? { unitId: Number(item.unitId) }
            : { customUnit: unit }),
        }
  })
  if (!form.steps.length || form.steps.some((step) => !step.content.trim()))
    throw new Error(
      'Vui lòng điền hướng dẫn cho tất cả các bước hoặc xóa bước trống.',
    )
  return {
    title,
    description: form.description.trim(),
    thumbnailUrl: form.thumbnail.trim() || null,
    cookTimeMinutes: Number(form.prepTime),
    defaultServings: Number(form.servings),
    difficulty: { Dễ: 'Easy', 'Trung bình': 'Medium', Khó: 'Hard' }[
      form.difficulty
    ],
    isPublic: true,
    categoryIds: [...new Set(form.categories.map(Number))],
    ingredients,
    steps: form.steps.map((step, index) => ({
      stepNumber: index + 1,
      instruction: step.title.trim()
        ? `${step.title.trim()}: ${step.content.trim()}`
        : step.content.trim(),
    })),
  }
}
