import { Link } from 'react-router-dom'
import {
  Users,
  UtensilsCrossed,
  ArrowRight,
  RefreshCw,
  LayoutDashboard,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useAdminUsers } from '../../hooks/queries/useUserQueries'
import { useRecipes } from '../../hooks/queries/useRecipeQueries'
import QueryError from '../../components/ui/QueryError'
import {
  recipeImageProps,
  handleRecipeImageError,
} from '../../lib/recipeImages'

export default function DashboardPage() {
  const users = useAdminUsers({ page: 1, limit: 5 })
  const recipes = useRecipes(
    { page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'DESC' },
    { staleTime: 60 * 1000 },
  )
  const busy = users.isFetching || recipes.isFetching
  const stats = [
    {
      title: 'Tổng người dùng',
      query: users,
      icon: Users,
      note: 'Tài khoản đã đăng ký trên hệ thống',
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300',
    },
    {
      title: 'Công thức đã duyệt',
      query: recipes,
      icon: UtensilsCrossed,
      note: 'Công thức đã được duyệt và công khai',
      color:
        'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-300',
    },
  ]
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400">
            <LayoutDashboard className="h-4 w-4" />
            Không gian quản trị
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Tổng quan hệ thống
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Theo dõi tài khoản và các công thức mới nhất của TasteBook.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => {
            users.refetch()
            recipes.refetch()
          }}
        >
          <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map(({ title, query, icon: Icon, note, color }) => (
          <Card key={title} className="rounded-2xl">
            <CardContent className="flex items-center justify-between gap-4 px-6">
              <div>
                <h2 className="text-sm font-medium text-slate-500">{title}</h2>
                <p
                  aria-live="polite"
                  className="my-2 text-4xl font-bold tabular-nums"
                >
                  {query.isPending
                    ? '…'
                    : query.isError
                      ? '—'
                      : (query.data?.DT?.total ?? 0).toLocaleString('vi-VN')}
                </p>
                <p className="text-xs text-slate-500">{note}</p>
              </div>
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${color}`}
              >
                <Icon className="h-7 w-7" />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="min-w-0 rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg">Người dùng gần đây</CardTitle>
              <Link
                to="/admin/users"
                className="flex shrink-0 items-center gap-1 text-sm font-medium text-orange-700 hover:underline dark:text-orange-400"
              >
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <CardDescription>5 tài khoản mới đăng ký</CardDescription>
          </CardHeader>
          <CardContent>
            {users.isError ? (
              <QueryError
                title="Không thể tải dữ liệu người dùng"
                onRetry={users.refetch}
                isRetrying={users.isFetching}
              />
            ) : users.isPending ? (
              <p role="status" className="py-8 text-sm text-slate-500">
                Đang tải tài khoản…
              </p>
            ) : users.data?.DT?.users?.length ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.data.DT.users.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center gap-3 py-3"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                    >
                      {(user.username || 'U').charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {user.username}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-sm text-slate-500">
                Chưa có người dùng nào.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="min-w-0 rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg">Công thức gần đây</CardTitle>
              <Link
                to="/admin/approvals"
                className="flex shrink-0 items-center gap-1 text-sm font-medium text-orange-700 hover:underline dark:text-orange-400"
              >
                Kiểm duyệt
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <CardDescription>
              Công thức công khai mới nhất đã được duyệt
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recipes.isError ? (
              <QueryError
                title="Không thể tải dữ liệu công thức"
                onRetry={recipes.refetch}
                isRetrying={recipes.isFetching}
              />
            ) : recipes.isPending ? (
              <p role="status" className="py-8 text-sm text-slate-500">
                Đang tải công thức…
              </p>
            ) : recipes.data?.DT?.recipes?.length ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recipes.data.DT.recipes.map((recipe) => (
                  <Link
                    key={recipe.recipeId}
                    to={`/recipe/${recipe.recipeId}`}
                    className="flex items-center gap-3 rounded-lg py-3 hover:text-orange-600"
                  >
                    <img
                      {...recipeImageProps(recipe.thumbnailUrl)}
                      onError={handleRecipeImageError}
                      alt=""
                      loading="lazy"
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {recipe.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {recipe.cookTimeMinutes ?? '—'} phút ·{' '}
                        {{ Easy: 'Dễ', Medium: 'Trung bình', Hard: 'Khó' }[
                          recipe.difficulty
                        ] || recipe.difficulty}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-8 text-sm text-slate-500">
                Chưa có công thức công khai đã duyệt.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
