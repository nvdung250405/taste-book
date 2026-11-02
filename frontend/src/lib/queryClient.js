import { QueryClient } from '@tanstack/react-query'

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retryOnMount: false,
        retry: (attempt, error) => error?.httpStatus !== 429 && attempt < 1,
      },
      // Fail a user action immediately offline, never pause/replay it on reconnect.
      mutations: { networkMode: 'always', retry: false },
    },
  })
}
