import assert from 'node:assert/strict'
import { after, afterEach, before, beforeEach, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createServer } from 'vite'

let server
let AdminRoute
let queryClient
let storageDescriptor
let token

before(async () => {
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
  })
  AdminRoute = (
    await server.ssrLoadModule('/src/components/auth/AdminRoute.jsx')
  ).default
})

after(async () => {
  await server?.close()
})

beforeEach(() => {
  token = 'header.' + btoa(JSON.stringify({ exp: 9999999999 })) + '.signature'
  storageDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    'localStorage',
  )
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: (key) => (key === 'token' ? token : null) },
  })
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: Infinity, retry: false, retryOnMount: false },
    },
  })
})

afterEach(() => {
  queryClient.clear()
  if (storageDescriptor) {
    Object.defineProperty(globalThis, 'localStorage', storageDescriptor)
  } else {
    delete globalThis.localStorage
  }
})

function renderGuard() {
  let adminRendered = false
  let guardResult
  function GuardProbe() {
    guardResult = AdminRoute({ children: createElement(AdminPage) })
    return guardResult
  }
  function AdminPage() {
    adminRendered = true
    return createElement('p', null, 'Admin content')
  }
  const html = renderToString(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(
        MemoryRouter,
        { initialEntries: ['/admin/users'] },
        createElement(GuardProbe),
      ),
    ),
  )
  return { html, adminRendered, redirect: guardResult.props }
}

const accessKey = () => ['admin-access', token]

test('guest cannot mount admin pages even with a cached Admin profile', () => {
  token = null
  queryClient.setQueryData(['profile'], { DT: { role: 'Admin' } })
  const { html, adminRendered, redirect } = renderGuard()
  assert.equal(adminRendered, false)
  assert.equal(html, '')
  assert.equal(redirect.to, '/login')
  assert.equal(redirect.replace, true)
  assert.equal(redirect.state.from.pathname, '/admin/users')
})

test('waits for the profile without mounting admin pages', () => {
  const { html, adminRendered } = renderGuard()
  assert.equal(adminRendered, false)
  assert.match(html, /Đang kiểm tra quyền truy cập/)
})

for (const role of ['User', undefined, 'admin']) {
  test(`denies admin pages for the session's verified role ${String(role)}`, () => {
    queryClient.setQueryData(accessKey(), { DT: { role } })
    const { html, adminRendered } = renderGuard()
    assert.equal(adminRendered, false)
    assert.equal(html, '')
    assert.equal(renderGuard().redirect.to, '/403')
  })
}

test('same-session verified Admin remains mounted during background revalidation', () => {
  queryClient.setQueryData(accessKey(), { DT: { role: 'Admin' } })
  const { html, adminRendered } = renderGuard()
  assert.equal(adminRendered, true)
  assert.match(html, /Admin content/)
})

test('shows retry on profile failure even if the cached role is Admin', () => {
  queryClient.setQueryData(accessKey(), { DT: { role: 'Admin' } })
  queryClient
    .getQueryCache()
    .find({ queryKey: accessKey() })
    .setState({
      data: undefined,
      status: 'error',
      error: new Error('Network unavailable'),
    })
  const { html, adminRendered } = renderGuard()
  assert.equal(adminRendered, false)
  assert.match(html, /Không thể kiểm tra quyền truy cập/)
  assert.match(html, /Thử lại/)
})

test('background verification does not unmount verified admin content', () => {
  queryClient.setQueryData(accessKey(), { DT: { role: 'Admin' } })
  queryClient
    .getQueryCache()
    .find({ queryKey: accessKey() })
    .setState({ fetchStatus: 'fetching' })
  const { html, adminRendered } = renderGuard()
  assert.equal(adminRendered, true)
  assert.match(html, /Admin content/)
})

test('transient refresh failure preserves verified content with a retry banner', () => {
  queryClient.setQueryData(accessKey(), { DT: { role: 'Admin' } })
  queryClient
    .getQueryCache()
    .find({ queryKey: accessKey() })
    .setState({
      status: 'error',
      error: { EM: 'Mất kết nối tạm thời' },
      fetchStatus: 'idle',
    })
  const { html, adminRendered } = renderGuard()
  assert.equal(adminRendered, true)
  assert.match(html, /Chưa thể kiểm tra lại phiên đăng nhập/)
  assert.doesNotMatch(html, /Không thể kiểm tra quyền truy cập/)
})

test('a previous session or general profile cache cannot authorize a new token', () => {
  queryClient.setQueryData(['profile'], { DT: { role: 'Admin' } })
  queryClient.setQueryData(accessKey(), { DT: { role: 'Admin' } })
  token = 'new.' + btoa(JSON.stringify({ exp: 9999999999 })) + '.signature'
  const { html, adminRendered } = renderGuard()
  assert.equal(adminRendered, false)
  assert.match(html, /Đang kiểm tra quyền truy cập/)
})

for (const invalidToken of [
  'invalid',
  'h.' + btoa(JSON.stringify({ exp: 1 })) + '.s',
  'h.' + btoa(JSON.stringify({ role: 'Admin' })) + '.s',
]) {
  test(`rejects missing/invalid expiry even with cached Admin access: ${invalidToken}`, () => {
    token = invalidToken
    queryClient.setQueryData(accessKey(), { DT: { role: 'Admin' } })
    assert.equal(renderGuard().adminRendered, false)
    assert.equal(renderGuard().redirect.to, '/login')
  })
}
