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

test('Vietnamese decimal quantities serialize to numeric API values', () => {
  assert.equal(recipeIngredientPayload({ name: 'Sữa', quantity: '1,5', unit: 'lít' }).quantity, 1.5)
  assert.equal(recipeIngredientPayload({ ingredientId: 7, quantity: '2.25', unit: 'gram' }).quantity, 2.25)
})
test('qualitative units clear old quantities and serialize zero for custom and standard ingredients', () => {
  const qualitative = changeRecipeIngredient(
    { name: 'Muối', quantity: '12', unit: 'gram' },
    'unit',
    'vừa đủ',
    [],
    [],
  )
  assert.equal(qualitative.quantity, '')
  assert.equal(recipeIngredientPayload(qualitative).quantity, 0)
  const selected = changeRecipeIngredient(
    { name: '', quantity: '8', unit: '' },
    'ingredientId',
    3,
    [
      {
        ingredientId: 3,
        ingredientName: 'Muối',
        defaultUnit: { unitId: 4, unitName: 'nêm nếm' },
      },
    ],
    [],
  )
  assert.equal(selected.quantity, '')
  assert.deepEqual(recipeIngredientPayload(selected), {
    ingredientId: 3,
    quantity: 0,
  })
  const numeric = changeRecipeIngredient(qualitative, 'unit', 'gram', [], units)
  assert.equal(numeric.quantity, '')
  assert.equal(numeric.unitId, 2)
})
test('choosing a standard ingredient preserves quantity and submits its identity and default unit', () => {
  const row = changeRecipeIngredient(
    { name: '', quantity: '250', unit: 'chén' },
    'ingredientId',
    7,
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
    'ingredientId',
    7,
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

test('typing a matching master name stays custom and can later be explicitly selected or detached', () => {
  const custom = changeRecipeIngredient({ quantity: '2', unit: 'chén' }, 'name', 'Thịt bò', ingredients, units)
  assert.equal(custom.ingredientId, null)
  assert.deepEqual(recipeIngredientPayload(custom), { customIngredientName: 'Thịt bò', quantity: 2, customUnit: 'chén' })
  const standard = changeRecipeIngredient(custom, 'ingredientId', 7, ingredients, units)
  assert.deepEqual(recipeIngredientPayload(standard), { ingredientId: 7, quantity: 2 })
  const detached = changeRecipeIngredient(standard, 'ingredientId', null, ingredients, units)
  assert.equal(detached.name, standard.name)
  assert.equal(detached.ingredientId, null)
  assert.deepEqual(recipeIngredientPayload(detached), { customIngredientName: 'Thịt bò', quantity: 2, unitId: 2 })
})
