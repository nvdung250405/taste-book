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

test('logout transport sends the current Bearer token without clearing it early', async () => {
  const previous = globalThis.localStorage.getItem
  globalThis.localStorage.getItem = key => key === 'token' ? 'current-token' : null
  try {
    await api.post('/auth/logout', undefined, { adapter: async config => {
      assert.equal(config.headers.Authorization, 'Bearer current-token')
      assert.equal(localStorage.getItem('token'), 'current-token')
      return { data: { EC: 0 }, status: 200, statusText: 'OK', headers: {}, config }
    } })
  } finally { globalThis.localStorage.getItem = previous }
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

test('network/timeout errors become Vietnamese messages and cancellation stays cancellation', async () => {
  for (const [code, pattern] of [['ERR_NETWORK', /đường truyền mạng/], ['ECONNABORTED', /quá lâu/]]) {
    await assert.rejects(api.post('/test', {}, { adapter: async config => {
      assert.equal(config.timeout, 15000)
      throw Object.assign(new Error('Network Error'), { code })
    } }), error => error.isNetworkError && pattern.test(error.EM))
  }
  const cancelled = { __CANCEL__: true, message: 'canceled' }
  await assert.rejects(api.get('/test', { adapter: async () => { throw cancelled } }), error => error === cancelled)
})

test('offline writes fail immediately before a request is sent', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: false } })
  let requests = 0
  try {
    await assert.rejects(api.post('/test', {}, { adapter: async () => { requests++; return {} } }), error => /đường truyền mạng/.test(error.EM))
    assert.equal(requests, 0)
  } finally {
    if (previous) Object.defineProperty(globalThis, 'navigator', previous)
    else delete globalThis.navigator
  }
})

test('rate limiting retains Retry-After for permission checks without retrying early', async () => {
  await assert.rejects(api.get('/users/me', { adapter: async () => {
    throw { response: { status: 429, headers: { 'retry-after': '180', 'x-ratelimit-policy': 'login' }, data: { EC: 6 } } }
  } }), error => error.httpStatus === 429 && error.retryAfterSeconds === 180 && /180 giây/.test(error.EM))
})

test('a global429 blocks further API requests locally until the cooldown expires', async () => {
  let requests = 0
  await assert.rejects(api.get('/categories', { adapter: async () => {
    requests++
    throw { response: { status: 429, headers: { 'retry-after': '0.05', 'x-ratelimit-policy': 'api' }, data: {} } }
  } }), error => error.httpStatus === 429)
  await assert.rejects(api.get('/recipes', { adapter: async () => { requests++; return {} } }), error => error.httpStatus === 429)
  assert.equal(requests, 1)
  await new Promise(resolve => setTimeout(resolve, 70))
  assert.deepEqual(await api.get('/recipes', { adapter: adapter({ EC: 0, DT: [] }) }), { EC: 0, DT: [] })
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
