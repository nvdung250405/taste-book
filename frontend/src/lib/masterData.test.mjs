import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeMasterName, validateMasterData } from './masterData.js'

const nameField = { key: 'unitName', label: 'Tên đơn vị tính', maxLength: 30 }
test('normalizes Vietnamese accents and case for search and duplicate checks', () => {
  assert.equal(normalizeMasterName('  ĐẬU phụ '), 'dau phu')
})
test('rejects whitespace-only names and names exceeding backend limits', () => {
  for (const name of ['   ', 'a'.repeat(31)]) {
    assert.ok(validateMasterData({ unitName: name }, [nameField], [], 'unitId').errors.unitName)
  }
  assert.deepEqual(validateMasterData({ unitName: 'a'.repeat(30) }, [nameField], [], 'unitId').errors, {})
})
test('detects duplicates ignoring case/accents but permits editing the same record', () => {
  const rows = [{ unitId: 5, unitName: 'Muỗng' }]
  assert.ok(validateMasterData({ unitName: 'muong' }, [nameField], rows, 'unitId').errors.unitName)
  assert.deepEqual(validateMasterData({ unitName: 'Muỗng' }, [nameField], rows, 'unitId', '5').errors, {})
})
test('ingredient form requires real reference options and trims the exact API payload', () => {
  const fields = [
    { key: 'ingredientName', label: 'Tên nguyên liệu', maxLength: 255 },
    { key: 'ingredientCategoryId', label: 'Nhóm nguyên liệu', options: [{ value: 2 }] },
    { key: 'defaultUnitId', label: 'Đơn vị mặc định', options: [{ value: 3 }] },
  ]
  const result = validateMasterData({ ingredientName: '  Đậu phụ ', ingredientCategoryId: '2', defaultUnitId: '3' }, fields, [], 'ingredientId')
  assert.deepEqual(result, { errors: {}, data: { ingredientName: 'Đậu phụ', ingredientCategoryId: 2, defaultUnitId: 3 } })
  for (const value of ['', '99', '3abc']) {
    const invalid = validateMasterData({ ingredientName: 'Đậu', ingredientCategoryId: value, defaultUnitId: value }, fields, [], 'ingredientId')
    assert.ok(invalid.errors.ingredientCategoryId)
    assert.ok(invalid.errors.defaultUnitId)
  }
})
