import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { createServer } from 'vite'

let server, ProtectedRoute
const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
before(async () => {
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
  })
  ProtectedRoute = (
    await server.ssrLoadModule('/src/components/auth/ProtectedRoute.jsx')
  ).default
})
after(async () => {
  await server?.close()
  if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
  else delete globalThis.localStorage
})

function render(token) {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => token },
  })
  return renderToString(
    createElement(
      MemoryRouter,
      { initialEntries: ['/profile?tab=settings'] },
      createElement(
        Routes,
        null,
        createElement(
          Route,
          { element: createElement(ProtectedRoute) },
          createElement(Route, {
            path: '/profile',
            element: createElement('p', null, 'Private content'),
          }),
        ),
      ),
    ),
  )
}
const jwt = (payload) =>
  `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`
for (const token of [
  null,
  '',
  'broken',
  jwt({}),
  jwt({ exp: 1 }),
  jwt({ exp: '9999999999' }),
]) {
  test(`does not mount private pages for invalid session ${token}`, () => {
    assert.equal(render(token), '')
  })
}
test('a non-expired session can mount the nested private route', () => {
  assert.match(
    render(jwt({ exp: Date.now() / 1000 + 3600 })),
    /Private content/,
  )
})
