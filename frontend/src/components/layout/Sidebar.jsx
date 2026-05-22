import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, CheckSquare, LayoutDashboard, Settings, User, Video } from 'lucide-react'
import { useWorkspaceStore } from '../../store/workspaceStore'

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

  return (
    <aside className="hidden min-h-screen w-64 border-r border-border bg-surface px-4 py-5 lg:block">
      <div className="px-3 font-heading text-xl font-bold text-textPrimary">SyncMind AI</div>
      <div className="mt-6 rounded-lg border border-border bg-background p-3">
        <p className="text-xs uppercase tracking-widest text-textSecondary">Workspace</p>
        <p className="mt-1 truncate text-sm text-textPrimary">{activeWorkspaceId || 'Personal Workspace'}</p>
      </div>
      <nav className="mt-6 space-y-1">
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
    </aside>
  )
}
