const sameName = (a, b) =>
  a.trim().toLocaleLowerCase('vi') === b.trim().toLocaleLowerCase('vi')

export function changeRecipeIngredient(row, field, value, ingredients, units) {
  if (field === 'name') {
    const matches = ingredients.filter((item) =>
      sameName(item.ingredientName, value),
    )
    const match = matches.length === 1 ? matches[0] : null
    return {
      ...row,
      name: value,
      ingredientId: match?.ingredientId || null,
      unit: match ? match.defaultUnit?.unitName || '' : row.unit,
      unitId: match ? match.defaultUnit?.unitId || null : row.unitId,
    }
  }
  if (field === 'unit') {
    const match = units.find((item) => sameName(item.unitName, value))
    return {
      ...row,
      unit: value,
      unitId: match?.unitId || null,
      ingredientId: null,
    }
  }
  return { ...row, [field]: value }
}

export function recipeIngredientPayload(row) {
  const quantity = Number(row.quantity)
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
