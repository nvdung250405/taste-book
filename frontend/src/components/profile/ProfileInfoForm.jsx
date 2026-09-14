import { useState, useRef } from 'react'
import { Camera, Loader2, UploadCloud, Link as LinkIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { useUploadImage } from '../../hooks/queries/useUploadQueries'
import { toast } from 'sonner'

export default function ProfileInfoForm({ user, profileForm, setProfileForm, handleProfileSubmit, updating }) {
  const fileInputRef = useRef(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const { mutate: uploadImage, isPending: isUploading } = useUploadImage()

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh (JPEG, PNG, WEBP,...)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa là 5MB!')
      return
    }

    uploadImage(file, {
      onSuccess: (res) => {
        const uploadedUrl = res?.DT?.imageUrl || res?.DT?.url
        if (uploadedUrl) {
          setProfileForm((prev) => ({ ...prev, avatar: uploadedUrl }))
          toast.success('Tải ảnh lên thành công!')
        } else {
          toast.error('Không tìm thấy đường dẫn ảnh sau khi tải lên')
        }
      },
      onError: (err) => {
        const errorMsg =
          err?.EM ||
          err?.response?.data?.EM ||
          err?.message ||
          'Tải ảnh lên thất bại!'
        toast.error(errorMsg)
      },
    })
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
        <CardDescription>Cập nhật thông tin hồ sơ của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Ảnh đại diện
            </label>
            <div className="flex items-center gap-5">
              {/* Avatar Preview */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-orange-300 dark:border-orange-800/60 shadow-sm cursor-pointer shrink-0 bg-slate-100 dark:bg-slate-800"
                title="Nhấp để đổi ảnh"
              >
                {profileForm.avatar ? (
                  <img 
                    src={profileForm.avatar} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Camera className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-medium">
                  <Camera className="w-5 h-5 mb-0.5" />
                  Đổi ảnh
                </div>
              </div>

              {/* Actions & Info */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer h-9 px-4 text-xs font-medium"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Đang tải lên...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                        Tải ảnh từ máy
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="h-9 px-3 text-xs text-slate-600 dark:text-slate-400 cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                    {showUrlInput ? 'Ẩn ô nhập link' : 'Hoặc dán URL'}
                  </Button>
                </div>
                <p className="text-xs text-slate-400">
                  Hỗ trợ định dạng PNG, JPG, WEBP (tối đa 5MB).
                </p>
              </div>
            </div>

            {/* Optional URL input toggle */}
            {showUrlInput && (
              <div className="pt-2 animate-in fade-in duration-200">
                <Input 
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm(p => ({ ...p, avatar: e.target.value }))}
                  placeholder="https://example.com/anh-dai-dien.jpg"
                  className="text-xs font-mono"
                />
              </div>
            )}
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
