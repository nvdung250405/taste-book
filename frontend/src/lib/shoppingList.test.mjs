import test from 'node:test'
import assert from 'node:assert/strict'
import { conflictingUnits, customItemPayload } from './shoppingList.js'

test('warns for same ingredient with different units without converting quantities', () => {
  const items = [{ itemId: 1, itemName: ' Đường ', unit: 'g', totalQuantity: 100 }, { itemId: 2, itemName: 'đường', unit: 'kg', totalQuantity: 1 }, { itemId: 3, itemName: 'Muối', unit: 'g' }]
  assert.deepEqual([...conflictingUnits(items)], [1, 2])
  assert.equal(items[0].totalQuantity, 100)
})
test('equivalent unit spelling and different ingredients do not raise warnings', () => {
  assert.equal(conflictingUnits([{ itemId: 1, itemName: 'Sữa', unit: ' ML ' }, { itemId: 2, itemName: 'sữa', unit: 'ml' }, { itemId: 3, itemName: 'Bột', unit: 'g' }]).size, 0)
})
test('custom item supports Vietnamese decimal input and the actual API contract', () => {
  assert.deepEqual(customItemPayload(' Sữa ', '1,5', ' lít '), { itemName: 'Sữa', totalQuantity: 1.5, unit: 'lít' })
})
test('rejects empty fields, zero, negative and non-finite quantities', () => {
  for (const quantity of ['', '0', '-1', 'Infinity', 'abc']) assert.throws(() => customItemPayload('Sữa', quantity, 'lít'))
  assert.throws(() => customItemPayload(' ', '1', 'kg'))
  assert.throws(() => customItemPayload('Sữa', '1', ' '))
})
test('supports qualitative units with an omitted or zero quantity like the backend', () => {
  assert.deepEqual(customItemPayload('Muối', '', 'vừa đủ'), { itemName: 'Muối', unit: 'vừa đủ' })
  assert.equal(customItemPayload('Muối', '0', ' TÙY  KHẨU VỊ ').totalQuantity, 0)
  assert.equal(customItemPayload('Muối', '2', 'nêm nếm').totalQuantity, 0)
})
test('matches backend decimal rounding and storage bounds', () => {
  assert.equal(customItemPayload('Sữa', '1.005', 'lít').totalQuantity, 1.01)
  assert.equal(customItemPayload('Sữa', '0.005', 'lít').totalQuantity, 0.01)
  assert.equal(customItemPayload('Sữa', '99999999.994', 'lít').totalQuantity, 99999999.99)
  assert.throws(() => customItemPayload('Sữa', '0.004', 'lít'))
  assert.throws(() => customItemPayload('Sữa', '99999999.995', 'lít'))
  assert.throws(() => customItemPayload('Sữa', '0x10', 'lít'))
})
test('normalizes unicode and repeated whitespace when detecting unit conflicts', () => {
  assert.deepEqual([...conflictingUnits([{ itemId: 1, itemName: 'Bột  mì', unit: 'g' }, { itemId: 2, itemName: 'Bột mì'.normalize('NFD'), unit: 'kg' }])], [1, 2])
})
