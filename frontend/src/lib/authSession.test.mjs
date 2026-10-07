import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { QueryClient, QueryObserver } from '@tanstack/react-query'
import { clearAuthSession } from './authSession.js'

let queryClient
let storageDescriptor

beforeEach(() => {
  const storage = new Map([
    ['token', 'expired-token'],
    ['user', JSON.stringify({ userId: 1 })],
    ['theme', 'dark'],
  ])
  storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => storage.get(key) ?? null,
      removeItem: (key) => storage.delete(key),
    },
  })
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})

afterEach(() => {
  queryClient.clear()
  if (storageDescriptor) {
    Object.defineProperty(globalThis, 'localStorage', storageDescriptor)
  } else {
    delete globalThis.localStorage
  }
})

test('clears session credentials and all cached user data', () => {
  queryClient.setQueryData(['profile'], { DT: { userId: 1 } })
  queryClient.setQueryData(['favorites', {}], { DT: [{ recipeId: 10 }] })
  queryClient.setQueryData(['my-recipes', {}], { DT: [{ recipeId: 20 }] })

  clearAuthSession(queryClient)

  assert.equal(localStorage.getItem('token'), null)
  assert.equal(localStorage.getItem('user'), null)
  assert.equal(localStorage.getItem('theme'), 'dark')
  assert.equal(queryClient.getQueryCache().getAll().length, 0)
})

test('notifies an already mounted profile observer that the user is signed out', () => {
  queryClient.setQueryData(['profile'], { DT: { userId: 1 } })
  const observer = new QueryObserver(queryClient, {
    queryKey: ['profile'],
    enabled: false,
  })
  const results = []
  const unsubscribe = observer.subscribe((result) => results.push(result.data))

  clearAuthSession(queryClient)

  assert.equal(results.at(-1), null)
  assert.equal(observer.getCurrentResult().data, null)
  unsubscribe()
})

test('a pending query cannot restore data after the session is cleared', async () => {
  let resolveRequest
  const request = new Promise((resolve) => { resolveRequest = resolve })
  const pendingQuery = queryClient.fetchQuery({
    queryKey: ['profile'],
    queryFn: () => request,
  }).catch(() => undefined)

  clearAuthSession(queryClient)
  resolveRequest({ DT: { userId: 1 } })
  await pendingQuery

  assert.equal(queryClient.getQueryData(['profile']), undefined)
  assert.equal(queryClient.getQueryCache().getAll().length, 0)
})
