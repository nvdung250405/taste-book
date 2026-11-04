import { isQualitativeUnit } from './shoppingList.js'
export function formatIngredientQuantity(quantity, ratio = 1, unit = '') {
  if (isQualitativeUnit(unit)) return ''
  if (quantity === null || quantity === undefined || quantity === '') return ''
  const value = Number(quantity) * ratio
  if (!Number.isFinite(value)) return ''
  return String(Number(value.toFixed(4)))
}
