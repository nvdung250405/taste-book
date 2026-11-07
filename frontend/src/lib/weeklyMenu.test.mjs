import test from 'node:test'
import assert from 'node:assert/strict'
import { dateKey, moveDate, weekStart, mealListName, shoppingMealTitle, MEALS } from './weeklyMenu.js'

test('Sunday belongs to the preceding Monday, including across years', () => {
  assert.equal(dateKey(weekStart(new Date(2027, 0, 3))), '2026-12-28')
  assert.equal(dateKey(weekStart(new Date(2026, 9, 12))), '2026-10-12')
})
test('shopping title includes only the selected dates and meals', () => {
  const rows = [0, 1].map(day => ({ date: new Date(2026, 9, 18 + day), meals: MEALS.map((name, meal) => ({ name, list: { recipeListId: day * 3 + meal } })) }))
  assert.equal(shoppingMealTitle(rows, new Set([0, 1])), 'Đi chợ 18/10: Sáng, Trưa')
  assert.equal(shoppingMealTitle(rows, new Set([0, 5])), 'Đi chợ 18/10: Sáng; 19/10: Tối')
})
test('full-week title retains every day and meal within the API 100-character limit', () => {
  const rows = Array.from({ length: 7 }, (_, day) => ({ date: new Date(2026, 9, 12 + day), meals: MEALS.map((name, meal) => ({ name, list: { recipeListId: day * 3 + meal } })) }))
  const title = shoppingMealTitle(rows, new Set(Array.from({ length: 21 }, (_, id) => id)))
  assert.ok(title.length <= 100)
  for (let day = 12; day <= 18; day++) assert.ok(title.includes(`${day}/10:S/Tr/T`))
})
test('week navigation crosses month boundaries and returns to the original week', () => {
  const start = new Date(2026, 11, 28)
  assert.equal(dateKey(moveDate(start, 7)), '2027-01-04')
  assert.equal(dateKey(moveDate(moveDate(start, 7), -7)), dateKey(start))
  assert.equal(dateKey(start), '2026-12-28')
})
test('meal identifiers are unique across all 21 slots and stable across reloads', () => {
  const start = new Date(2026, 9, 12)
  const names = Array.from({ length: 7 }, (_, day) => Array.from({ length: 3 }, (_, meal) => mealListName(moveDate(start, day), meal))).flat()
  assert.equal(new Set(names).size, 21)
  assert.equal(mealListName(new Date(2026, 9, 12, 23), 0), names[0])
})
