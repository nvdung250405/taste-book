import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createServer } from 'vite'

let server, MenuPage, SearchPage
const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
before(async () => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => null },
  })
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
  })
  MenuPage = (await server.ssrLoadModule('/src/pages/MenuPage.jsx')).default
  SearchPage = (await server.ssrLoadModule('/src/pages/RecipeSearchPage.jsx'))
    .default
})
after(async () => {
  await server?.close()
  if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
  else delete globalThis.localStorage
})
function render(client, Page, route) {
  return renderToString(
    createElement(
      QueryClientProvider,
      { client },
      createElement(
        MemoryRouter,
        { initialEntries: [route] },
        createElement(Page),
      ),
    ),
  )
}
test('custom menu tab hides generated weekly lists and exposes create, rename and delete actions', () => {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  })
  client.setQueryData(['recipe-lists'], {
    DT: [
      { recipeListId: 1, listName: 'Tiệc gia đình', totalItems: 3 },
      {
        recipeListId: 2,
        listName: 'Lịch tuần | 2026-10-28 | Sáng',
        totalItems: 1,
      },
    ],
  })
  try {
    const html = render(client, MenuPage, '/menu?tab=my-menus')
    assert.match(html, /Tạo thực đơn mới/)
    assert.match(html, /Đổi tên Tiệc gia đình/)
    assert.match(html, /Xóa Tiệc gia đình/)
    assert.match(html, /Xem món/)
    assert.doesNotMatch(html, /Lịch tuần \| 2026-10-28/)
  } finally {
    client.clear()
  }
})
test('search forwards the single ingredient URL filter along with existing filters to the recipe API', async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const api = (await server.ssrLoadModule('/src/api/recipes.api.js')).default
  const original = api.getRecipes
  let params
  api.getRecipes = async (value) => {
    params = value
    return { DT: { recipes: [], total: 0, totalPages: 0 } }
  }
  try {
    render(
      client,
      SearchPage,
      '/search?ingredientId=3&categoryId=2&difficulty=Easy&page=4',
    )
    const query = client
      .getQueryCache()
      .getAll()
      .find((query) => query.queryKey[0] === 'recipes')
    await client.fetchQuery(query.options)
    assert.deepEqual(params, {
      ingredientId: '3',
      categoryId: '2',
      difficulty: 'Easy',
      page: 4,
      limit: 12,
    })
    assert.match(
      render(client, SearchPage, '/search?ingredientId=3'),
      /Bỏ lọc nguyên liệu/,
    )
  } finally {
    api.getRecipes = original
    client.clear()
  }
})
