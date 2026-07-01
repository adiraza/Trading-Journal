import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Award, Flame, Clock, Target, DollarSign } from 'lucide-react'
import { useTrades } from '../hooks/useTrades'
import { useSettings } from '../hooks/useSettings'
import { StatCard } from '../components/ui/StatCard'
import { Card } from '../components/ui/Card'
import {
  computeTradeStats,
  computeSessionStats,
  computeGroupStats,
} from '../utils/analytics'
import { formatCurrency } from '../utils/calculations'
import { getHoldingTimeMinutes, formatHoldingTime } from '../utils/dates'
import { SESSIONS } from '../constants'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'

dayjs.extend(weekOfYear)

export function ProfilePage() {
  const { trades } = useTrades()
  const { settings } = useSettings()
  const currency = settings.defaultCurrency

  const closedTrades = useMemo(() => trades.filter(t => t.status === 'closed' && t.profitLoss !== undefined), [trades])
  
  const stats = useMemo(() => computeTradeStats(trades), [trades])
  
  const sessionStats = useMemo(() => 
    SESSIONS.map(session => ({
      name: session,
      ...computeSessionStats(trades, session)
    })), [trades]
  )

  const entryModelStats = useMemo(() => computeGroupStats(trades, 'entryModel'), [trades])
  const instrumentStats = useMemo(() => computeGroupStats(trades, 'instrument'), [trades])

  const timeStats = useMemo(() => {
    const holdingTimes = closedTrades.map(getHoldingTimeMinutes).filter(t => t > 0)
    const totalTime = holdingTimes.reduce((sum, t) => sum + t, 0)
    const avgTime = holdingTimes.length > 0 ? totalTime / holdingTimes.length : 0
    return { totalTime, avgTime }
  }, [closedTrades])

  const tradingPeriodStats = useMemo(() => {
    const uniqueDays = new Set(trades.map(t => t.entryDate)).size
    const uniqueWeeks = new Set(trades.map(t => `${t.entryYear}-W${t.entryWeekNumber}`)).size
    const uniqueMonths = new Set(trades.map(t => `${t.entryYear}-${t.entryMonth}`)).size
    
    return {
      totalDays: uniqueDays,
      totalWeeks: uniqueWeeks,
      totalMonths: uniqueMonths,
      avgPerDay: uniqueDays > 0 ? trades.length / uniqueDays : 0,
      avgPerWeek: uniqueWeeks > 0 ? trades.length / uniqueWeeks : 0,
      avgPerMonth: uniqueMonths > 0 ? trades.length / uniqueMonths : 0,
    }
  }, [trades])

  const dayPerformance = useMemo(() => {
    const dayMap = new Map<string, { profit: number; trades: number }>()
    closedTrades.forEach(t => {
      const day = t.entryDate
      const current = dayMap.get(day) || { profit: 0, trades: 0 }
      current.profit += t.profitLoss || 0
      current.trades += 1
      dayMap.set(day, current)
    })
    const sorted = [...dayMap.entries()].sort((a, b) => b[1].profit - a[1].profit)
    return {
      best: sorted[0]?.[0] || '-',
      worst: sorted[sorted.length - 1]?.[0] || '-',
    }
  }, [closedTrades])

  const weekPerformance = useMemo(() => {
    const weekMap = new Map<string, { profit: number; trades: number }>()
    closedTrades.forEach(t => {
      const week = `${t.entryYear}-W${t.entryWeekNumber}`
      const current = weekMap.get(week) || { profit: 0, trades: 0 }
      current.profit += t.profitLoss || 0
      current.trades += 1
      weekMap.set(week, current)
    })
    const sorted = [...weekMap.entries()].sort((a, b) => b[1].profit - a[1].profit)
    return {
      best: sorted[0]?.[0] || '-',
      worst: sorted[sorted.length - 1]?.[0] || '-',
    }
  }, [closedTrades])

  const monthPerformance = useMemo(() => {
    const monthMap = new Map<string, { profit: number; trades: number }>()
    closedTrades.forEach(t => {
      const month = `${t.entryYear}-${t.entryMonth}`
      const current = monthMap.get(month) || { profit: 0, trades: 0 }
      current.profit += t.profitLoss || 0
      current.trades += 1
      monthMap.set(month, current)
    })
    const sorted = [...monthMap.entries()].sort((a, b) => b[1].profit - a[1].profit)
    return {
      best: sorted[0]?.[0] || '-',
      worst: sorted[sorted.length - 1]?.[0] || '-',
    }
  }, [closedTrades])

  const plannedStats = useMemo(() => {
    const totalRisk = trades.reduce((sum, t) => sum + (t.riskAmount || 0), 0)
    const totalReward = trades.reduce((sum, t) => sum + (t.takeProfit || 0), 0)
    return { totalRisk, totalReward }
  }, [trades])

  const mostTradedSession = useMemo(() => {
    const sessionCounts = new Map<string, number>()
    trades.forEach(t => {
      const sessions = t.entrySession.split(' + ')
      sessions.forEach(s => {
        sessionCounts.set(s, (sessionCounts.get(s) || 0) + 1)
      })
    })
    const sorted = [...sessionCounts.entries()].sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] || '-'
  }, [trades])

  const mostProfitableSession = useMemo(() => {
    const sorted = [...sessionStats].sort((a, b) => (b.profit - b.loss) - (a.profit - a.loss))
    return sorted[0]?.name || '-'
  }, [sessionStats])

  const mostLosingSession = useMemo(() => {
    const sorted = [...sessionStats].sort((a, b) => (a.profit - a.loss) - (b.profit - b.loss))
    return sorted[0]?.name || '-'
  }, [sessionStats])

  const mostUsedEntryModel = useMemo(() => {
    const sorted = [...entryModelStats].sort((a, b) => b.totalTrades - a.totalTrades)
    return sorted[0]?.name || '-'
  }, [entryModelStats])

  const mostProfitableEntryModel = useMemo(() => {
    const sorted = [...entryModelStats].sort((a, b) => (b.totalProfit - b.totalLoss) - (a.totalProfit - a.totalLoss))
    return sorted[0]?.name || '-'
  }, [entryModelStats])

  const leastProfitableEntryModel = useMemo(() => {
    const sorted = [...entryModelStats].sort((a, b) => (a.totalProfit - a.totalLoss) - (b.totalProfit - b.totalLoss))
    return sorted[0]?.name || '-'
  }, [entryModelStats])

  const favoriteInstrument = useMemo(() => {
    const sorted = [...instrumentStats].sort((a, b) => b.totalTrades - a.totalTrades)
    return sorted[0]?.name || '-'
  }, [instrumentStats])

  const mostProfitableInstrument = useMemo(() => {
    const sorted = [...instrumentStats].sort((a, b) => (b.totalProfit - b.totalLoss) - (a.totalProfit - a.totalLoss))
    return sorted[0]?.name || '-'
  }, [instrumentStats])

  const leastProfitableInstrument = useMemo(() => {
    const sorted = [...instrumentStats].sort((a, b) => (a.totalProfit - a.totalLoss) - (b.totalProfit - b.totalLoss))
    return sorted[0]?.name || '-'
  }, [instrumentStats])

  const currentStreak = stats.currentStreak
  const currentWinStreak = currentStreak > 0 ? currentStreak : 0
  const currentLossStreak = currentStreak < 0 ? Math.abs(currentStreak) : 0

  const lossRate = stats.totalTrades > 0 ? (stats.losingTrades / stats.totalTrades) * 100 : 0
  const breakevenRate = stats.totalTrades > 0 ? (stats.breakevenTrades / stats.totalTrades) * 100 : 0

  const totalRR = closedTrades.reduce((sum, t) => sum + (t.rr || 0), 0)
  const highestRR = closedTrades.length > 0 ? Math.max(...closedTrades.map(t => t.rr || 0)) : 0
  const lowestRR = closedTrades.length > 0 ? Math.min(...closedTrades.map(t => t.rr || 0)) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)] text-2xl font-bold text-white">
          {settings.traderName ? settings.traderName.charAt(0).toUpperCase() : 'T'}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {settings.traderName || 'Trader Profile'}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Lifetime Trading Statistics</p>
        </div>
      </div>

      <Card title="Overview">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Trades" value={stats.totalTrades} icon={<Target size={16} />} />
          <StatCard label="Winning Trades" value={stats.winningTrades} colorClass="text-[var(--color-profit)]" icon={<TrendingUp size={16} />} />
          <StatCard label="Losing Trades" value={stats.losingTrades} colorClass="text-[var(--color-loss)]" icon={<TrendingDown size={16} />} />
          <StatCard label="Breakeven Trades" value={stats.breakevenTrades} colorClass="text-[var(--color-neutral)]" />
        </div>
      </Card>

      <Card title="Performance Rates">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} icon={<Award size={16} />} />
          <StatCard label="Loss Rate" value={`${lossRate.toFixed(1)}%`} />
          <StatCard label="Breakeven Rate" value={`${breakevenRate.toFixed(1)}%`} />
        </div>
      </Card>

      <Card title="Risk & Reward">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total RR" value={`${totalRR.toFixed(2)}R`} />
          <StatCard label="Average RR" value={`${stats.averageRR.toFixed(2)}R`} />
          <StatCard label="Highest RR" value={`${highestRR.toFixed(2)}R`} colorClass="text-[var(--color-profit)]" />
          <StatCard label="Lowest RR" value={`${lowestRR.toFixed(2)}R`} colorClass="text-[var(--color-loss)]" />
        </div>
      </Card>

      <Card title="Profit & Loss">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Profit" value={formatCurrency(stats.totalProfit, currency)} colorClass="text-[var(--color-profit)]" icon={<TrendingUp size={16} />} />
          <StatCard label="Total Loss" value={formatCurrency(stats.totalLoss, currency)} colorClass="text-[var(--color-loss)]" icon={<TrendingDown size={16} />} />
          <StatCard label="Net Profit" value={formatCurrency(stats.netPnl, currency)} colorClass={stats.netPnl >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)'} icon={<DollarSign size={16} />} />
          <StatCard label="Profit Factor" value={stats.profitFactor >= 999 ? '∞' : stats.profitFactor.toFixed(2)} />
        </div>
      </Card>

      <Card title="Trade Analysis">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Average Profit" value={	formatCurrency(stats.averageWin, currency)} colorClass="text-[var(--color-profit)]" />
          <StatCard label="Average Loss" value={formatCurrency(stats.averageLoss, currency)} colorClass="text-[var(--color-loss)]" />
          <StatCard label="Largest Win" value={formatCurrency(stats.largestWin, currency)} colorClass="text-[var(--color-profit)]" />
          <StatCard label="Largest Loss" value={formatCurrency(stats.largestLoss, currency)} colorClass="text-[var(--color-loss)]" />
        </div>
      </Card>

      <Card title="Streaks">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Longest Win Streak" value={stats.longestWinStreak} icon={<Award size={16} />} />
          <StatCard label="Longest Loss Streak" value={stats.longestLossStreak} />
          <StatCard label="Current Win Streak" value={currentWinStreak} colorClass="text-[var(--color-profit)]" icon={<Flame size={16} />} />
          <StatCard label="Current Loss Streak" value={currentLossStreak} colorClass="text-[var(--color-loss)]" />
        </div>
      </Card>

      <Card title="Trading Activity">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total Trading Days" value={tradingPeriodStats.totalDays} />
          <StatCard label="Total Trading Weeks" value={tradingPeriodStats.totalWeeks} />
          <StatCard label="Total Trading Months" value={tradingPeriodStats.totalMonths} />
          <StatCard label="Avg Trades/Day" value={tradingPeriodStats.avgPerDay.toFixed(1)} />
          <StatCard label="Avg Trades/Week" value={tradingPeriodStats.avgPerWeek.toFixed(1)} />
          <StatCard label="Avg Trades/Month" value={tradingPeriodStats.avgPerMonth.toFixed(1)} />
        </div>
      </Card>

      <Card title="Time Analysis">
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Total Time in Trades" value={formatHoldingTime(timeStats.totalTime)} icon={<Clock size={16} />} />
          <StatCard label="Average Trade Duration" value={formatHoldingTime(timeStats.avgTime)} />
        </div>
      </Card>

      <Card title="Period Performance">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Best Day" value={dayPerformance.best} />
          <StatCard label="Worst Day" value={dayPerformance.worst} />
          <StatCard label="Best Week" value={weekPerformance.best} />
          <StatCard label="Worst Week" value={weekPerformance.worst} />
          <StatCard label="Best Month" value={monthPerformance.best} />
          <StatCard label="Worst Month" value={monthPerformance.worst} />
          <StatCard label="Best Session" value={mostProfitableSession} />
          <StatCard label="Worst Session" value={mostLosingSession} />
        </div>
      </Card>

      <Card title="Session Analysis">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Most Traded Session" value={mostTradedSession} />
          <StatCard label="Most Profitable Session" value={mostProfitableSession} colorClass="text-[var(--color-profit)]" />
          <StatCard label="Most Losing Session" value={mostLosingSession} colorClass="text-[var(--color-loss)]" />
        </div>
      </Card>

      <Card title="Entry Model Analysis">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Most Used Entry Model" value={mostUsedEntryModel} />
          <StatCard label="Most Profitable Entry Model" value={mostProfitableEntryModel} colorClass="text-[var(--color-profit)]" />
          <StatCard label="Least Profitable Entry Model" value={leastProfitableEntryModel} colorClass="text-[var(--color-loss)]" />
        </div>
      </Card>

      <Card title="Instrument Analysis">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Favorite Instrument" value={favoriteInstrument} />
          <StatCard label="Most Profitable Instrument" value={mostProfitableInstrument} colorClass="text-[var(--color-profit)]" />
          <StatCard label="Least Profitable Instrument" value={leastProfitableInstrument} colorClass="text-[var(--color-loss)]" />
        </div>
      </Card>

      <Card title="Planned vs Actual">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Planned Risk" value={formatCurrency(plannedStats.totalRisk, currency)} />
          <StatCard label="Total Planned Reward" value={formatCurrency(plannedStats.totalReward, currency)} />
          <StatCard label="Total Actual Profit" value={formatCurrency(stats.totalProfit, currency)} colorClass="text-[var(--color-profit)]" />
          <StatCard label="Total Actual Loss" value={formatCurrency(stats.totalLoss, currency)} colorClass="text-[var(--color-loss)]" />
        </div>
      </Card>
    </div>
  )
}
