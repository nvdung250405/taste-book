import {
  Users,
  UtensilsCrossed,
  BookOpenCheck,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'

const STATS = [
  {
    title: 'Tổng người dùng',
    value: '1,234',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    title: 'Tổng công thức',
    value: '8,549',
    change: '+5%',
    trend: 'up',
    icon: UtensilsCrossed,
    color: 'text-orange-500',
    bg: 'bg-orange-100 dark:bg-orange-900/30'
  },
  {
    title: 'Chờ duyệt',
    value: '23',
    change: '-2',
    trend: 'down',
    icon: BookOpenCheck,
    color: 'text-yellow-500',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30'
  },
  {
    title: 'Lượt truy cập',
    value: '45.2K',
    change: '+18%',
    trend: 'up',
    icon: Activity,
    color: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-900/30'
  }
]

const RECENT_ACTIVITIES = [
  { id: 1, user: 'Nguyễn Văn A', action: 'vừa tạo công thức mới', target: 'Phở bò Hà Nội', time: '5 phút trước' },
  { id: 2, user: 'Trần Thị B', action: 'đã đăng ký tài khoản', target: '', time: '12 phút trước' },
  { id: 3, user: 'Admin', action: 'đã duyệt công thức', target: 'Salad giảm cân', time: '1 giờ trước' },
  { id: 4, user: 'Lê Văn C', action: 'đã lưu công thức', target: 'Bún chả', time: '2 giờ trước' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Tổng quan hệ thống</h1>
        <p className="text-slate-500">Xin chào Admin, đây là tình hình hoạt động của TasteBook hôm nay.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, idx) => {
          const Icon = stat.icon
          const isUp = stat.trend === 'up'
          return (
            <Card key={idx} className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                    isUp ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'
                  }`}>
                    {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Tăng trưởng người dùng</CardTitle>
            <CardDescription>Thống kê trong 7 ngày gần nhất</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[250px] bg-slate-50 dark:bg-slate-900/50 rounded-xl mx-6 mb-6 border border-dashed border-slate-200 dark:border-slate-700">
            <TrendingUp className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500">Biểu đồ đang được cập nhật...</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {RECENT_ACTIVITIES.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-orange-500 shrink-0 relative after:absolute after:w-0.5 after:h-full after:bg-slate-200 dark:after:bg-slate-700 after:left-1/2 after:-translate-x-1/2 after:top-3 last:after:hidden" />
                  <div>
                    <p className="text-sm text-slate-900 dark:text-slate-200">
                      <span className="font-semibold">{activity.user}</span> {activity.action} {activity.target && <span className="font-medium text-orange-500">"{activity.target}"</span>}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
