import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart3, CheckSquare, LayoutDashboard, LogOut, Settings, User, Video } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import Sidebar from './Sidebar'
import ConfirmModal from '../shared/ConfirmModal'
import { useAuthStore } from '../../store/authStore'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { workspaceService } from '../../services/workspaceService'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

const mobileLinks = [
  ['/dashboard', LayoutDashboard, 'Home'],
  ['/meetings', Video, 'Meetings'],
  ['/tasks', CheckSquare, 'Tasks'],
  ['/analytics', BarChart3, 'Charts'],
  ['/workspace', Settings, 'Settings'],
]

export default function DashboardLayout({ title, children }) {
  const user = useAuthStore((state) => state.user)
  const { logout, refreshToken } = useAuthStore()
  const { activeWorkspaceId, setWorkspaces, setActiveWorkspaceId } = useWorkspaceStore()
  const navigate = useNavigate()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [dropdownOpen])

  // Close dropdown on Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') setDropdownOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

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
    setDropdownOpen(false)
  }

  // Fetch all workspaces on every dashboard load
  const { data } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceService.list(),
    staleTime: 30000,
  })

  useEffect(() => {
    const init = async () => {
      try {
        let workspaces = data?.data || []

        // If no workspaces exist → auto-create one
        if (workspaces.length === 0) {
          const created = await workspaceService.create({
            name: `${user?.name?.split(' ')[0] || 'My'}'s Workspace`
          })
          workspaces = [created.data]
        }

        setWorkspaces(workspaces)

        // Set active workspace if not set or invalid
        const isValid = workspaces.some((w) => w.id === activeWorkspaceId)
        if (!activeWorkspaceId || !isValid) {
          setActiveWorkspaceId(workspaces[0].id)
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Workspace setup failed')
      }
    }

    if (data !== undefined) {
      init()
    }
  }, [data])

  return (
    <div className="min-h-screen overflow-hidden bg-background text-textPrimary lg:flex">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 px-5 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <h1 className="font-heading text-xl font-bold sm:text-2xl">{title}</h1>

            {/* Avatar + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full outline-none transition hover:ring-2 hover:ring-primary/40 focus-visible:ring-2 focus-visible:ring-primary"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-9 w-9 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {(user?.name || 'U').slice(0, 1).toUpperCase()}
                  </div>
                )}
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/30">
                  {/* User info header */}
                  <div className="border-b border-border px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                          {(user?.name || 'U').slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-textPrimary">{user?.name || 'User'}</p>
                        <p className="truncate text-xs text-textSecondary">{user?.email || ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false)
                        navigate('/profile')
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-textSecondary transition hover:bg-background hover:text-textPrimary"
                    >
                      <User size={16} />
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false)
                        setConfirmOpen(true)
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-error/80 transition hover:bg-error/10 hover:text-error"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-5 pb-24 lg:pb-5">{children}</div>
        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-border bg-surface/95 backdrop-blur lg:hidden">
          {mobileLinks.map(([to, Icon, label]) => (
            <NavLink className="flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 text-[10px] text-textSecondary sm:min-h-16 sm:gap-1 sm:text-[11px]" to={to} key={to}>
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

      {/* Logout confirmation modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Logout"
        description="Are you sure you want to logout?"
        confirmLabel="Logout"
        variant="danger"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  )
}
