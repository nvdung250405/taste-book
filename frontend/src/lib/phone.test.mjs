import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isVietnamesePhone, normalizePhone } from './phone.js'

test('Vietnamese phones accept both formats and normalize to the same local number', () => {
  for (const phone of ['0912345678', '+84912345678', ' 0912345678 ']) {
    assert.equal(isVietnamesePhone(phone), true)
    assert.equal(normalizePhone(phone), '0912345678')
  }
  for (const phone of [
    '+840912345678',
    '0212345678',
    '09123',
    '09123456789',
    'abc',
  ])
    assert.equal(isVietnamesePhone(phone), false)
  assert.equal(normalizePhone(' user@example.test '), 'user@example.test')
})
