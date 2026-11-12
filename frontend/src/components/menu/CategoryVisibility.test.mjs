import assert from 'node:assert/strict'
import { test } from 'node:test'
import { server, mount } from './menuTestHarness.mjs'

test('public discovery shows only system categories while personal forms retain private categories', async () => {
  const hooks = await server.ssrLoadModule('/src/hooks/queries/useCategoryQueries.js')
  let shared, personal
  function Harness() {
    shared = hooks.usePublicCategories()
    personal = hooks.useCategories()
    return null
  }
  const categories = [{ categoryId: 1, categoryName: 'Community', createdBy: null }, { categoryId: 2, categoryName: 'Personal', createdBy: 7 }]
  const app = await mount(Harness, {}, [[['categories', null], { EC: 0, DT: categories }]])
  try {
    assert.deepEqual(shared.data.DT, [categories[0]])
    assert.deepEqual(personal.data.DT, categories)
    assert.deepEqual(app.client.getQueryData(['categories', null]).DT, categories)
  } finally { await app.close() }
})
