import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('token')
    const refreshToken = params.get('refreshToken')

    if (!accessToken) {
      navigate('/login')
      return
    }

    const fetchUser = async () => {
      try {
        useAuthStore.setState({ accessToken, refreshToken, isAuthenticated: true })

        const response = await authService.me()
        const user = response.data

        setSession({ user, accessToken, refreshToken })
        window.setTimeout(() => navigate('/dashboard', { replace: true }), 100)
      } catch (error) {
        toast.error(error.response?.data?.message || 'Google sign-in failed')
        navigate('/login', { replace: true })
      }
    }

    fetchUser()
  }, [navigate, setSession])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-textSecondary text-sm">Signing you in...</p>
      </div>
    </div>
  )
}
