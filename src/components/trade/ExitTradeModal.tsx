import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '../ui/Button'
import { PnlValue } from '../ui/PnlValue'
import { calculatePnL, formatCurrency, getTradeResult } from '../../utils/calculations'
import type { TradeDirection } from '../../types'

interface ExitTradeModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (profitLoss: number) => void
  entryDate: string
  entryTime: string
  instrument: string
  direction: TradeDirection
  plannedRisk: number
  plannedReward: number
  accountSize: number
  currency: string
  initialProfitLoss?: number
}

function parseProfitLossInput(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '' || trimmed === '-' || trimmed === '+') return null
  const parsed = parseFloat(trimmed.replace(/^\+/, ''))
  return Number.isNaN(parsed) ? null : parsed
}

function getResultLabel(result: 'win' | 'loss' | 'breakeven' | 'open'): string {
  switch (result) {
    case 'win':
      return 'Profit'
    case 'loss':
      return 'Loss'
    case 'breakeven':
      return 'Breakeven'
    default:
      return '—'
  }
}

function getResultColorClass(result: 'win' | 'loss' | 'breakeven' | 'open'): string {
  switch (result) {
    case 'win':
      return 'text-[var(--color-profit)]'
    case 'loss':
      return 'text-[var(--color-loss)]'
    default:
      return 'text-[var(--color-neutral)]'
  }
}

export function ExitTradeModal({
  open,
  onClose,
  onConfirm,
  entryDate,
  entryTime,
  instrument,
  direction,
  plannedRisk,
  plannedReward,
  accountSize,
  currency,
  initialProfitLoss,
}: ExitTradeModalProps) {
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (open) {
      setInputValue(
        initialProfitLoss !== undefined && initialProfitLoss !== 0
          ? String(initialProfitLoss)
          : ''
      )
    }
  }, [open, initialProfitLoss])

  const profitLoss = useMemo(() => parseProfitLossInput(inputValue), [inputValue])

  const calculated = useMemo(() => {
    if (profitLoss === null) {
      return { profitLossPercent: 0, riskPercentActual: 0, rr: 0, roi: 0, netPnl: 0, profitLoss: 0 }
    }
    return calculatePnL(profitLoss, accountSize, plannedRisk)
  }, [profitLoss, accountSize, plannedRisk])

  const tradeResult = profitLoss === null ? 'open' : getTradeResult(profitLoss)

  const handleConfirm = () => {
    if (profitLoss === null) return
    onConfirm(profitLoss)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg animate-fade-in rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Exit Trade</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/30"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <ReadOnlyField label="Planned Risk ($)" value={formatCurrency(plannedRisk, currency)} />
            <ReadOnlyField label="Planned Reward ($)" value={formatCurrency(plannedReward, currency)} />
            <ReadOnlyField label="Entry Date" value={entryDate} />
            <ReadOnlyField label="Entry Time" value={entryTime} />
            <ReadOnlyField label="Instrument" value={instrument} />
            <ReadOnlyField
              label="Direction"
              value={direction.toUpperCase()}
              valueClassName={direction === 'buy' ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">
              Actual Profit/Loss ($)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. 50, -25, +75"
              autoFocus
              className={clsx(
                'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-semibold focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]/30',
                profitLoss !== null && getResultColorClass(tradeResult)
              )}
            />
          </div>

          {profitLoss !== null && (
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
              <div className="text-center">
                <p className="text-xs text-[var(--color-text-secondary)]">Trade Result</p>
                <p className={clsx('mt-1 text-sm font-bold', getResultColorClass(tradeResult))}>
                  {getResultLabel(tradeResult)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[var(--color-text-secondary)]">Profit %</p>
                <PnlValue value={calculated.profitLossPercent} suffix="%" className="text-sm" />
              </div>
              <div className="text-center">
                <p className="text-xs text-[var(--color-text-secondary)]">RR</p>
                <PnlValue value={calculated.rr} suffix="R" className="text-sm" />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-5 py-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={profitLoss === null}>
            Confirm Exit
          </Button>
        </div>
      </div>
    </div>
  )
}

function ReadOnlyField({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="rounded-lg bg-[var(--color-surface)] px-3 py-2">
      <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
      <p className={clsx('mt-0.5 text-sm font-medium text-[var(--color-text-primary)]', valueClassName)}>
        {value}
      </p>
    </div>
  )
}
