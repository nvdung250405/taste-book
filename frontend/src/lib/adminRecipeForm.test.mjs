import assert from 'node:assert/strict'
import { test } from 'node:test'
import { adminRecipePayload } from './adminRecipeForm.js'

const categories = [{ categoryId: 2 }]
const form = () => ({
  title: ' Canh chua ',
  description: ' Mô tả ',
  thumbnail: '',
  prepTime: '30',
  servings: '4',
  difficulty: 'Dễ',
  categories: [2],
  ingredients: [
    { name: 'Thịt', unit: 'gam', quantity: '1,5', ingredientId: 3, unitId: 4 },
  ],
  steps: [
    { title: 'Sơ chế', content: 'Rửa sạch' },
    { title: '', content: 'Nấu chín' },
  ],
  isPublic: false,
})
test('admin payload preserves system ingredient IDs and ordered steps, forces public and trims text', () => {
  const payload = adminRecipePayload(form(), categories)
  assert.equal(payload.isPublic, true)
  assert.equal(payload.title, 'Canh chua')
  assert.equal(payload.thumbnailUrl, null)
  assert.deepEqual(payload.ingredients, [
    { ingredientId: 3, unitId: 4, quantity: 1.5 },
  ])
  assert.deepEqual(payload.steps, [
    { stepNumber: 1, instruction: 'Sơ chế: Rửa sạch' },
    { stepNumber: 2, instruction: 'Nấu chín' },
  ])
  assert.equal('approvalStatus' in payload, false)
})
test('custom ingredients use names and custom units without mixing system fields', () => {
  const value = form()
  value.ingredients = [{ name: ' Muối ', unit: ' vừa đủ ', quantity: 0 }]
  assert.deepEqual(adminRecipePayload(value, categories).ingredients, [
    { customIngredientName: 'Muối', customUnit: 'vừa đủ', quantity: 0 },
  ])
})
for (const [field, value] of [
  ['title', ' '],
  ['description', ' '],
  ['prepTime', 1.2],
  ['servings', 0],
  ['servings', 2147483648],
  ['thumbnail', 'javascript:alert(1)'],
  ['categories', [99]],
  ['steps', [{ title: 'Trống', content: '' }]],
]) {
  test(`rejects invalid admin field ${field}: ${JSON.stringify(value)}`, () => {
    assert.throws(() =>
      adminRecipePayload({ ...form(), [field]: value }, categories),
    )
  })
}
test('does not silently discard partial ingredients or invalid quantities', () => {
  for (const ingredient of [
    { name: '', unit: 'gam', quantity: 1 },
    { name: 'Muối', unit: '', quantity: 1 },
    { name: 'Muối', unit: 'gam', quantity: 0 },
    { name: 'Muối', unit: 'gam', quantity: -1 },
    { name: 'Muối', unit: 'gam', quantity: 'abc' },
    { name: 'Muối', unit: 'gam', quantity: 100000000 },
  ]) {
    assert.throws(() =>
      adminRecipePayload({ ...form(), ingredients: [ingredient] }, categories),
    )
  }
})
