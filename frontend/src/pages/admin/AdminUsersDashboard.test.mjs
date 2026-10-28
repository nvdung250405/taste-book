import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createServer } from 'vite'

let server, Dashboard, Users, Detail
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null } })
  Dashboard = (await server.ssrLoadModule('/src/pages/admin/DashboardPage.jsx')).default
  Users = (await server.ssrLoadModule('/src/pages/admin/AdminUsersPage.jsx')).default
  Detail = (await server.ssrLoadModule('/src/components/admin/UserDetailDialog.jsx')).default
})
after(async () => { await server?.close() })
function client() { return new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false, retryOnMount: false } } }) }
function render(client, Component, entry = '/admin') {
  return renderToString(createElement(QueryClientProvider, { client }, createElement(MemoryRouter, { initialEntries: [entry] }, createElement(Component)))).replace(/<!--.*?-->/g, '')
}
const usersKey = ['admin-users', { page: 1, limit: 5 }]
const recipesKey = ['recipes', { page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'DESC' }]
test('dashboard uses global totals rather than the size of the five-row preview', () => {
  const cache = client()
  cache.setQueryData(usersKey, { DT: { total: 1234, users: [{ userId: 5, username: 'Lan', email: 'lan@example.test' }] } })
  cache.setQueryData(recipesKey, { DT: { total: 87, recipes: [] } })
  try {
    const html = render(cache, Dashboard)
    assert.ok(html.includes((1234).toLocaleString('vi-VN')))
    assert.match(html, />87</)
    assert.match(html, /Lan/)
    assert.doesNotMatch(html, /API chưa hỗ trợ|Lượt truy cập|Dữ liệu thật/)
    assert.equal(cache.getQueryCache().getAll().length, 2)
  } finally { cache.clear() }
})
test('dashboard renders real zero counts and errors without confusing them with empty data', () => {
  const cache = client()
  cache.setQueryData(usersKey, { DT: { total: 0, users: [] } })
  cache.setQueryData(recipesKey, { DT: { total: 0, recipes: [] } })
  try {
    assert.match(render(cache, Dashboard), />0</)
    cache.getQueryCache().find({ queryKey: usersKey }).setState({ status: 'error', error: new Error('Offline') })
    const html = render(cache, Dashboard)
    assert.match(html, /Không thể tải dữ liệu người dùng/)
    assert.doesNotMatch(html, /Chưa có người dùng nào/)
  } finally { cache.clear() }
})
test('users page applies server pagination and URL filters rather than slicing the first page', () => {
  const cache = client()
  const params = { page: 3, limit: 20, keyword: 'Lan', role: 'User' }
  cache.setQueryData(['admin-users', params], { DT: { users: [{ userId: 45, username: 'Lan', email: 'lan@example.test', role: 'User' }], total: 45, totalPages: 3 } })
  try {
    const html = render(cache, Users, '/admin/users?page=3&search=Lan&role=User')
    assert.match(html, /#45/)
    assert.match(html, /41–45/)
    assert.match(html, /Xem chi tiết Lan/)
    assert.match(html, /Trang trước/)
    assert.doesNotMatch(html, /Khóa|Mở khóa/)
    assert.equal(cache.getQueryCache().getAll().length, 1)
  } finally { cache.clear() }
})
test('detail query is scoped to the selected user and passes cancellation to the API', async () => {
  const cache = client()
  const api = (await server.ssrLoadModule('/src/api/users.api.js')).default
  const original = api.getUserById
  let called
  api.getUserById = async (id, options) => { called = { id, options }; return { DT: { userId: id } } }
  try {
    render(cache, () => createElement(Detail, { userId: 45, onClose() {} }))
    const query = cache.getQueryCache().find({ queryKey: ['admin-user', 45] })
    await cache.fetchQuery(query.options)
    assert.equal(called.id, 45)
    assert.ok(called.options.signal)
  } finally { api.getUserById = original; cache.clear() }
})
