import assert from 'node:assert/strict'
import { after, afterEach, before, beforeEach, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createServer } from 'vite'

let server, useModerateRecipe, api, original, client, mutation
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  useModerateRecipe = (await server.ssrLoadModule('/src/hooks/queries/useRecipeQueries.js')).useModerateRecipe
  api = (await server.ssrLoadModule('/src/api/recipes.api.js')).default
  original = api.moderateRecipe
})
after(async () => { await server?.close() })
beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  client.setQueryData(['pending-recipes'], { EC: 0, DT: [{ recipeId: 1 }, { recipeId: 2 }] })
  for (const key of ['admin-recipes', 'recipes', 'home-recipes', 'my-recipes']) client.setQueryData([key], {})
  client.setQueryData(['recipe', '1'], {})
  function Harness() { mutation = useModerateRecipe(); return null }
  renderToString(createElement(QueryClientProvider, { client }, createElement(Harness)))
})
afterEach(() => { api.moderateRecipe = original; client.clear() })

test('successful moderation removes only the processed row and refreshes related caches', async () => {
  let request
  api.moderateRecipe = async (id, data) => { request = { id, data }; return { EC: 0 } }
  await mutation.mutateAsync({ recipeId: '1', data: { approvalStatus: 'Approved' } })
  assert.deepEqual(request, { id: '1', data: { approvalStatus: 'Approved' } })
  assert.deepEqual(client.getQueryData(['pending-recipes']).DT, [{ recipeId: 2 }])
  for (const key of ['pending-recipes', 'admin-recipes', 'recipes', 'home-recipes', 'my-recipes']) {
    assert.equal(client.getQueryState([key]).isInvalidated, true)
  }
  assert.equal(client.getQueryState(['recipe', '1']).isInvalidated, true)
})

test('a failed moderation preserves the pending list for retry', async () => {
  api.moderateRecipe = async () => { throw { EC: 1, EM: 'Đã được xử lý' } }
  await assert.rejects(mutation.mutateAsync({ recipeId: 1, data: { approvalStatus: 'Rejected', rejectionReason: 'Thiếu hướng dẫn' } }))
  assert.deepEqual(client.getQueryData(['pending-recipes']).DT, [{ recipeId: 1 }, { recipeId: 2 }])
})
