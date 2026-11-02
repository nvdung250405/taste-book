import { QueryClient } from '@tanstack/react-query'

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { refetchOnWindowFocus: false, retry: 1 },
      // Fail a user action immediately offline, never pause/replay it on reconnect.
      mutations: { networkMode: 'always', retry: false },
    },
  })
}
