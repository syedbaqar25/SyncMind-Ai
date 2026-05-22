import { Link, NavLink } from 'react-router-dom'
import { Button } from '../ui/Button'

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link className="font-heading text-xl font-bold text-textPrimary" to="/">SyncMind AI</Link>
        <nav className="hidden items-center gap-6 text-sm text-textSecondary md:flex">
          <a className="hover:text-textPrimary" href="#features">Features</a>
          <a className="hover:text-textPrimary" href="#workflow">Workflow</a>
          <a className="hover:text-textPrimary" href="#voices">Teams</a>
        </nav>
        <div className="flex items-center gap-3">
          <NavLink className="hidden text-sm text-textSecondary hover:text-textPrimary sm:block" to="/login">Log in</NavLink>
          <Button className="min-h-10 px-3" type="button" onClick={() => { window.location.href = '/register' }}>Get Started</Button>
        </div>
      </div>
    </header>
  )
}
