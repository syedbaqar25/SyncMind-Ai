import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const EmailVerifyPage = lazy(() => import('./pages/EmailVerifyPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const MeetingsPage = lazy(() => import('./pages/MeetingsPage'))
const MeetingDetailPage = lazy(() => import('./pages/MeetingDetailPage'))
const TasksPage = lazy(() => import('./pages/TasksPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const WorkspacePage = lazy(() => import('./pages/WorkspacePage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageShell({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  )
}

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  const location = useLocation()

  return (
    <>
      <AnimatePresence mode="wait">
        <Suspense fallback={<div className="min-h-screen bg-background p-8 text-textPrimary">Loading...</div>}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageShell><LandingPage /></PageShell>} />
            <Route path="/login" element={<PageShell><LoginPage /></PageShell>} />
            <Route path="/register" element={<PageShell><RegisterPage /></PageShell>} />
            <Route path="/verify-email/:token" element={<PageShell><EmailVerifyPage /></PageShell>} />
            <Route path="/forgot-password" element={<PageShell><ForgotPasswordPage /></PageShell>} />
            <Route path="/reset-password/:token" element={<PageShell><ResetPasswordPage /></PageShell>} />
            <Route path="/dashboard" element={<ProtectedRoute><PageShell><DashboardPage /></PageShell></ProtectedRoute>} />
            <Route path="/meetings" element={<ProtectedRoute><PageShell><MeetingsPage /></PageShell></ProtectedRoute>} />
            <Route path="/meetings/:id" element={<ProtectedRoute><PageShell><MeetingDetailPage /></PageShell></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><PageShell><TasksPage /></PageShell></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><PageShell><AnalyticsPage /></PageShell></ProtectedRoute>} />
            <Route path="/workspace" element={<ProtectedRoute><PageShell><WorkspacePage /></PageShell></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PageShell><ProfilePage /></PageShell></ProtectedRoute>} />
            <Route path="*" element={<PageShell><NotFoundPage /></PageShell>} />
          </Routes>
        </Suspense>
      </AnimatePresence>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#13131a',
            color: '#f1f5f9',
            border: '1px solid #2a2a3d',
          },
        }}
      />
    </>
  )
}

export default App
