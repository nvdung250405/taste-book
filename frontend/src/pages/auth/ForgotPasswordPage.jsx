import { Link } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { Button } from '../../components/ui/button'

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-2xl border bg-white p-6 text-center sm:p-10 dark:bg-slate-900">
        <KeyRound
          aria-hidden="true"
          className="mx-auto mb-5 size-10 text-orange-600"
        />
        <h1 className="text-2xl font-bold">Quên mật khẩu?</h1>
        <p className="my-5 text-sm leading-6 text-slate-600 dark:text-slate-400">
          TasteBook hiện chưa hỗ trợ tự đặt lại mật khẩu. Vui lòng liên hệ quản
          trị viên để được hỗ trợ khôi phục quyền truy cập tài khoản.
        </p>
        <Button asChild className="min-h-11">
          <Link to="/login">Quay lại đăng nhập</Link>
        </Button>
      </div>
    </main>
  )
}
