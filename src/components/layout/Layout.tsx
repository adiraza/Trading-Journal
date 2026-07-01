import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  Calendar,
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  Image,
  Search,
  Download,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { clsx } from 'clsx'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/new-trade', icon: PlusCircle, label: 'New Trade' },
  { to: '/trades', icon: Search, label: 'Trades' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/weekly', icon: BarChart3, label: 'Weekly' },
  { to: '/monthly', icon: TrendingUp, label: 'Monthly' },
  { to: '/sessions', icon: Clock, label: 'Sessions' },
  { to: '/entry-models', icon: Target, label: 'Entry Models' },
  { to: '/instruments', icon: TrendingUp, label: 'Instruments' },
  { to: '/gallery', icon: Image, label: 'Gallery' },
  { to: '/export', icon: Download, label: 'Export' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)] transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-sm font-bold text-white">
              TJ
            </div>
            <span className="font-semibold text-[var(--color-text-primary)]">Trading Journal</span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} className="text-[var(--color-text-secondary)]" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/30 hover:text-[var(--color-text-primary)]'
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--color-border)] p-3">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/30"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 lg:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} className="text-[var(--color-text-primary)]" />
          </button>
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {navItems.find((n) => n.to === location.pathname)?.label ?? 'Trading Journal'}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="animate-fade-in mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
