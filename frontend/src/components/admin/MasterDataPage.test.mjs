import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createServer } from 'vite'

let server
before(async () => { server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } }) })
after(async () => { await server?.close() })

for (const [file, key, idKey, nameKey, label] of [
  ['AdminCategoriesPage', 'admin-categories', 'categoryId', 'categoryName', 'danh mục'],
  ['AdminIngredientsPage', 'ingredients', 'ingredientId', 'ingredientName', 'nguyên liệu'],
  ['AdminUnitsPage', 'units', 'unitId', 'unitName', 'đơn vị tính'],
]) {
  test(`${file} renders a searchable table with 10 rows, edit/delete actions and pagination`, async () => {
    const Page = (await server.ssrLoadModule(`/src/pages/admin/${file}.jsx`)).default
    const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } })
    const rows = Array.from({ length: 12 }, (_, index) => ({ [idKey]: index + 1, [nameKey]: `Record ${index + 1}` }))
    client.setQueryData(key === 'ingredients' ? [key, {}] : [key], { EC: 0, DT: rows })
    if (key === 'ingredients') {
      client.setQueryData(['ingredient-categories'], { EC: 0, DT: [] })
      client.setQueryData(['units'], { EC: 0, DT: [] })
    }
    try {
      const html = renderToString(createElement(QueryClientProvider, { client }, createElement(Page)))
      assert.match(html, /<table/)
      assert.ok(html.includes(`Tìm kiếm ${label}`))
      assert.match(html, /Thêm /)
      assert.equal((html.match(/aria-label="Sửa Record/g) || []).length, 10)
      assert.equal((html.match(/aria-label="Xóa Record/g) || []).length, 10)
      assert.match(html, /Trang sau/)
      assert.doesNotMatch(html, /Record 11/)
    } finally { client.clear() }
  })
}
