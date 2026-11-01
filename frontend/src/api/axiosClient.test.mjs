import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { QueryClient } from '@tanstack/react-query'
import { createServer } from 'vite'

let server, api
const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
before(async () => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => null },
  })
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
  })
  api = (await server.ssrLoadModule('/src/api/axiosClient.js')).default
})
after(async () => {
  await server?.close()
  if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
  else delete globalThis.localStorage
})
const adapter = (data) => async (config) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
})

test('HTTP 200 with a business error reaches React Query error state', async () => {
  const error = { EC: 2, EM: 'Already saved', DT: null }
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  try {
    await assert.rejects(
      client.fetchQuery({
        queryKey: ['business-error'],
        queryFn: () => api.get('/test', { adapter: adapter(error) }),
      }),
      (value) => value === error,
    )
    assert.equal(client.getQueryState(['business-error']).status, 'error')
  } finally {
    client.clear()
  }
})
test('successful envelopes and non-envelope payloads are preserved', async () => {
  for (const data of [{ EC: 0, DT: [1] }, { message: 'ok' }, null]) {
    assert.deepEqual(await api.get('/test', { adapter: adapter(data) }), data)
  }
})
test('transport failures preserve their API error message', async () => {
  const data = { EC: 1, EM: 'Invalid input' }
  await assert.rejects(
    api.get('/test', {
      adapter: async () => {
        throw { response: { status: 400, data } }
      },
    }),
    (error) => error === data,
  )
})

test('API 403 signals forbidden navigation only inside the admin path segment', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window')
  const browser = new EventTarget()
  let denied = 0
  browser.addEventListener('forbidden', () => denied++)
  Object.defineProperty(globalThis, 'window', { configurable: true, value: browser })
  const data = { EC: 4, EM: 'Forbidden' }
  try {
    for (const pathname of ['/admin/users', '/admin/unknown/deep', '/administrator', '/search']) {
      browser.location = { pathname }
      await assert.rejects(api.get('/admin/users', {
        adapter: async () => { throw { response: { status: 403, data } } },
      }), error => error === data)
    }
    assert.equal(denied, 2)
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor)
    else delete globalThis.window
  }
})
