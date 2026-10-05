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
        } catch {
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

import { Suspense, lazy } from 'react'

// Layouts
import MainLayout from './components/layouts/MainLayout'
import AdminLayout from './components/layouts/AdminLayout'

// Pages (Lazy loaded for better performance, except HomePage)
import HomePage from './pages/HomePage'
import RecipeDetailPage from './pages/RecipeDetailPage'
const NotFound = lazy(() => import('./pages/NotFound'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const AdminApprovalsPage = lazy(() => import('./pages/admin/AdminApprovalsPage'))
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminIngredientsPage = lazy(() => import('./pages/admin/AdminIngredientsPage'))
const AdminUnitsPage = lazy(() => import('./pages/admin/AdminUnitsPage'))
const RecipeSearchPage = lazy(() => import('./pages/RecipeSearchPage'))
const MyRecipesPage = lazy(() => import('./pages/MyRecipesPage'))
const MenuPage = lazy(() => import('./pages/MenuPage'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'))
const ShoppingListPage = lazy(() => import('./pages/ShoppingListPage'))
const RecipeFormPage = lazy(() => import('./pages/RecipeFormPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />

      <BrowserRouter>
        <AppBehaviorHandler />
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>}>
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
        </Suspense>
      </BrowserRouter>
    </>
  )
}

export default App

