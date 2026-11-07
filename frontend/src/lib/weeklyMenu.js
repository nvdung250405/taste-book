export const MEALS = ['Sáng', 'Trưa', 'Tối']
export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function moveDate(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}
export function weekStart(date = new Date()) {
  return moveDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()), -((date.getDay() + 6) % 7))
}
// One server list per meal allows repeat recipes across days with the current API.
export function mealListName(date, meal) {
  return `Lịch tuần | ${dateKey(date)} | ${MEALS[meal]}`
}

export function shoppingMealTitle(rows, selected) {
  const chosen = rows.map(row => ({
    date: `${String(row.date.getDate()).padStart(2, '0')}/${String(row.date.getMonth() + 1).padStart(2, '0')}`,
    meals: row.meals.filter(meal => meal.list && selected.has(meal.list.recipeListId)),
  })).filter(row => row.meals.length)
  const full = `Đi chợ ${chosen.map(row => `${row.date}: ${row.meals.map(meal => meal.name).join(', ')}`).join('; ')}`
  if (full.length <= 100) return full
  const short = { Sáng: 'S', Trưa: 'Tr', Tối: 'T' }
  return `Đi chợ ${chosen.map(row => `${row.date}:${row.meals.map(meal => short[meal.name]).join('/')}`).join(';')}`
}
