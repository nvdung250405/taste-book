import { useCategories } from '../hooks/queries/useCategoryQueries'
import { useRecipes } from '../hooks/queries/useRecipeQueries'

import HeroSection from '../components/home/HeroSection'
import CategorySection from '../components/home/CategorySection'
import FeaturedRecipesSection from '../components/home/FeaturedRecipesSection'

function HomePage() {
  const { data: categoriesRes, isLoading: loadingCats } = useCategories()
  const { data: recipesRes, isLoading: loadingRecipes } = useRecipes({ limit: 6 })

  const categories = categoriesRes?.DT || []
  const recipes = Array.isArray(recipesRes?.DT) ? recipesRes.DT : (recipesRes?.DT?.items || recipesRes?.DT?.recipes || [])

  return (
    <div className="flex flex-col gap-12 pb-12 -mt-8">
      <HeroSection />
      
      <CategorySection 
        categories={categories} 
        loadingCats={loadingCats} 
      />
      
      <FeaturedRecipesSection 
        recipes={recipes} 
        loadingRecipes={loadingRecipes} 
      />
    </div>
  )
}

export default HomePage
