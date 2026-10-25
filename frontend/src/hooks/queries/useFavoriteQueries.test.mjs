import assert from 'node:assert/strict'
import { after, afterEach, before, beforeEach, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createServer } from 'vite'

let server, hooks, recipeHooks, favoritesApi, recipesApi, client, originalFavorites, originalRecipes, originalRemove
const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
before(async () => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => 'token' } })
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  hooks = await server.ssrLoadModule('/src/hooks/queries/useFavoriteQueries.js')
  recipeHooks = await server.ssrLoadModule('/src/hooks/queries/useRecipeQueries.js')
  favoritesApi = (await server.ssrLoadModule('/src/api/favorites.api.js')).default
  recipesApi = (await server.ssrLoadModule('/src/api/recipes.api.js')).default
  originalFavorites = favoritesApi.getFavorites
  originalRemove = favoritesApi.removeFavorite
  originalRecipes = recipesApi.getMyRecipes
})
after(async () => {
  await server?.close()
  if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
  else delete globalThis.localStorage
})
beforeEach(() => { client = new QueryClient({ defaultOptions: { queries: { retry: false } } }) })
afterEach(() => {
  favoritesApi.getFavorites = originalFavorites
  favoritesApi.removeFavorite = originalRemove
  recipesApi.getMyRecipes = originalRecipes
  client.clear()
})
function render(hook) {
  let value
  function Harness() { value = hook(); return null }
  renderToString(createElement(QueryClientProvider, { client }, createElement(Harness)))
  return value
}

for (const kind of ['favorites', 'my-recipes']) {
  test(`${kind} fetches only the requested page even when there are hundreds of pages`, async () => {
    const calls = []
    const api = async (params, options) => {
      calls.push(params)
      assert.ok(options.signal)
      return { EC: 0, DT: { items: [], total: 2400, totalPages: 200 } }
    }
    favoritesApi.getFavorites = api
    recipesApi.getMyRecipes = api
    const params = { page: 4, limit: 12, search: 'canh', ...(kind === 'my-recipes' && { status: 'pending' }) }
    render(() => kind === 'favorites' ? hooks.useFavorites(params) : recipeHooks.useMyRecipes(params))
    const query = client.getQueryCache().getAll()[0]
    await client.fetchQuery(query.options)
    assert.deepEqual(calls, [params])
  })
}

test('favorite status checks IDs beyond the first page and normalizes number/string IDs', async () => {
  let params
  favoritesApi.getFavorites = async value => {
    params = value
    return { EC: 0, DT: { items: [{ recipeId: 111 }], total: 1, totalPages: 1 } }
  }
  render(() => hooks.useFavoriteIds([111, '111', 120]))
  const query = client.getQueryCache().getAll()[0]
  await client.fetchQuery(query.options)
  assert.equal(params.recipeIds, '111,120')
  assert.equal(params.limit, 100)
  const result = render(() => hooks.useFavoriteIds([111, 120]))
  assert.equal(result.data.has('111'), true)
  assert.equal(result.data.has('120'), false)
})

test('failed removal restores both paginated list and status lookup caches', async () => {
  const listKey = ['favorites', { page: 3 }]
  const statusKey = ['favorites', { recipeIds: '111', page: 1, limit: 100 }]
  const data = { EC: 0, DT: { items: [{ recipeId: 111 }], total: 25, totalPages: 3 } }
  client.setQueryData(listKey, data)
  client.setQueryData(statusKey, data)
  favoritesApi.removeFavorite = async () => { throw new Error('Network failure') }
  const mutation = render(() => hooks.useRemoveFavorite())
  await assert.rejects(mutation.mutateAsync(111))
  assert.deepEqual(client.getQueryData(listKey), data)
  assert.deepEqual(client.getQueryData(statusKey), data)
})
