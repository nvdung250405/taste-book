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
