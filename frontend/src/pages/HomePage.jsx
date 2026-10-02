import { useCategories } from '../hooks/queries/useCategoryQueries'
import { useRecipes } from '../hooks/queries/useRecipeQueries'

import HeroSection from '../components/home/HeroSection'
import CategorySection from '../components/home/CategorySection'
import { LatestRecipesSection, TrendingRecipesSection } from '../components/home/FeaturedRecipesSection'

const extractRecipes = (res) =>
  Array.isArray(res?.DT) ? res.DT : (res?.DT?.items || res?.DT?.recipes || [])

function HomePage() {
  const { data: categoriesRes, isLoading: loadingCats } = useCategories()

  // Mới nhất
  const { data: latestRes, isLoading: loadingLatest } = useRecipes(
    { limit: 6, sort: 'newest' },
    { staleTime: 1000 * 60 * 2 }
  )

  // Thịnh hành
  const { data: trendingRes, isLoading: loadingTrending } = useRecipes(
    { limit: 6, sort: 'popular' },
    { staleTime: 1000 * 60 * 2 }
  )

  const categories = categoriesRes?.DT || []
  const latestRecipes = extractRecipes(latestRes)
  const trendingRecipes = extractRecipes(trendingRes)

  return (
    <div className="flex flex-col gap-12 pb-16 -mt-8">
      <HeroSection />

      <CategorySection
        categories={categories}
        loadingCats={loadingCats}
      />

      <LatestRecipesSection
        recipes={latestRecipes}
        isLoading={loadingLatest}
      />

      <TrendingRecipesSection
        recipes={trendingRecipes}
        isLoading={loadingTrending}
      />
    </div>
  )
}

export default HomePage
