import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isAdminPath, safeReturnLocation } from './navigation.js'

test('recognizes only the complete admin path segment, including nested/unknown paths', () => {
  for (const path of ['/admin', '/admin/', '/admin/unknown/deep', '/ADMIN/users']) assert.equal(isAdminPath(path), true)
  for (const path of ['/administrator', '/admin-other', '/search']) assert.equal(isAdminPath(path), false)
})

test('return navigation rejects external paths and authentication loops', () => {
  for (const pathname of ['//evil.test', '/\\evil.test', '/%5cevil.test', '/%2fevil.test', 'https://evil.test', 'javascript:alert(1)', '/login', '/register', '/403', '/\n/evil.test', '/admin?next=bad']) {
    assert.equal(safeReturnLocation({ pathname }), null)
  }
  assert.equal(safeReturnLocation(null), null)
  assert.deepEqual(safeReturnLocation({ pathname: '/admin/users', search: '?page=2', hash: '#list' }), {
    pathname: '/admin/users', search: '?page=2', hash: '#list',
  })
})
