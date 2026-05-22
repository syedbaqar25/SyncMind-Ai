import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Mail, UserPlus } from 'lucide-react'
import AuthLayout from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { authService } from '../services/authService'
import { registerSchema } from '../utils/validators'
import { API_URL } from '../utils/constants'

function Field({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-textSecondary">{label}</span>
      <input
        className={`mt-2 w-full rounded-lg border bg-surface px-4 py-3 text-textPrimary outline-none transition focus:border-primary focus:shadow-[0_0_0_2px_rgba(99,102,241,0.3)] ${error ? 'border-error animate-[shake_0.4s_ease]' : 'border-border'}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-error">{error}</span> : null}
    </label>
  )
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  )
}

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false)
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '', terms: false })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    const parsed = registerSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], issue.message])))
      return
    }

    setLoading(true)
    try {
      await authService.register({ name: values.name, email: values.email, password: values.password })
      toast.success('Check your email')
      setSubmitted(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <AuthLayout title="Check your email" subtitle="We sent a verification link to finish creating your account.">
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary">
            <Mail size={34} />
          </div>
          <p className="text-sm text-textSecondary">{values.email}</p>
          <Button className="mt-6 w-full" type="button" onClick={() => setSubmitted(false)}>Use another email</Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create account" subtitle="Start turning meetings into searchable decisions and tasks.">
      <form className="space-y-4" onSubmit={submit}>
        {[
          ['name', 'Name', 'text'],
          ['email', 'Email', 'email'],
          ['password', 'Password', 'password'],
          ['confirmPassword', 'Confirm password', 'password'],
        ].map(([key, label, type], index) => (
          <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Field label={label} type={type} value={values[key]} error={errors[key]} onChange={(e) => setValues({ ...values, [key]: e.target.value })} />
          </motion.div>
        ))}
        <label className={`flex items-start gap-3 text-sm text-textSecondary ${errors.terms ? 'animate-[shake_0.4s_ease] text-error' : ''}`}>
          <input className="mt-1" type="checkbox" checked={values.terms} onChange={(e) => setValues({ ...values, terms: e.target.checked })} />
          I agree to the terms and privacy policy.
        </label>
        <Button className="w-full" isLoading={loading} type="submit"><UserPlus size={18} /> Create account</Button>
        <Button className="w-full" type="button" variant="light" onClick={() => { window.location.href = `${API_URL}/auth/google` }}>
          <GoogleIcon /> Continue with Google
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-textSecondary">Already have an account? <Link className="text-primary" to="/login">Log in</Link></p>
    </AuthLayout>
  )
}
