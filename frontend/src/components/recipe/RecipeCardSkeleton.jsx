import { Card, CardContent } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

export default function RecipeCardSkeleton() {
  return (
    <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full">
      {/* Thumbnail skeleton */}
      <Skeleton className="w-full h-52 shrink-0 rounded-none" />
      
      <CardContent className="p-5 flex flex-col flex-1 space-y-4">
        {/* Title skeleton */}
        <div className="space-y-2 flex-1 mt-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>
        
        {/* Bottom meta info skeleton */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}
