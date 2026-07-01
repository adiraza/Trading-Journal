import { clsx } from 'clsx'
import { getPnlColorClass } from '../../utils/calculations'

interface PnlValueProps {
  value?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function PnlValue({ value, prefix = '', suffix = '', className }: PnlValueProps) {
  const formatted =
    value !== undefined && value !== null
      ? `${prefix}${value >= 0 ? '+' : ''}${value.toFixed(2)}${suffix}`
      : '-'

  return <span className={clsx('font-semibold', getPnlColorClass(value), className)}>{formatted}</span>
}
