import {
  Users,
  UtensilsCrossed,
  BookOpenCheck,
  Activity,
  ArrowUpRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { useAdminUsers } from '../../hooks/queries/useUserQueries'
import { useRecipes } from '../../hooks/queries/useRecipeQueries'

export default function DashboardPage() {
  const { data: usersRes, isLoading: loadingUsers } = useAdminUsers()
  const { data: recipesRes, isLoading: loadingRecipes } = useRecipes()

  const totalUsers = usersRes?.DT?.users?.length ?? '—'
  const totalRecipes = recipesRes?.DT?.length ?? recipesRes?.DT?.recipes?.length ?? '—'

  const STATS = [
    {
      title: 'Tổng người dùng',
      value: loadingUsers ? '...' : totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      note: 'Tài khoản đã đăng ký',
    },
    {
      title: 'Tổng công thức',
      value: loadingRecipes ? '...' : totalRecipes,
      icon: UtensilsCrossed,
      color: 'text-orange-500',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      note: 'Công thức đã được duyệt',
    },
    {
      title: 'Công thức chờ duyệt',
      value: '—',
      icon: BookOpenCheck,
      color: 'text-yellow-500',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      note: 'API chưa hỗ trợ',
    },
    {
      title: 'Lượt truy cập',
      value: '—',
      icon: Activity,
      color: 'text-green-500',
      bg: 'bg-green-100 dark:bg-green-900/30',
      note: 'API chưa hỗ trợ',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Tổng quan hệ thống</h1>
        <p className="text-slate-500">Xin chào Admin, đây là tình hình hoạt động của TasteBook.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx} className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  {stat.value !== '—' && stat.value !== '...' && (
                    <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full text-green-600 bg-green-50 dark:bg-green-900/20">
                      <ArrowUpRight className="w-3 h-3" />
                      Dữ liệu thật
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.note}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Người dùng gần đây
            </CardTitle>
            <CardDescription>Danh sách tài khoản mới đăng ký</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <p className="text-slate-400 text-sm">Đang tải...</p>
            ) : (
              <div className="space-y-3">
                {(usersRes?.DT?.users || []).slice(0, 5).map((user) => (
                  <div key={user.userId} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
                      {(user.username || 'U').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user.username}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      user.role === 'Admin'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
                {(usersRes?.DT?.users?.length || 0) === 0 && (
                  <p className="text-slate-400 text-sm">Không có người dùng nào.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Recipes */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-500" />
              Công thức gần đây
            </CardTitle>
            <CardDescription>Công thức đã được duyệt và công khai</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRecipes ? (
              <p className="text-slate-400 text-sm">Đang tải...</p>
            ) : (
              <div className="space-y-3">
                {(recipesRes?.DT?.recipes || recipesRes?.DT || []).slice(0, 5).map((recipe, idx) => (
                  <div key={recipe.id || idx} className="flex items-center gap-3">
                    {recipe.thumbnailUrl ? (
                      <img src={recipe.thumbnailUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                        <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{recipe.title}</p>
                      <p className="text-xs text-slate-400">{recipe.cookTimeMinutes} phút · {recipe.difficulty}</p>
                    </div>
                  </div>
                ))}
                {(recipesRes?.DT?.recipes || recipesRes?.DT || []).length === 0 && (
                  <p className="text-slate-400 text-sm">Chưa có công thức nào được duyệt.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
