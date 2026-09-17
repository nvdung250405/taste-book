import { Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'

export default function PasswordChangeForm({ passwordForm, setPasswordForm, handlePasswordSubmit, changingPassword }) {
  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
        <CardDescription>Bảo vệ tài khoản của bạn với mật khẩu an toàn</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mật khẩu hiện tại</label>
            <Input 
              type="password"
              value={passwordForm.oldPassword}
              onChange={(e) => setPasswordForm(p => ({ ...p, oldPassword: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mật khẩu mới</label>
            <Input 
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Xác nhận mật khẩu mới</label>
            <Input 
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
            />
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={changingPassword} className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl px-6">
              {changingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Đổi mật khẩu
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
