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
  test(`${key} opens on a single server page and keeps the all-pages fallback disabled`, () => {
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
      assert.equal(client.getQueryState([key, {}]).fetchStatus, 'idle')
    } finally {
      client.clear()
    }
  })
  test(`${key} searches all records beyond the first 100 without sending unsupported API filters`, () => {
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    })
    const items = Array.from({ length: 205 }, (_, index) => ({
      recipeId: index + 1,
      title: index === 204 ? 'Món cuối' : 'Món thường',
      isPublic: true,
      approvalStatus: 'Approved',
    }))
    client.setQueryData([key, {}], { DT: { items, total: 205 } })
    try {
      const html = render(client, Page(), url + '?search=Món%20cuối')
      assert.match(html, /Món cuối/)
      assert.doesNotMatch(html, /Món thường/)
      const active = client
        .getQueryCache()
        .getAll()
        .filter((query) => query.options.enabled !== false)
      assert.equal(active.length, 1)
      assert.deepEqual(active[0].queryKey, [key, {}])
    } finally {
      client.clear()
    }
  })
}
