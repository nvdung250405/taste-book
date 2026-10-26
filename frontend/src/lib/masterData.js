export const normalizeMasterName = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toLowerCase()

export function validateMasterData(values, fields, records, idKey, currentId) {
  const errors = {}
  const data = {}
  for (const field of fields) {
    const value = String(values[field.key] ?? '').trim()
    if (field.options) {
      if (!field.options.some((option) => String(option.value) === value))
        errors[field.key] = `Vui lòng chọn ${field.label.toLowerCase()} hợp lệ.`
      else data[field.key] = Number(value)
    } else {
      data[field.key] = value
      if (!value)
        errors[field.key] = `Vui lòng nhập ${field.label.toLowerCase()}.`
      else if (value.length > field.maxLength)
        errors[field.key] = `Tối đa ${field.maxLength} ký tự.`
      else if (
        records.some(
          (record) =>
            String(record[idKey]) !== String(currentId) &&
            normalizeMasterName(record[field.key]) ===
              normalizeMasterName(value),
        )
      )
        errors[field.key] = 'Tên đã tồn tại. Vui lòng chọn tên khác.'
    }
  }
  return { data, errors }
}
