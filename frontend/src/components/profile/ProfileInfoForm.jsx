import { Camera, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'

export default function ProfileInfoForm({ user, profileForm, setProfileForm, handleProfileSubmit, updating }) {
  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
        <CardDescription>Cập nhật thông tin hồ sơ của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Avatar URL</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm(p => ({ ...p, avatar: e.target.value }))}
                  placeholder="Link ảnh đại diện..."
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Họ và tên</label>
              <Input 
                value={profileForm.name}
                onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <Input 
                value={user.email}
                disabled
                className="bg-slate-50 dark:bg-slate-900 text-slate-500"
              />
              <p className="text-xs text-slate-400">Email không thể thay đổi</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Số điện thoại</label>
              <Input 
                value={profileForm.phone}
                onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="09xx xxx xxx"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Địa chỉ</label>
              <Input 
                value={profileForm.address}
                onChange={(e) => setProfileForm(p => ({ ...p, address: e.target.value }))}
                placeholder="Thành phố, Quốc gia..."
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={updating} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6">
              {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
