export interface PnLCalculations {
  profitLoss: number
  profitLossPercent: number
  riskPercentActual: number
  rr: number
  roi: number
  netPnl: number
}

export function calculatePnL(
  profitLoss: number,
  accountSize: number,
  stopLossAmount: number,
  commission = 0,
  spread = 0
): PnLCalculations {
  const netPnl = profitLoss - commission - spread
  const profitLossPercent = accountSize > 0 ? (profitLoss / accountSize) * 100 : 0
  const riskPercentActual = accountSize > 0 ? (stopLossAmount / accountSize) * 100 : 0
  const rr = stopLossAmount > 0 ? profitLoss / stopLossAmount : 0
  const roi = accountSize > 0 ? (netPnl / accountSize) * 100 : 0

  return {
    profitLoss,
    profitLossPercent,
    riskPercentActual,
    rr,
    roi,
    netPnl,
  }
}

export function calculateRiskPercent(stopLossAmount: number, accountSize: number): number {
  if (!accountSize || accountSize <= 0) return 0
  return Math.round((stopLossAmount / accountSize) * 10000) / 100
}

export function getTradeResult(profitLoss?: number): 'win' | 'loss' | 'breakeven' | 'open' {
  if (profitLoss === undefined || profitLoss === null) return 'open'
  if (profitLoss > 0) return 'win'
  if (profitLoss < 0) return 'loss'
  return 'breakeven'
}

export function getPnlColorClass(value?: number): string {
  if (value === undefined || value === null) return 'text-[var(--color-neutral)]'
  if (value > 0) return 'text-[var(--color-profit)]'
  if (value < 0) return 'text-[var(--color-loss)]'
  return 'text-[var(--color-neutral)]'
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function formatRR(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}R`
}
