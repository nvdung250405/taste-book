import { Toaster } from 'sonner'
import { BrowserRouter, Routes, Route } from 'react-router'

// Layouts
import MainLayout from './components/layouts/MainLayout'
import AdminLayout from './components/layouts/AdminLayout'

// Pages
import HomePage from './pages/HomePage'
import NotFound from './pages/NotFound'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import DashboardPage from './pages/admin/DashboardPage'

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
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            {/* User routes will be added here later */}
          </Route>

          {/* Admin Routes with AdminLayout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
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
