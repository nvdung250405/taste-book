import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  changeRecipeIngredient,
  recipeIngredientPayload,
} from './recipeIngredientSelection.js'

const ingredients = [
  {
    ingredientId: 7,
    ingredientName: 'Thịt bò',
    defaultUnit: { unitId: 2, unitName: 'gram' },
  },
]
const units = [{ unitId: 2, unitName: 'gram' }]

test('choosing a standard ingredient preserves quantity and submits its identity and default unit', () => {
  const row = changeRecipeIngredient(
    { name: '', quantity: '250', unit: 'chén' },
    'name',
    'Thịt bò',
    ingredients,
    units,
  )
  assert.equal(row.unit, 'gram')
  assert.equal(row.unitId, 2)
  assert.deepEqual(recipeIngredientPayload(row), {
    ingredientId: 7,
    quantity: 250,
  })
})
test('editing a selected name clears its identity and supports standard or custom units', () => {
  const selected = changeRecipeIngredient(
    { quantity: '2', unit: '' },
    'name',
    'Thịt bò',
    ingredients,
    units,
  )
  const custom = changeRecipeIngredient(
    selected,
    'name',
    'Nấm mới',
    ingredients,
    units,
  )
  assert.equal(custom.ingredientId, null)
  assert.deepEqual(recipeIngredientPayload(custom), {
    customIngredientName: 'Nấm mới',
    quantity: 2,
    unitId: 2,
  })
  const changed = changeRecipeIngredient(
    custom,
    'unit',
    'nắm',
    ingredients,
    units,
  )
  assert.deepEqual(recipeIngredientPayload(changed), {
    customIngredientName: 'Nấm mới',
    quantity: 2,
    customUnit: 'nắm',
  })
})
test('ambiguous duplicate names never silently select an ingredient id', () => {
  const row = changeRecipeIngredient(
    { quantity: 1, unit: '' },
    'name',
    'Thịt bò',
    [...ingredients, { ...ingredients[0], ingredientId: 8 }],
    units,
  )
  assert.equal(row.ingredientId, null)
})
