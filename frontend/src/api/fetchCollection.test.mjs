import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fetchCollection } from './fetchCollection.js'

test('collects recipes beyond the first 100 for global filtering and counts', async () => {
  const requested = []
  const items = Array.from({ length: 205 }, (_, index) => ({ recipeId: index + 1 }))
  const result = await fetchCollection(async page => {
    requested.push(page)
    return { EC: 0, DT: { items: items.slice((page - 1) * 100, page * 100), totalPages: 3 } }
  })
  assert.deepEqual(requested, [1, 2, 3])
  assert.equal(result.DT.total, 205)
  assert.deepEqual(result.DT.items, items)
})

test('does not report partial data as success when a later page fails', async () => {
  const requested = []
  await assert.rejects(fetchCollection(async page => {
    requested.push(page)
    if (page === 2) throw new Error('Network unavailable')
    return { EC: 0, DT: { items: [{ recipeId: 1 }], totalPages: 3 } }
  }), /Network unavailable/)
  assert.deepEqual(requested, [1, 2])
})

test('stops fetching additional pages when a query is cancelled', async () => {
  const controller = new AbortController()
  const requested = []
  await assert.rejects(fetchCollection(async page => {
    requested.push(page)
    controller.abort()
    return { EC: 0, DT: { items: [{ recipeId: 1 }], totalPages: 3 } }
  }, controller.signal), { name: 'AbortError' })
  assert.deepEqual(requested, [1])
})

test('deduplicates overlapping pages without displaying the same recipe twice', async () => {
  const result = await fetchCollection(async page => ({
    EC: 0,
    DT: { items: page === 1 ? [{ recipeId: 1 }, { recipeId: 2 }] : [{ recipeId: 2 }, { recipeId: 3 }], totalPages: 2 },
  }))
  assert.deepEqual(result.DT.items.map(item => item.recipeId), [1, 2, 3])
  assert.equal(result.DT.total, 3)
})

test('handles an empty collection without requesting another page', async () => {
  let requests = 0
  const result = await fetchCollection(async () => {
    requests++
    return { EC: 0, DT: { items: [], totalPages: 0 } }
  })
  assert.equal(requests, 1)
  assert.equal(result.DT.total, 0)
})
