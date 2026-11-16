import { Link, useLocation } from 'react-router-dom'
import { ShieldX, ArrowLeft, LogIn } from 'lucide-react'
import { Button } from '../components/ui/button'
import { safeReturnLocation } from '../lib/navigation'

export default function ForbiddenPage() {
  const location = useLocation()
  const from = safeReturnLocation(location.state?.from)
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-5 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <section aria-labelledby="forbidden-title" className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10 dark:border-slate-800 dark:bg-slate-900">
        <ShieldX aria-hidden="true" className="mx-auto mb-5 size-14 text-orange-600" />
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-700 dark:text-orange-400">403 Forbidden</p>
        <h1 id="forbidden-title" className="mt-3 text-2xl font-bold sm:text-3xl">Bạn không có quyền truy cập</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">Khu vực quản trị chỉ dành cho tài khoản Admin đã được xác thực. Vui lòng đăng nhập bằng tài khoản có quyền phù hợp.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline" className="min-h-11"><Link to="/"><ArrowLeft className="size-4" />Về trang chủ</Link></Button>
          <Button asChild className="min-h-11 bg-orange-700 text-white hover:bg-orange-800"><Link to="/login" state={from ? { from } : undefined}><LogIn className="size-4" />Đăng nhập</Link></Button>
        </div>
      </section>
    </main>
  )
}
