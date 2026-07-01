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
  User,
} from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { useSettings } from '../../hooks/useSettings'
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
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { settings } = useSettings()
  const location = useLocation()

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)] transition-transform xl:static xl:translate-x-0 lg:w-64 md:w-60',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4 md:px-5">
          <div className="flex flex-col">
            <span className="font-semibold text-[var(--color-text-primary)] text-sm md:text-base">Trading Journal</span>
            {settings.traderName && (
              <span className="text-xs text-[var(--color-text-secondary)] truncate max-w-[120px] md:max-w-none">{settings.traderName}</span>
            )}
          </div>
          <button className="xl:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} className="text-[var(--color-text-secondary)]" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 md:p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:px-4',
                  isActive
                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/30 hover:text-[var(--color-text-primary)]'
                )
              }
            >
              <item.icon size={18} />
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden text-xs">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--color-border)] p-3 md:p-4">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/30 md:px-4"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 md:px-6 lg:px-8">
          <button className="xl:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} className="text-[var(--color-text-primary)]" />
          </button>
          <h1 className="text-base font-semibold text-[var(--color-text-primary)] md:text-lg truncate">
            {navItems.find((n) => n.to === location.pathname)?.label ?? 'Trading Journal'}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 xl:p-8">
          <div className="animate-fade-in mx-auto max-w-7xl w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
