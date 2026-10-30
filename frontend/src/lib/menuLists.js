import { mealListName } from './weeklyMenu.js'

export const isWeeklyList = (list) =>
  /^Lịch tuần \| \d{4}-\d{2}-\d{2} \| (Sáng|Trưa|Tối)$/.test(
    list.listName || '',
  )
export const validServings = (value) =>
  Number.isInteger(Number(value)) &&
  Number(value) >= 1 &&
  Number(value) <= 2147483647
export function menuNameError(value, lists, currentId) {
  const name = value.trim()
  if (!name) return 'Vui lòng nhập tên thực đơn.'
  if (name.length > 100) return 'Tên thực đơn tối đa 100 ký tự.'
  if (/^\d+$/.test(name)) return 'Tên thực đơn không được chỉ chứa số.'
  if (name.startsWith('Lịch tuần |'))
    return 'Tên này dành riêng cho lịch tuần. Vui lòng chọn tên khác.'
  if (
    lists.some(
      (list) =>
        String(list.recipeListId) !== String(currentId) &&
        list.listName.toLowerCase() === name.toLowerCase(),
    )
  )
    return 'Tên thực đơn đã tồn tại.'
  return ''
}

export async function ensureMealList(api, lists, date, meal) {
  const listName = mealListName(date, meal)
  const existing = lists.find((list) => list.listName === listName)
  if (existing) return existing
  try {
    return (await api.createRecipeList({ listName })).DT
  } catch (error) {
    if (error?.EC !== 2) throw error
    const list = (await api.getRecipeLists()).DT.find(
      (row) => row.listName === listName,
    )
    if (!list) throw error
    return list
  }
}
