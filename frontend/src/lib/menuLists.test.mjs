import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  ensureMealList,
  isWeeklyList,
  menuNameError,
  validServings,
} from './menuLists.js'
import { mealListName } from './weeklyMenu.js'

test('separates generated weekly meal lists from custom menus', () => {
  assert.equal(
    isWeeklyList({ listName: 'Lịch tuần | 2026-10-28 | Sáng' }),
    true,
  )
  assert.equal(isWeeklyList({ listName: 'Tiệc cuối tuần' }), false)
  assert.equal(isWeeklyList({ listName: 'Lịch tuần' }), false)
})
test('validates menu names against the existing API and reserved calendar prefix', () => {
  const lists = [{ recipeListId: 1, listName: 'Tiệc gia đình' }]
  for (const name of [
    '',
    '  ',
    '123',
    'a'.repeat(101),
    'Lịch tuần | tùy chọn',
    'TIỆC GIA ĐÌNH',
  ])
    assert.ok(menuNameError(name, lists))
  assert.equal(menuNameError('Tiệc gia đình', lists, 1), '')
  assert.equal(menuNameError('Bữa trưa', lists), '')
})
test('serving counts obey positive int32 constraints', () => {
  for (const value of ['', 0, -1, 1.5, Infinity, 'abc', 2147483648])
    assert.equal(validServings(value), false)
  for (const value of [1, '2', 2147483647])
    assert.equal(validServings(value), true)
})
test('reuses the date/meal list without creating duplicates', async () => {
  const date = new Date(2026, 9, 28)
  const list = { recipeListId: 5, listName: mealListName(date, 1) }
  const result = await ensureMealList(
    { createRecipeList: () => assert.fail('Must reuse existing list') },
    [list],
    date,
    1,
  )
  assert.equal(result, list)
})
test('recovers a concurrent weekly-list creation conflict by reloading the exact meal', async () => {
  const date = new Date(2026, 9, 28)
  const list = { recipeListId: 5, listName: mealListName(date, 1) }
  let created
  const api = {
    createRecipeList: async (data) => {
      created = data
      throw { EC: 2 }
    },
    getRecipeLists: async () => ({ DT: [list] }),
  }
  assert.equal(await ensureMealList(api, [], date, 1), list)
  assert.deepEqual(created, { listName: list.listName })
})
test('does not swallow non-conflict API errors', async () => {
  const failure = { EC: 5, EM: 'Unauthorized' }
  await assert.rejects(
    ensureMealList(
      {
        createRecipeList: async () => {
          throw failure
        },
      },
      [],
      new Date(2026, 9, 28),
      0,
    ),
    (error) => error === failure,
  )
})
