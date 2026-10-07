import { useState } from 'react'
import { UserCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useProfile, useUpdateProfile, useChangePassword } from '../hooks/queries/useAuthQueries'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

import QueryError from '../components/ui/QueryError'

import ProfileSidebar from '../components/profile/ProfileSidebar'
import ProfileInfoForm from '../components/profile/ProfileInfoForm'
import PasswordChangeForm from '../components/profile/PasswordChangeForm'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { data: profileRes, isLoading, isError, isFetching, refetch } = useProfile()
  const user = profileRes?.DT
  if (isLoading) return <div role="status" className="py-20 text-center">Đang tải hồ sơ…</div>
  if (isError && !user) return <QueryError title="Không thể tải hồ sơ" onRetry={refetch} isRetrying={isFetching} />
  if (!user) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><UserCircle className="w-16 h-16 text-slate-500" /><p>Bạn chưa đăng nhập</p><Button onClick={() => navigate('/login')}>Đăng nhập ngay</Button></div>
  return <>
    <h1 className="text-3xl font-bold mb-6">Hồ sơ cá nhân</h1>
    {isError && <QueryError title="Không thể cập nhật dữ liệu hồ sơ" onRetry={refetch} isRetrying={isFetching} />}
    <ProfileEditor key={user.userId} user={user} />
  </>
}

function ProfileEditor({ user }) {
  const { mutate: updateProfile, isPending: updating } = useUpdateProfile()
  const { mutate: changePassword, isPending: changingPassword } = useChangePassword()


  const [activeTab, setActiveTab] = useState('info') // info, security

  // Profile Form State
  const [profileForm, setProfileForm] = useState(() => ({
    name: user.username || user.name || '',
    phone: user.phone || '',
    avatar: user.avatarUrl || user.avatar || '',
  }))

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

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
        const msg = err?.EM || err?.response?.data?.EM || err?.response?.data?.message || 'Lỗi khi cập nhật hồ sơ'
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
        // axiosClient interceptor rejects with error.response.data directly ({ EC, EM, DT })
        const msg = err?.EM || err?.message || 'Lỗi khi đổi mật khẩu'
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
