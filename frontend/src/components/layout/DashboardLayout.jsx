import Sidebar from './Sidebar'
import { useAuthStore } from '../../store/authStore'

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
        <div className="mx-auto max-w-7xl p-5">{children}</div>
      </main>
    </div>
  )
}
