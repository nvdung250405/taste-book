export const isMissingMenu = error => error?.EC === 3 || error?.httpStatus === 404 || error?.response?.status === 404
