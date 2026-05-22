import { useState } from 'react'
import toast from 'react-hot-toast'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const [name, setName] = useState(user?.name || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' })

  const saveProfile = async () => {
    const response = await api.put('/users/profile', { name, avatar })
    setUser(response.data.data)
    toast.success('Profile updated')
  }

  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirm) return toast.error('Passwords do not match')
    await api.put('/users/password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
    toast.success('Password changed')
  }

  return (
    <DashboardLayout title="Profile">
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-heading text-xl font-semibold">Account</h2>
          <div className="mt-5 flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/20 text-2xl">{(name || 'U').slice(0, 1)}</div>
            <input className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-textPrimary" value={avatar} onChange={(event) => setAvatar(event.target.value)} placeholder="Avatar URL" />
          </div>
          <input className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-textPrimary" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
          <p className="mt-3 text-sm text-textSecondary">{user?.email}</p>
          <Button className="mt-4" type="button" onClick={saveProfile}>Save Profile</Button>
        </section>
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-heading text-xl font-semibold">Change password</h2>
          <div className="mt-5 space-y-3">
            <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-textPrimary" type="password" placeholder="Current password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} />
            <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-textPrimary" type="password" placeholder="New password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} />
            <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-textPrimary" type="password" placeholder="Confirm password" value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} />
          </div>
          <Button className="mt-4" type="button" onClick={changePassword}>Update Password</Button>
        </section>
      </div>
    </DashboardLayout>
  )
}
