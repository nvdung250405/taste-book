export const NETWORK_ERROR_MESSAGE =
  'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng và thử lại!'
export const TIMEOUT_ERROR_MESSAGE =
  'Kết nối đến máy chủ quá lâu. Vui lòng thử lại!'

export function connectionError(timeout = false) {
  const message = timeout ? TIMEOUT_ERROR_MESSAGE : NETWORK_ERROR_MESSAGE
  return Object.assign(new Error(message), {
    EM: message,
    isNetworkError: true,
  })
}
