// Public recipe DTOs omit createdBy. Match against verified system category IDs.
export function publicRecipeCategories(recipe, systemCategories = []) {
  const ids = new Set(systemCategories.filter(category => category.createdBy === null).map(category => String(category.categoryId ?? category.id)))
  return (recipe.categories || recipe.tags || []).filter(category => ids.has(String(category.categoryId ?? category.id)))
}
