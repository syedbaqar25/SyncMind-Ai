import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import AuthLayout from '../components/layout/AuthLayout'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import { authService } from '../services/authService'

export default function EmailVerifyPage() {
  const { token } = useParams()
  const [state, setState] = useState({ loading: true, ok: false, message: '' })

  useEffect(() => {
    authService
      .verifyEmail(token)
      .then((response) => setState({ loading: false, ok: true, message: response.message }))
      .catch((error) => setState({ loading: false, ok: false, message: error.response?.data?.message || 'Verification failed' }))
  }, [token])

  return (
    <AuthLayout title="Email verification" subtitle="We are confirming your account token.">
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        {state.loading ? (
          <LoadingSpinner label="Verifying" />
        ) : state.ok ? (
          <CheckCircle2 className="mx-auto text-success" size={48} />
        ) : (
          <XCircle className="mx-auto text-error" size={48} />
        )}
        <p className="mt-5 text-sm text-textSecondary">{state.message}</p>
        {!state.loading ? <Link className="mt-6 inline-block text-primary" to="/login">Go to login</Link> : null}
      </div>
    </AuthLayout>
  )
}
