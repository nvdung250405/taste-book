import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  filterFavorites,
  filterRecipes,
  recipeCounts,
  recipeStatus,
} from './collectionFilters.js'

test('rejected private recipes belong to rejected counts and filters, not drafts', () => {
  const rejected = {
    title: 'Cá kho',
    isPublic: false,
    approvalStatus: 'Rejected',
  }
  const draft = { title: 'Phở', isPublic: false, approvalStatus: 'Pending' }
  assert.equal(recipeStatus(rejected), 'rejected')
  assert.equal(
    recipeStatus({ ...rejected, approvalStatus: 'REJECTED' }),
    'rejected',
  )
  assert.deepEqual(recipeCounts([rejected, draft]), {
    all: 2,
    approved: 0,
    pending: 0,
    rejected: 1,
    draft: 1,
  })
  assert.deepEqual(filterRecipes([rejected, draft], 'rejected', ''), [rejected])
  assert.deepEqual(filterRecipes([rejected, draft], 'draft', ''), [draft])
})

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
