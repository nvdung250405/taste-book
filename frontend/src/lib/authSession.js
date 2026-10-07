export function clearAuthSession(queryClient) {
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  // Notify mounted profile consumers before removing the cached queries.
  queryClient.setQueryData(['profile'], null)
  // Also cancels pending queries so their results cannot restore old user data.
  queryClient.clear()
}
