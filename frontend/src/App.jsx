import { Toaster } from 'sonner'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

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
import ExplorePage from './pages/ExplorePage'
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
        <Routes>
          {/* Public & User Routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* User routes */}
            <Route path="/explore" element={<ExplorePage />} />
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
            {/* More admin routes will be added here later */}
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

