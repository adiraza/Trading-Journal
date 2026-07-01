import { clsx } from 'clsx'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  colorClass?: string
  icon?: ReactNode
}

export function StatCard({ label, value, subValue, colorClass, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 transition-all hover:border-[var(--color-accent)]/30">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">{label}</p>
        {icon && <span className="text-[var(--color-text-secondary)]">{icon}</span>}
      </div>
      <p className={clsx('mt-1 text-2xl font-bold', colorClass ?? 'text-[var(--color-text-primary)]')}>
        {value}
      </p>
      {subValue && <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{subValue}</p>}
    </div>
  )
}
