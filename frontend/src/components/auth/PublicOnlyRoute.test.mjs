import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement as h } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createServer } from 'vite'

let server, Guard
before(async () => {
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
  })
  Guard = (
    await server.ssrLoadModule('/src/components/auth/PublicOnlyRoute.jsx')
  ).default
})
after(async () => {
  await server?.close()
})

function render(token, data, failedRefresh = false, url = '/login') {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => token },
  })
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity } },
  })
  if (data) client.setQueryData(['profile'], data)
  if (failedRefresh) {
    client
      .getQueryCache()
      .find({ queryKey: ['profile'] })
      .setState({ status: 'error', error: new Error('Connection lost') })
  }
  try {
    return renderToString(
      h(
        QueryClientProvider,
        { client },
        h(
          MemoryRouter,
          { initialEntries: [url] },
          h(
            Routes,
            null,
            h(
              Route,
              { element: h(Guard) },
              h(Route, {
                path: url,
                element: h('form', null, 'Login form'),
              }),
            ),
          ),
        ),
      ),
    )
  } finally {
    client.clear()
    if (descriptor)
      Object.defineProperty(globalThis, 'localStorage', descriptor)
    else delete globalThis.localStorage
  }
}
const token = 'h.' + btoa(JSON.stringify({ exp: 9999999999 })) + '.s'
test('a guest can open auth forms even if old profile data remains cached', () => {
  assert.match(render(null, { DT: { role: 'Admin' } }), /Login form/)
})
test('valid token waits for server authentication instead of trusting a stored token alone', () => {
  assert.match(render(token), /Đang kiểm tra phiên đăng nhập/)
  assert.doesNotMatch(render(token), /Login form/)
})
test('verified Users and Admins do not mount the login form', () => {
  for (const role of ['User', 'Admin'])
    assert.doesNotMatch(render(token, { DT: { role } }), /Login form/)
})

test('failed profile refresh does not expose login/register for a cached signed-in session', () => {
  for (const url of ['/login', '/register']) {
    assert.doesNotMatch(
      render(token, { DT: { userId: 1, role: 'User' } }, true, url),
      /Login form/,
    )
  }
})

test('server-verified Header session is also honored for tokens the public guard cannot decode', () => {
  for (const value of [
    'opaque-access-token',
    'h.' + btoa(JSON.stringify({ exp: 1 })) + '.s',
  ]) {
    assert.doesNotMatch(
      render(value, { DT: { userId: 1, role: 'User' } }, false, '/register'),
      /Login form/,
    )
  }
})
