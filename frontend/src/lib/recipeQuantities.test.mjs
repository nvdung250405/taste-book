import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatIngredientQuantity } from './recipeQuantities.js'

test('keeps fractional quantities at the original serving size', () => {
  assert.equal(formatIngredientQuantity(0.5), '0.5')
  assert.equal(formatIngredientQuantity('0.25'), '0.25')
  assert.equal(formatIngredientQuantity(0.05), '0.05')
})

test('scales fractional quantities without integer rounding or floating point noise', () => {
  assert.equal(formatIngredientQuantity(0.5, 0.5), '0.25')
  assert.equal(formatIngredientQuantity(0.1, 3), '0.3')
  assert.equal(formatIngredientQuantity(100, 2), '200')
})

test('handles missing values and preserves explicit zero', () => {
  assert.equal(formatIngredientQuantity(null), '')
  assert.equal(formatIngredientQuantity(''), '')
  assert.equal(formatIngredientQuantity('bad'), '')
  assert.equal(formatIngredientQuantity(0), '0')
})
