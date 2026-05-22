import Sidebar from './Sidebar'
import { useAuthStore } from '../../store/authStore'
import { NavLink } from 'react-router-dom'
import { BarChart3, CheckSquare, LayoutDashboard, Settings, Video } from 'lucide-react'

const mobileLinks = [
  ['/dashboard', LayoutDashboard, 'Home'],
  ['/meetings', Video, 'Meetings'],
  ['/tasks', CheckSquare, 'Tasks'],
  ['/analytics', BarChart3, 'Charts'],
  ['/workspace', Settings, 'Settings'],
]

export default function DashboardLayout({ title, children }) {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="min-h-screen bg-background text-textPrimary lg:flex">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 px-5 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <h1 className="font-heading text-2xl font-bold">{title}</h1>
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                {(user?.name || 'U').slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-5 pb-24 lg:pb-5">{children}</div>
        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-border bg-surface/95 backdrop-blur lg:hidden">
          {mobileLinks.map(([to, Icon, label]) => (
            <NavLink className="flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] text-textSecondary" to={to} key={to}>
              {({ isActive }) => (
                <>
                  <Icon className={isActive ? 'text-primary' : ''} size={19} />
                  <span className={isActive ? 'text-primary' : ''}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  )
}
