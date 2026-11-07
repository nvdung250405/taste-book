export const isVietnamesePhone = (value) =>
  /^(0|\+84)[35789][0-9]{8}$/.test(String(value).trim())
export const normalizePhone = (value) => {
  const phone = String(value || '').trim()
  return isVietnamesePhone(phone) && phone.startsWith('+84')
    ? '0' + phone.slice(3)
    : phone
}
