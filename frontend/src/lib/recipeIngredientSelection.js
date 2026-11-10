import { isQualitativeUnit } from './shoppingList.js'
const sameName = (a, b) =>
  a.trim().toLocaleLowerCase('vi') === b.trim().toLocaleLowerCase('vi')

export function changeRecipeIngredient(row, field, value, ingredients, units) {
  if (field === 'ingredientId') {
    const match = ingredients.find(item => String(item.ingredientId) === String(value))
    if (!match) return { ...row, ingredientId: null }
    return {
      ...row,
      ...(match && isQualitativeUnit(match.defaultUnit?.unitName || '')
        ? { quantity: '' }
        : {}),
      name: match.ingredientName,
      ingredientId: match.ingredientId,
      unit: match.defaultUnit?.unitName || '',
      unitId: match.defaultUnit?.unitId || null,
    }
  }
  if (field === 'name') return { ...row, name: value, ingredientId: null }
  if (field === 'unit') {
    const match = units.find((item) => sameName(item.unitName, value))
    return {
      ...row,
      ...(isQualitativeUnit(value) ? { quantity: '' } : {}),
      unit: value,
      unitId: match?.unitId || null,
      ingredientId: null,
    }
  }
  return { ...row, [field]: value }
}

export function recipeIngredientPayload(row) {
  const quantity = isQualitativeUnit(row.unit) ? 0 : Number(row.quantity)
  return row.ingredientId
    ? { ingredientId: Number(row.ingredientId), quantity }
    : {
        customIngredientName: row.name,
        quantity,
        ...(row.unitId
          ? { unitId: Number(row.unitId) }
          : { customUnit: row.unit }),
      }
}
