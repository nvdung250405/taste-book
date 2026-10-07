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
  AdminRoute = (await server.ssrLoadModule('/src/components/auth/AdminRoute.jsx')).default
})

after(async () => { await server?.close() })

beforeEach(() => {
  token = 'test-token'
  storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: (key) => key === 'token' ? token : null },
  })
  queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false, retryOnMount: false } },
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
  function AdminPage() {
    adminRendered = true
    return createElement('p', null, 'Admin content')
  }
  const html = renderToString(createElement(QueryClientProvider, { client: queryClient },
    createElement(MemoryRouter, { initialEntries: ['/admin/users'] },
      createElement(AdminRoute, null, createElement(AdminPage)),
    ),
  ))
  return { html, adminRendered }
}

test('guest cannot mount admin pages even with a cached Admin profile', () => {
  token = null
  queryClient.setQueryData(['profile'], { DT: { role: 'Admin' } })
  const { html, adminRendered } = renderGuard()
  assert.equal(adminRendered, false)
  assert.equal(html, '')
})

test('waits for the profile without mounting admin pages', () => {
  const { html, adminRendered } = renderGuard()
  assert.equal(adminRendered, false)
  assert.match(html, /Đang kiểm tra quyền truy cập/)
})

for (const role of ['User', undefined, 'admin']) {
  test(`denies access for role ${String(role)}`, () => {
    queryClient.setQueryData(['profile'], { DT: { role } })
    const { html, adminRendered } = renderGuard()
    assert.equal(adminRendered, false)
    assert.match(html, /Bạn không có quyền truy cập/)
  })
}

test('allows a verified Admin profile to mount admin pages', () => {
  queryClient.setQueryData(['profile'], { DT: { role: 'Admin' } })
  assert.equal(renderGuard().adminRendered, true)
})

test('shows retry on profile failure even if the cached role is Admin', () => {
  queryClient.setQueryData(['profile'], { DT: { role: 'Admin' } })
  queryClient.getQueryCache().find({ queryKey: ['profile'] }).setState({
    status: 'error', error: new Error('Network unavailable'),
  })
  const { html, adminRendered } = renderGuard()
  assert.equal(adminRendered, false)
  assert.match(html, /Không thể kiểm tra quyền truy cập/)
  assert.match(html, /Thử lại/)
})

test('does not allow cached admin data while the profile is being refreshed', () => {
  queryClient.setQueryData(['profile'], { DT: { role: 'Admin' } })
  queryClient.getQueryCache().find({ queryKey: ['profile'] }).setState({ fetchStatus: 'fetching' })
  const { html, adminRendered } = renderGuard()
  assert.equal(adminRendered, false)
  assert.match(html, /Đang kiểm tra quyền truy cập/)
})
