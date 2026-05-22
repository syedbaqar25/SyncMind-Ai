import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthLayout from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { authService } from '../services/authService'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [values, setValues] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (values.password.length < 8 || values.password !== values.confirmPassword) {
      toast.error('Use matching passwords with at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword({ token, password: values.password })
      toast.success('Password reset')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Create a fresh password for your account.">
      <form className="space-y-5" onSubmit={submit}>
        <input className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-textPrimary outline-none focus:border-primary" type="password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} placeholder="New password" />
        <input className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-textPrimary outline-none focus:border-primary" type="password" value={values.confirmPassword} onChange={(e) => setValues({ ...values, confirmPassword: e.target.value })} placeholder="Confirm password" />
        <Button className="w-full" isLoading={loading} type="submit">Reset password</Button>
      </form>
    </AuthLayout>
  )
}
