import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import type { FilterOptions, GroupStats, PeriodStats, SessionStats, Trade, TradeStats } from '../types'
import { getHoldingTimeMinutes } from './dates'
import { getTradeResult } from './calculations'

dayjs.extend(isBetween)
dayjs.extend(weekOfYear)

function isClosed(trade: Trade): boolean {
  return trade.status === 'closed' && trade.profitLoss !== undefined
}

function filterClosedTrades(trades: Trade[]): Trade[] {
  return trades.filter(isClosed)
}

function computeStreaks(trades: Trade[]): {
  currentStreak: number
  longestWinStreak: number
  longestLossStreak: number
} {
  const sorted = [...filterClosedTrades(trades)].sort((a, b) =>
    `${a.exitDate} ${a.exitTime}`.localeCompare(`${b.exitDate} ${b.exitTime}`)
  )

  let currentStreak = 0
  let longestWinStreak = 0
  let longestLossStreak = 0
  let winStreak = 0
  let lossStreak = 0

  for (const trade of sorted) {
    const result = getTradeResult(trade.profitLoss)
    if (result === 'win') {
      winStreak++
      lossStreak = 0
      longestWinStreak = Math.max(longestWinStreak, winStreak)
    } else if (result === 'loss') {
      lossStreak++
      winStreak = 0
      longestLossStreak = Math.max(longestLossStreak, lossStreak)
    } else {
      winStreak = 0
      lossStreak = 0
    }
  }

  if (sorted.length > 0) {
    const last = sorted[sorted.length - 1]
    const lastResult = getTradeResult(last.profitLoss)
    if (lastResult === 'win') currentStreak = winStreak
    else if (lastResult === 'loss') currentStreak = -lossStreak
  }

  return { currentStreak, longestWinStreak, longestLossStreak }
}

export function computeTradeStats(trades: Trade[]): TradeStats {
  const closed = filterClosedTrades(trades)
  const wins = closed.filter((t) => (t.profitLoss ?? 0) > 0)
  const losses = closed.filter((t) => (t.profitLoss ?? 0) < 0)
  const breakevens = closed.filter((t) => t.profitLoss === 0)

  const totalProfit = wins.reduce((sum, t) => sum + (t.profitLoss ?? 0), 0)
  const totalLoss = Math.abs(losses.reduce((sum, t) => sum + (t.profitLoss ?? 0), 0))
  const netPnl = closed.reduce((sum, t) => sum + (t.netPnl ?? t.profitLoss ?? 0), 0)
  const netRR = closed.reduce((sum, t) => sum + (t.rr ?? 0), 0)

  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0
  const averageRR = closed.length > 0 ? netRR / closed.length : 0
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0

  const largestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.profitLoss ?? 0)) : 0
  const largestLoss = losses.length > 0 ? Math.min(...losses.map((t) => t.profitLoss ?? 0)) : 0
  const averageWin = wins.length > 0 ? totalProfit / wins.length : 0
  const averageLoss = losses.length > 0 ? totalLoss / losses.length : 0

  const winRateDecimal = closed.length > 0 ? wins.length / closed.length : 0
  const lossRateDecimal = closed.length > 0 ? losses.length / closed.length : 0
  const expectancy = winRateDecimal * averageWin - lossRateDecimal * averageLoss

  const streaks = computeStreaks(trades)

  return {
    totalTrades: trades.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    breakevenTrades: breakevens.length,
    totalProfit,
    totalLoss,
    netPnl,
    netRR,
    winRate,
    averageRR,
    profitFactor: profitFactor === Infinity ? 999 : profitFactor,
    largestWin,
    largestLoss,
    averageWin,
    averageLoss,
    expectancy,
    ...streaks,
  }
}

export function computePeriodStats(trades: Trade[]): PeriodStats {
  const base = computeTradeStats(trades)
  const closed = filterClosedTrades(trades)

  const bestTrade = closed.length > 0 ? Math.max(...closed.map((t) => t.profitLoss ?? 0)) : 0
  const worstTrade = closed.length > 0 ? Math.min(...closed.map((t) => t.profitLoss ?? 0)) : 0

  const dayPnL = new Map<string, number>()
  const sessionPnL = new Map<string, number>()
  const modelCount = new Map<string, number>()

  for (const trade of closed) {
    const day = trade.entryDate
    dayPnL.set(day, (dayPnL.get(day) ?? 0) + (trade.profitLoss ?? 0))

    const sessions = trade.entrySession.split(' + ')
    for (const session of sessions) {
      sessionPnL.set(session, (sessionPnL.get(session) ?? 0) + (trade.profitLoss ?? 0))
    }

    if (trade.entryModel) {
      modelCount.set(trade.entryModel, (modelCount.get(trade.entryModel) ?? 0) + 1)
    }
  }

  const bestDay = [...dayPnL.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'
  const worstDay = [...dayPnL.entries()].sort((a, b) => a[1] - b[1])[0]?.[0] ?? '-'
  const bestSession = [...sessionPnL.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'
  const worstSession = [...sessionPnL.entries()].sort((a, b) => a[1] - b[1])[0]?.[0] ?? '-'
  const mostUsedEntryModel = [...modelCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'

  const rrs = closed.map((t) => t.rr ?? 0)
  const holdingTimes = closed.map(getHoldingTimeMinutes).filter((t) => t > 0)

  return {
    ...base,
    bestTrade,
    worstTrade,
    bestDay,
    worstDay,
    bestSession,
    worstSession,
    mostUsedEntryModel,
    highestRR: rrs.length > 0 ? Math.max(...rrs) : 0,
    lowestRR: rrs.length > 0 ? Math.min(...rrs) : 0,
    averageHoldingTime: holdingTimes.length > 0 ? holdingTimes.reduce((a, b) => a + b, 0) / holdingTimes.length : 0,
  }
}

export function computeSessionStats(trades: Trade[], sessionName: string): SessionStats {
  const closed = filterClosedTrades(trades).filter((t) =>
    t.entrySession.split(' + ').includes(sessionName)
  )
  const wins = closed.filter((t) => (t.profitLoss ?? 0) > 0)
  const losses = closed.filter((t) => (t.profitLoss ?? 0) < 0)
  const profit = wins.reduce((sum, t) => sum + (t.profitLoss ?? 0), 0)
  const loss = Math.abs(losses.reduce((sum, t) => sum + (t.profitLoss ?? 0), 0))
  const netRR = closed.reduce((sum, t) => sum + (t.rr ?? 0), 0)

  return {
    session: sessionName,
    totalTrades: closed.length,
    wins: wins.length,
    losses: losses.length,
    netRR,
    averageRR: closed.length > 0 ? netRR / closed.length : 0,
    winRate: closed.length > 0 ? (wins.length / closed.length) * 100 : 0,
    profit,
    loss,
  }
}

export function computeGroupStats(trades: Trade[], groupKey: keyof Trade): GroupStats[] {
  const closed = filterClosedTrades(trades)
  const groups = new Map<string, Trade[]>()

  for (const trade of closed) {
    const key = String(trade[groupKey] || 'Unknown')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(trade)
  }

  return [...groups.entries()].map(([name, groupTrades]) => {
    const wins = groupTrades.filter((t) => (t.profitLoss ?? 0) > 0)
    const losses = groupTrades.filter((t) => (t.profitLoss ?? 0) < 0)
    const totalProfit = wins.reduce((sum, t) => sum + (t.profitLoss ?? 0), 0)
    const totalLoss = Math.abs(losses.reduce((sum, t) => sum + (t.profitLoss ?? 0), 0))
    const totalRR = groupTrades.reduce((sum, t) => sum + (t.rr ?? 0), 0)

    return {
      name,
      totalTrades: groupTrades.length,
      wins: wins.length,
      losses: losses.length,
      winRate: groupTrades.length > 0 ? (wins.length / groupTrades.length) * 100 : 0,
      averageRR: groupTrades.length > 0 ? totalRR / groupTrades.length : 0,
      totalRR,
      totalProfit,
      totalLoss,
      largestWin: wins.length > 0 ? Math.max(...wins.map((t) => t.profitLoss ?? 0)) : 0,
      largestLoss: losses.length > 0 ? Math.min(...losses.map((t) => t.profitLoss ?? 0)) : 0,
    }
  })
}

export function filterTrades(trades: Trade[], filters: FilterOptions): Trade[] {
  return trades.filter((trade) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const searchable = [
        trade.id,
        trade.instrument,
        trade.entryModel,
        trade.notes,
        trade.tags.join(' '),
        trade.accountName,
      ]
        .join(' ')
        .toLowerCase()
      if (!searchable.includes(q)) return false
    }

    if (filters.dateFrom && trade.entryDate < filters.dateFrom) return false
    if (filters.dateTo && trade.entryDate > filters.dateTo) return false
    if (filters.instrument && trade.instrument !== filters.instrument) return false
    if (filters.entryModel && trade.entryModel !== filters.entryModel) return false
    if (filters.session && !trade.entrySession.includes(filters.session)) return false
    if (filters.result) {
      const result = getTradeResult(trade.profitLoss)
      if (result !== filters.result) return false
    }
    if (filters.rrMin !== undefined && (trade.rr ?? 0) < filters.rrMin) return false
    if (filters.rrMax !== undefined && (trade.rr ?? 0) > filters.rrMax) return false
    if (filters.tags && !trade.tags.some((t) => t.toLowerCase().includes(filters.tags!.toLowerCase())))
      return false
    if (filters.month !== undefined && dayjs(trade.entryDate).month() + 1 !== filters.month) return false
    if (filters.year !== undefined && trade.entryYear !== filters.year) return false
    if (filters.timeframe && trade.timeframe !== filters.timeframe) return false

    return true
  })
}

export function getTradesForPeriod(trades: Trade[], period: 'today' | 'week' | 'month' | 'year'): Trade[] {
  const now = dayjs()
  return trades.filter((trade) => {
    const d = dayjs(trade.entryDate)
    switch (period) {
      case 'today':
        return d.isSame(now, 'day')
      case 'week':
        return d.isSame(now, 'week')
      case 'month':
        return d.isSame(now, 'month')
      case 'year':
        return d.isSame(now, 'year')
      default:
        return true
    }
  })
}

export function getProfitCurveData(trades: Trade[]): { date: string; pnl: number; cumulative: number }[] {
  const closed = filterClosedTrades(trades).sort((a, b) =>
    `${a.exitDate} ${a.exitTime}`.localeCompare(`${b.exitDate} ${b.exitTime}`)
  )

  let cumulative = 0
  return closed.map((trade) => {
    cumulative += trade.netPnl ?? trade.profitLoss ?? 0
    return {
      date: trade.exitDate ?? trade.entryDate,
      pnl: trade.profitLoss ?? 0,
      cumulative,
    }
  })
}

export function getRRChartData(
  trades: Trade[],
  groupBy: 'daily' | 'weekly' | 'monthly'
): { label: string; rr: number }[] {
  const closed = filterClosedTrades(trades)
  const groups = new Map<string, number>()

  for (const trade of closed) {
    let key: string
    const d = dayjs(trade.entryDate)
    switch (groupBy) {
      case 'daily':
        key = d.format('MMM D')
        break
      case 'weekly':
        key = `W${d.week()}`
        break
      case 'monthly':
        key = d.format('MMM YYYY')
        break
    }
    groups.set(key, (groups.get(key) ?? 0) + (trade.rr ?? 0))
  }

  return [...groups.entries()].map(([label, rr]) => ({ label, rr }))
}

export function getCalendarData(
  trades: Trade[],
  year: number,
  month: number
): Map<number, { pnl: number; trades: Trade[] }> {
  const result = new Map<number, { pnl: number; trades: Trade[] }>()
  const monthTrades = trades.filter((t) => {
    const d = dayjs(t.entryDate)
    return d.year() === year && d.month() + 1 === month
  })

  for (const trade of monthTrades) {
    const day = dayjs(trade.entryDate).date()
    if (!result.has(day)) result.set(day, { pnl: 0, trades: [] })
    const entry = result.get(day)!
    entry.trades.push(trade)
    if (trade.status === 'closed') {
      entry.pnl += trade.profitLoss ?? 0
    }
  }

  return result
}

export function getWeeklyBreakdown(trades: Trade[], year: number, month: number): { week: number; stats: TradeStats }[] {
  const monthTrades = trades.filter((t) => {
    const d = dayjs(t.entryDate)
    return d.year() === year && d.month() + 1 === month
  })

  const weeks = new Map<number, Trade[]>()
  for (const trade of monthTrades) {
    const week = dayjs(trade.entryDate).week()
    if (!weeks.has(week)) weeks.set(week, [])
    weeks.get(week)!.push(trade)
  }

  return [...weeks.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([week, weekTrades]) => ({ week, stats: computeTradeStats(weekTrades) }))
}
