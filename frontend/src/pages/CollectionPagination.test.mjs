import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createServer } from 'vite'

let server, MyRecipes, Favorites
const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
before(async () => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => 'token' },
  })
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
  })
  MyRecipes = (await server.ssrLoadModule('/src/pages/MyRecipesPage.jsx'))
    .default
  Favorites = (await server.ssrLoadModule('/src/pages/FavoritesPage.jsx'))
    .default
})
after(async () => {
  await server?.close()
  if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
  else delete globalThis.localStorage
})
const render = (client, Page, url) =>
  renderToString(
    createElement(
      QueryClientProvider,
      { client },
      createElement(
        MemoryRouter,
        { initialEntries: [url] },
        createElement(Page),
      ),
    ),
  )
for (const [Page, key, url] of [
  [() => MyRecipes, 'my-recipes', '/my-recipes'],
  [() => Favorites, 'favorites', '/favorites'],
]) {
  test(`${key} renders a single server page without creating a full-collection query`, () => {
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    })
    client.setQueryData([key, { page: 2, limit: 12 }], {
      DT: {
        items: [
          {
            recipeId: 13,
            title: 'Món trang hai',
            isPublic: true,
            approvalStatus: 'Approved',
          },
        ],
        total: 205,
        totalPages: 18,
      },
    })
    try {
      const html = render(client, Page(), url + '?page=2')
      assert.match(html, /Món trang hai/)
      const active = client
        .getQueryCache()
        .getAll()
        .filter((query) => query.options.enabled !== false)
      assert.equal(active.length, 1)
      assert.deepEqual(active[0].queryKey, [key, { page: 2, limit: 12 }])
      assert.equal(client.getQueryState([key, {}]), undefined)
    } finally {
      client.clear()
    }
  })
  test(`${key} renders server search results on page two without filtering or slicing again`, () => {
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    })
    const params = { page: 2, limit: 12, search: 'khong dau' }
    client.setQueryData([key, params], {
      DT: { items: [{ recipeId: 205, title: 'Kết quả từ máy chủ' }], total: 13, totalPages: 2 },
    })
    try {
      const html = render(client, Page(), url + '?search=khong%20dau&page=2')
      assert.match(html, /Kết quả từ máy chủ/)
      const active = client
        .getQueryCache()
        .getAll()
        .filter((query) => query.options.enabled !== false)
      assert.equal(active.length, 1)
      assert.deepEqual(active[0].queryKey, [key, params])
      assert.equal(client.getQueryCache().getAll().length, 1)
    } finally {
      client.clear()
    }
  })
}

test('private tab maps draft URL to API private and uses search-scoped server totals', () => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
  const params = { page: 1, limit: 12, search: 'bo', status: 'private' }
  client.setQueryData(['my-recipes', params], {
    DT: {
      items: [{ recipeId: 205, title: 'Bò riêng tư', isPublic: false }],
      total: 1, totalPages: 1,
      totals: { total: 205, approved: 100, pending: 80, rejected: 24, private: 1 },
    },
  })
  try {
    const html = render(client, MyRecipes, '/my-recipes?search=bo&status=draft')
    assert.match(html, /Bò riêng tư/)
    for (const count of [205, 100, 80, 24]) assert.match(html, new RegExp(`>${count}</span>`))
    assert.equal(client.getQueryCache().getAll().length, 1)
  } finally { client.clear() }
})
