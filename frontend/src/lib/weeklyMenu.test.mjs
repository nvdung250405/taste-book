import test from 'node:test'
import assert from 'node:assert/strict'
import { dateKey, moveDate, weekStart, mealListName } from './weeklyMenu.js'

test('Sunday belongs to the preceding Monday, including across years', () => {
  assert.equal(dateKey(weekStart(new Date(2027, 0, 3))), '2026-12-28')
  assert.equal(dateKey(weekStart(new Date(2026, 9, 12))), '2026-10-12')
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
