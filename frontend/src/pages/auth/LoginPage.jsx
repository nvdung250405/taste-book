import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { toast } from 'sonner'
import { UtensilsCrossed, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useLogin } from '../../hooks/queries/useAuthQueries'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { mutate: login, isPending: isLoading } = useLogin()

  const handleLogin = (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    login(
      { valueLogin: email, email, password },
      {
        onSuccess: () => {
          toast.success('Đăng nhập thành công!')
          navigate('/')
        },
        onError: (error) => {
          toast.error(error.EM || error.response?.data?.EM || 'Đăng nhập thất bại')
        },
      },
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Bên trái - Ảnh & Thương hiệu */}
        <div className="hidden md:flex flex-col justify-between bg-slate-900 p-8 relative overflow-hidden group">
          {/* Ảnh nền trang trí */}
          <div className="absolute inset-0 bg-[url('/images/auth-login-bg.jpg')] bg-cover bg-center opacity-40 transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          <div className="relative z-10 flex items-center gap-2 text-white">
            <UtensilsCrossed className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold tracking-tight">TasteBook</span>
          </div>

          <div className="relative z-10 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg font-medium text-white/90">
                "Nấu ăn không chỉ là chuẩn bị thức ăn, đó là cách bạn thể hiện
                tình yêu với những người xung quanh."
              </p>
              <footer className="text-sm text-orange-400">
                Khám phá hàng ngàn công thức mỗi ngày
              </footer>
            </blockquote>
          </div>
        </div>

        {/* Bên phải - Form đăng nhập */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="mx-auto w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Đăng nhập
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nhập email và mật khẩu của bạn để truy cập tài khoản
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="email"
                >
                  Email hoặc Số điện thoại
                </label>
                <Input
                  id="email"
                  type="text"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    className="text-sm font-medium leading-none"
                    htmlFor="password"
                  >
                    Mật khẩu
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-orange-500 hover:text-orange-600 hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-500">
              Bạn chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="font-semibold text-orange-500 hover:text-orange-600 underline-offset-4 hover:underline"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
