import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, CheckSquare, LayoutDashboard, LogOut, Settings, User, Video } from 'lucide-react'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'
import { useState } from 'react'
import ConfirmModal from '../shared/ConfirmModal'

const links = [
  ['/dashboard', LayoutDashboard, 'Dashboard'],
  ['/meetings', Video, 'Meetings'],
  ['/tasks', CheckSquare, 'Tasks'],
  ['/analytics', BarChart3, 'Analytics'],
  ['/workspace', Settings, 'Workspace'],
  ['/profile', User, 'Profile'],
]

export default function Sidebar() {
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId)
  const workspaces = useWorkspaceStore((state) => state.workspaces)
  const { logout, refreshToken } = useAuthStore()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const workspace = workspaces.find((item) => item.id === activeWorkspaceId)

  const handleLogout = async () => {
    try {
      await authService.logout(refreshToken)
    } catch (error) {
      // logout locally even if server fails
    }
    logout()
    toast.success('Logged out')
    navigate('/')
    setConfirmOpen(false)
  }

  return (
    <aside className="hidden min-h-screen w-64 flex-col border-r border-border bg-surface px-4 py-5 lg:flex">
      <div className="px-3 font-heading text-xl font-bold text-textPrimary">SyncMind AI</div>
      <div className="mt-6 rounded-lg border border-border bg-background p-3">
        <p className="text-xs uppercase tracking-widest text-textSecondary">Workspace</p>
        <p className="mt-1 truncate text-sm text-textPrimary">{workspace?.name || 'Personal Workspace'}</p>
      </div>
      <nav className="mt-6 flex-1 space-y-1">
        {links.map(([to, Icon, label]) => (
          <NavLink className="relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-textSecondary transition hover:text-textPrimary" to={to} key={to}>
            {({ isActive }) => (
              <>
                {isActive ? <motion.div className="absolute inset-0 rounded-lg bg-primary/15" layoutId="activeNav" /> : null}
                <Icon className="relative z-10" size={18} />
                <span className="relative z-10">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout button at bottom */}
      <button
        onClick={() => setConfirmOpen(true)}
        className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-textSecondary transition hover:bg-error/10 hover:text-error"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
      <ConfirmModal
        open={confirmOpen}
        title="Logout"
        description="Are you sure you want to logout?"
        confirmLabel="Logout"
        variant="danger"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleLogout}
      />
    </aside>
  )
}
