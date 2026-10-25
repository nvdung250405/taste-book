export function recipeStatus(recipe) {
  if (!recipe.isPublic) return 'draft'
  const status = (recipe.approvalStatus || '').toLowerCase()
  return ['approved', 'pending', 'rejected'].includes(status) ? status : 'draft'
}

export function recipeCounts(recipes) {
  const counts = {
    all: recipes.length,
    approved: 0,
    pending: 0,
    rejected: 0,
    draft: 0,
  }
  recipes.forEach((recipe) => {
    counts[recipeStatus(recipe)]++
  })
  return counts
}

export function filterRecipes(recipes, status, search) {
  const keyword = search.trim().toLowerCase()
  return recipes.filter(
    (recipe) =>
      (status === 'all' || recipeStatus(recipe) === status) &&
      (recipe.title || '').toLowerCase().includes(keyword),
  )
}

export function filterFavorites(favorites, search) {
  const keyword = search.trim().toLowerCase()
  return favorites.filter((favorite) => {
    const recipe = favorite.recipe || favorite
    return [
      recipe.title,
      recipe.author?.name,
      recipe.author?.username,
      recipe.user?.name,
      favorite.personalNotes,
      favorite.note,
    ].some((value) => (value || '').toLowerCase().includes(keyword))
  })
}
