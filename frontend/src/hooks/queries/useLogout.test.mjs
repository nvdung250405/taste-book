import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createServer } from 'vite'

let server, api, useLogout
before(async () => {
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
  })
  api = (await server.ssrLoadModule('/src/api/auth.api.js')).default
  useLogout = (
    await server.ssrLoadModule('/src/hooks/queries/useAuthQueries.js')
  ).useLogout
})
after(async () => {
  await server?.close()
})
for (const offline of [false, true]) {
  test(`logout awaits server before clearing token and cache (offline=${offline})`, async () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'localStorage',
    )
    const storage = new Map([
      ['token', 'current-token'],
      ['user', 'old-user'],
    ])
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key) => storage.get(key),
        removeItem: (key) => storage.delete(key),
      },
    })
    const client = new QueryClient()
    client.setQueryData(['profile'], { DT: { username: 'Old user' } })
    let mutation,
      resolve,
      calls = 0
    const original = api.logout
    api.logout = async () => {
      calls++
      assert.equal(storage.get('token'), 'current-token')
      await new Promise((r) => {
        resolve = r
      })
      if (offline) throw new Error('Offline')
      return { EC: 0 }
    }
    function Harness() {
      mutation = useLogout()
      return null
    }
    try {
      renderToString(
        createElement(QueryClientProvider, { client }, createElement(Harness)),
      )
      const result = mutation.mutateAsync().catch((error) => error)
      while (!resolve) await new Promise((r) => setTimeout(r, 1))
      assert.equal(storage.get('token'), 'current-token')
      assert.ok(client.getQueryData(['profile']))
      resolve()
      await result
      assert.equal(calls, 1)
      assert.equal(storage.has('token'), false)
      assert.equal(storage.has('user'), false)
      assert.equal(client.getQueryCache().getAll().length, 0)
    } finally {
      api.logout = original
      client.clear()
      if (descriptor)
        Object.defineProperty(globalThis, 'localStorage', descriptor)
      else delete globalThis.localStorage
    }
  })
}
