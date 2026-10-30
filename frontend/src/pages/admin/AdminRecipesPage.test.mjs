import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createServer } from 'vite'

let server, Page, Form, hooks, api
const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
before(async () => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => null },
  })
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
  })
  Page = (await server.ssrLoadModule('/src/pages/admin/AdminRecipesPage.jsx'))
    .default
  Form = (await server.ssrLoadModule('/src/pages/RecipeFormPage.jsx')).default
  hooks = await server.ssrLoadModule('/src/hooks/queries/useRecipeQueries.js')
  api = (await server.ssrLoadModule('/src/api/recipes.api.js')).default
})
after(async () => {
  await server?.close()
  if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
  else delete globalThis.localStorage
})
function client() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  })
}
function render(cache, Component, route = '/admin/recipes', props = {}) {
  return renderToString(
    createElement(
      QueryClientProvider,
      { client: cache },
      createElement(
        MemoryRouter,
        { initialEntries: [route] },
        createElement(Component, props),
      ),
    ),
  )
}
test('admin recipe list renders search, edit/delete, client pagination and the correct create route', () => {
  const cache = client()
  cache.setQueryData(['admin-recipes', {}], {
    DT: {
      recipes: Array.from({ length: 12 }, (_, i) => ({
        recipeId: i + 1,
        title: `Món ${i + 1}`,
        difficulty: 'Easy',
        cookTimeMinutes: 30,
        defaultServings: 4,
      })),
    },
  })
  try {
    const html = render(cache, Page)
    assert.match(html, /href="\/admin\/recipes\/create"/)
    assert.equal((html.match(/aria-label="Sửa Món/g) || []).length, 10)
    assert.equal((html.match(/aria-label="Xóa Món/g) || []).length, 10)
    assert.match(html, /Trang sau/)
    assert.doesNotMatch(html, /Sửa Món 11/)
  } finally {
    cache.clear()
  }
})
test('admin creation uses only master categories and hides personal visibility/category creation controls', () => {
  const cache = client()
  cache.setQueryData(['admin-categories'], {
    DT: [{ categoryId: 2, categoryName: 'Danh mục chuẩn' }],
  })
  cache.setQueryData(['categories', null], {
    DT: [{ categoryId: 5, categoryName: 'Danh mục cá nhân' }],
  })
  try {
    const html = render(cache, Form, '/admin/recipes/create', { admin: true })
    assert.match(html, /Thêm công thức chuẩn/)
    assert.match(html, /Danh mục chuẩn/)
    assert.doesNotMatch(
      html,
      /Danh mục cá nhân|Công khai công thức|\+ Tạo danh mục/,
    )
  } finally {
    cache.clear()
  }
})
test('successful soft deletion calls the admin endpoint and invalidates all affected cached views', async () => {
  const cache = client(),
    original = api.deleteAdminRecipe
  let mutation, request
  const keys = [
    ['admin-recipes', {}],
    ['recipes', {}],
    ['home-recipes'],
    ['my-recipes'],
    ['favorites'],
    ['recipe-list', 5],
    ['recipe-lists'],
    ['recipe', '7'],
    ['recipe', 7],
  ]
  keys.forEach((key) => cache.setQueryData(key, {}))
  api.deleteAdminRecipe = async (id) => {
    request = id
    return { EC: 0 }
  }
  function Harness() {
    mutation = hooks.useDeleteAdminRecipe()
    return null
  }
  try {
    render(cache, Harness)
    await mutation.mutateAsync(7)
    assert.equal(request, 7)
    for (const key of keys)
      assert.equal(
        cache.getQueryState(key).isInvalidated,
        true,
        JSON.stringify(key),
      )
  } finally {
    api.deleteAdminRecipe = original
    cache.clear()
  }
})
