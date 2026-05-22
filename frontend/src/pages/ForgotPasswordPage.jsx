import { useState } from 'react'
import toast from 'react-hot-toast'
import AuthLayout from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { authService } from '../services/authService'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      toast.success('Reset link sent if the email exists')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Reset password" subtitle="Enter your email and we will send a reset link.">
      <form className="space-y-5" onSubmit={submit}>
        <input className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-textPrimary outline-none focus:border-primary focus:shadow-[0_0_0_2px_rgba(99,102,241,0.3)]" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <Button className="w-full" isLoading={loading} type="submit">Send reset link</Button>
      </form>
    </AuthLayout>
  )
}
