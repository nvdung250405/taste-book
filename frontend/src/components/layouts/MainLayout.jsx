import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useProfile, useLogout } from '../../hooks/queries/useAuthQueries'
import { toast } from 'sonner'
import Header from './Header'
import Footer from './Footer'

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const { data: profileRes, isLoading: profileLoading } = useProfile()
  const { mutate: logoutMutate, isPending: loggingOut } = useLogout()

  const user = profileRes?.DT || null
  const isAuthenticated = !!user

  const handleLogout = () => {
    if (loggingOut) return
    logoutMutate(undefined, {
      onSuccess: () => {
        navigate('/login')
      },
      onError: () => {
        navigate('/login')
      },
    })
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleLinkClick = (e, authRequired) => {
    if (authRequired && !isAuthenticated) {
      e.preventDefault()
      toast.error('Vui lòng đăng nhập để sử dụng tính năng này')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50">
      <Header 
        isAuthenticated={isAuthenticated}
        user={user}
        profileLoading={profileLoading}
        handleLogout={handleLogout}
        isActive={isActive}
        handleLinkClick={handleLinkClick}
      />

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <Footer handleLinkClick={handleLinkClick} />
    </div>
  )
}
