import assert from 'node:assert/strict'
import { test } from 'node:test'
import { MutationObserver, onlineManager } from '@tanstack/react-query'
import { createAppQueryClient } from './queryClient.js'

test('offline mutations settle with error instead of pausing and replaying on reconnect', async () => {
  const client = createAppQueryClient()
  client.mount()
  const previous = onlineManager.isOnline()
  let calls = 0
  try {
    onlineManager.setOnline(false)
    const mutation = new MutationObserver(client, {
      mutationFn: async () => {
        calls++
        throw new Error('offline')
      },
    })
    await assert.rejects(mutation.mutate(), /offline/)
    assert.equal(mutation.getCurrentResult().isPending, false)
    assert.equal(mutation.getCurrentResult().isPaused, false)
    onlineManager.setOnline(true)
    await new Promise((resolve) => setTimeout(resolve, 20))
    assert.equal(calls, 1)
  } finally {
    client.unmount()
    client.clear()
    onlineManager.setOnline(previous)
  }
})

test('a rate-limited read is not retried automatically', async () => {
  const client = createAppQueryClient()
  let calls = 0
  try {
    await assert.rejects(
      client.fetchQuery({
        queryKey: ['limited'],
        queryFn: async () => {
          calls++
          throw { httpStatus: 429, retryAfterSeconds: 10 }
        },
      }),
      (error) => error.httpStatus === 429,
    )
    assert.equal(calls, 1)
  } finally {
    client.clear()
  }
})
