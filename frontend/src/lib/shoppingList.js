const normalize = value => String(value || '').normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi-VN')
export const isQualitativeUnit = unit => ['vừa đủ', 'tùy khẩu vị', 'vừa vừa', 'nêm nếm'].includes(normalize(unit))
export function conflictingUnits(items) {
  const groups = new Map()
  for (const item of items) {
    const key = normalize(item.itemName)
    if (!groups.has(key)) groups.set(key, new Set())
    groups.get(key).add(normalize(item.unit))
  }
  return new Set(items.filter(item => groups.get(normalize(item.itemName)).size > 1).map(item => item.itemId))
}
export function customItemPayload(name, quantity, unit) {
  if (!name.trim() || name.trim().length > 255) throw new Error('Nhập tên nguyên liệu từ 1 đến 255 ký tự.')
  if (!unit.trim() || unit.trim().length > 255) throw new Error('Nhập đơn vị từ 1 đến 255 ký tự.')
  const input = String(quantity).trim().replace(',', '.')
  const qualitative = isQualitativeUnit(unit)
  if (qualitative && input === '') return { itemName: name.trim(), unit: unit.trim() }
  if (!/^\d+(?:\.\d+)?$/.test(input)) throw new Error('Nhập số lượng hợp lệ, ví dụ 1 hoặc 1,5.')
  const [whole, fraction = ''] = input.split('.')
  const cents = BigInt(whole) * 100n + BigInt((fraction + '00').slice(0, 2)) + (Number(fraction[2] || 0) >= 5 ? 1n : 0n)
  if (!qualitative && (cents < 1n || cents > 9999999999n)) throw new Error('Số lượng sau làm tròn phải từ 0,01 đến 99.999.999,99.')
  const totalQuantity = qualitative ? 0 : Number(cents) / 100
  return { itemName: name.trim(), totalQuantity, unit: unit.trim() }
}
