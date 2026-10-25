import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  filterFavorites,
  filterRecipes,
  recipeCounts,
} from './collectionFilters.js'

test('recipe filters and tab counts cover the whole collection before pagination', () => {
  const recipes = [
    ...Array.from({ length: 100 }, () => ({
      title: 'Phở',
      isPublic: true,
      approvalStatus: 'Approved',
    })),
    { title: 'Canh chua', isPublic: true, approvalStatus: 'Pending' },
    { title: 'Cá kho', isPublic: false, approvalStatus: 'Approved' },
  ]
  assert.deepEqual(recipeCounts(recipes), {
    all: 102,
    approved: 100,
    pending: 1,
    rejected: 0,
    draft: 1,
  })
  assert.deepEqual(filterRecipes(recipes, 'pending', ' CANH '), [recipes[100]])
  assert.deepEqual(filterRecipes(recipes, 'draft', ''), [recipes[101]])
})

test('favorite search matches titles, authors and personal notes across all pages', () => {
  const favorites = [
    { title: 'Canh chua', author: { username: 'Lan' } },
    { title: 'Cá kho', personalNotes: 'Giảm đường' },
    { recipe: { title: 'Phở', author: { username: 'Minh' } } },
  ]
  assert.deepEqual(filterFavorites(favorites, ' CANH '), [favorites[0]])
  assert.deepEqual(filterFavorites(favorites, 'lan'), [favorites[0]])
  assert.deepEqual(filterFavorites(favorites, 'giảm'), [favorites[1]])
  assert.deepEqual(filterFavorites(favorites, 'minh'), [favorites[2]])
  assert.deepEqual(filterFavorites(favorites, ''), favorites)
})
