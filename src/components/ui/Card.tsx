import { clsx } from 'clsx'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  action?: ReactNode
}

export function Card({ children, className, title, subtitle, action }: CardProps) {
  return (
    <div
      className={clsx(
        'card p-5',
        className
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            {title && <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h3>}
            {subtitle && <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
