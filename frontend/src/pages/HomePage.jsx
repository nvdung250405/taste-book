import { useCategories } from '../hooks/queries/useCategoryQueries'
import { useHomeRecipes } from '../hooks/queries/useRecipeQueries'
import HeroSection from '../components/home/HeroSection'
import CategorySection from '../components/home/CategorySection'
import { LatestRecipesSection, TrendingRecipesSection } from '../components/home/FeaturedRecipesSection'
import QueryError from '../components/ui/QueryError'

export default function HomePage() {
  const categories = useCategories()
  const home = useHomeRecipes()
  return <div className="flex flex-col gap-12 pb-16 -mt-8">
    <HeroSection />
    {categories.isError ? <QueryError title="Không thể tải danh mục" onRetry={categories.refetch} isRetrying={categories.isFetching} /> : <CategorySection categories={categories.data?.DT || []} loadingCats={categories.isLoading} />}
    {home.isError ? <QueryError title="Không thể tải công thức trang chủ" onRetry={home.refetch} isRetrying={home.isFetching} /> : <>
      <LatestRecipesSection recipes={home.data?.DT?.latestRecipes || []} isLoading={home.isLoading} />
      <TrendingRecipesSection recipes={home.data?.DT?.trendingRecipes || []} isLoading={home.isLoading} />
    </>}
  </div>
}
