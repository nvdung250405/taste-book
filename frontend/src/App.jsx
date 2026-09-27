import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'

function AppBehaviorHandler() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // Scroll to top when pathname changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  // Reload page when user uses browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => window.location.reload()
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Auto-check token expiration every 10 seconds
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          // Decode JWT payload (middle part)
          const payload = JSON.parse(atob(token.split('.')[1]))
          // Check if expired (payload.exp is in seconds)
          if (payload.exp * 1000 <= Date.now()) {
            window.dispatchEvent(new Event('unauthorized'))
          }
        } catch (e) {
          // Ignore parse error
        }
      }
    }

    // Check immediately on mount, then every 10 seconds
    checkToken()
    const interval = setInterval(checkToken, 10000)
    return () => clearInterval(interval)
  }, [])

  // Handle unauthorized events globally without hard reload (SPA style)
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (pathname !== '/login' && pathname !== '/register') {
        toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại')
        navigate('/login')
      }
    }
    
    window.addEventListener('unauthorized', handleUnauthorized)
    return () => window.removeEventListener('unauthorized', handleUnauthorized)
  }, [navigate, pathname])

  return null
}

// Layouts
import MainLayout from './components/layouts/MainLayout'
import AdminLayout from './components/layouts/AdminLayout'

// Pages
import HomePage from './pages/HomePage'
import NotFound from './pages/NotFound'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/admin/DashboardPage'
import AdminApprovalsPage from './pages/admin/AdminApprovalsPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminIngredientsPage from './pages/admin/AdminIngredientsPage'
import AdminUnitsPage from './pages/admin/AdminUnitsPage'
import RecipeSearchPage from './pages/RecipeSearchPage'
import MyRecipesPage from './pages/MyRecipesPage'
import MenuPage from './pages/MenuPage'
import FavoritesPage from './pages/FavoritesPage'
import ShoppingListPage from './pages/ShoppingListPage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import RecipeFormPage from './pages/RecipeFormPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />

      <BrowserRouter>
        <AppBehaviorHandler />
        <Routes>
          {/* Public & User Routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* User routes */}
            <Route path="/search" element={<RecipeSearchPage />} />
            <Route path="/my-recipes" element={<MyRecipesPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/shopping-list" element={<ShoppingListPage />} />
            <Route path="/recipe/create" element={<RecipeFormPage />} />
            <Route path="/recipe/:id/edit" element={<RecipeFormPage />} />
            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/settings" element={<ProfilePage />} />
          </Route>

          {/* Admin Routes with AdminLayout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="approvals" element={<AdminApprovalsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="ingredients" element={<AdminIngredientsPage />} />
            <Route path="units" element={<AdminUnitsPage />} />
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

