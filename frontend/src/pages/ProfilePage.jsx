import { useState, useEffect } from 'react'
import { UserCircle, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useProfile, useUpdateProfile, useChangePassword } from '../hooks/queries/useAuthQueries'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

import ProfileSidebar from '../components/profile/ProfileSidebar'
import ProfileInfoForm from '../components/profile/ProfileInfoForm'
import PasswordChangeForm from '../components/profile/PasswordChangeForm'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { data: profileRes, isLoading: loadingProfile } = useProfile()
  const { mutate: updateProfile, isPending: updating } = useUpdateProfile()
  const { mutate: changePassword, isPending: changingPassword } = useChangePassword()

  const user = profileRes?.DT || null

  const [activeTab, setActiveTab] = useState('info') // info, security

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    avatar: '',
  })

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfileForm({
        name: user.name || user.username || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || user.profileImage || '',
      })
    }
  }, [user])

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="text-slate-500">Đang tải hồ sơ...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <UserCircle className="w-16 h-16 text-slate-300" />
        <p className="text-slate-500">Bạn chưa đăng nhập</p>
        <Button onClick={() => navigate('/login')}>Đăng nhập ngay</Button>
      </div>
    )
  }

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    if (!profileForm.name.trim()) return toast.error('Tên không được để trống')

    const payload = {
      username: profileForm.name.trim(),
      phone: profileForm.phone ? profileForm.phone.trim() : undefined,
      avatarUrl: profileForm.avatar ? profileForm.avatar.trim() : '',
    }

    updateProfile(payload, {
      onSuccess: (res) => toast.success(res?.EM || 'Cập nhật hồ sơ thành công!'),
      onError: (err) => {
        const msg = err?.response?.data?.EM || err?.response?.data?.message || 'Lỗi khi cập nhật hồ sơ'
        toast.error(msg)
      },
    })
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      return toast.error('Vui lòng nhập đầy đủ thông tin')
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp')
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('Mật khẩu mới phải có ít nhất 6 ký tự')
    }

    changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    }, {
      onSuccess: (res) => {
        toast.success(res?.EM || 'Đổi mật khẩu thành công!')
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      },
      onError: (err) => {
        const msg = err?.response?.data?.EM || err?.response?.data?.message || 'Lỗi khi đổi mật khẩu'
        toast.error(msg)
      },
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <ProfileSidebar 
          user={user}
          profileForm={profileForm}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main Content */}
        <div className="md:col-span-3">
          {activeTab === 'info' && (
            <ProfileInfoForm 
              user={user}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              handleProfileSubmit={handleProfileSubmit}
              updating={updating}
            />
          )}

          {activeTab === 'security' && (
            <PasswordChangeForm 
              passwordForm={passwordForm}
              setPasswordForm={setPasswordForm}
              handlePasswordSubmit={handlePasswordSubmit}
              changingPassword={changingPassword}
            />
          )}
        </div>
      </div>
    </div>
  )
}
