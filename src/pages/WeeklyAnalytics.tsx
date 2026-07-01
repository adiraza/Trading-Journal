import { useMemo } from 'react'
import dayjs from 'dayjs'
import { useTrades } from '../hooks/useTrades'
import { useSettings } from '../hooks/useSettings'
import { StatCard } from '../components/ui/StatCard'
import { ChartCard } from '../components/ui/Charts'
import { Card } from '../components/ui/Card'
import { computePeriodStats, getTradesForPeriod, getRRChartData } from '../utils/analytics'
import { formatCurrency } from '../utils/calculations'
import { formatHoldingTime } from '../utils/dates'

export function WeeklyAnalyticsPage() {
  const { trades } = useTrades()
  const { settings } = useSettings()

  const weekTrades = useMemo(() => getTradesForPeriod(trades, 'week'), [trades])
  const stats = useMemo(() => computePeriodStats(weekTrades), [weekTrades])
  const dailyRR = useMemo(() => getRRChartData(weekTrades, 'daily'), [weekTrades])
  const currency = settings.defaultCurrency

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Weekly Analytics</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Week {dayjs().week()} - {dayjs().format('MMMM YYYY')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Trades" value={stats.totalTrades} />
        <StatCard label="Wins" value={stats.winningTrades} colorClass="text-[var(--color-profit)]" />
        <StatCard label="Losses" value={stats.losingTrades} colorClass="text-[var(--color-loss)]" />
        <StatCard label="Breakeven" value={stats.breakevenTrades} />
        <StatCard label="Total RR" value={`${stats.netRR >= 0 ? '+' : ''}${stats.netRR.toFixed(2)}R`} />
        <StatCard label="Avg RR" value={`${stats.averageRR.toFixed(2)}R`} />
        <StatCard label="Net Profit" value={formatCurrency(stats.totalProfit, currency)} colorClass="text-[var(--color-profit)]" />
        <StatCard label="Net Loss" value={formatCurrency(stats.totalLoss, currency)} colorClass="text-[var(--color-loss)]" />
        <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} />
        <StatCard label="Best Trade" value={formatCurrency(stats.bestTrade, currency)} colorClass="text-[var(--color-profit)]" />
        <StatCard label="Worst Trade" value={formatCurrency(stats.worstTrade, currency)} colorClass="text-[var(--color-loss)]" />
        <StatCard label="Highest RR" value={`${stats.highestRR.toFixed(2)}R`} />
        <StatCard label="Lowest RR" value={`${stats.lowestRR.toFixed(2)}R`} />
        <StatCard label="Avg Hold Time" value={formatHoldingTime(stats.averageHoldingTime)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Highlights">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-[var(--color-surface)] p-3">
              <p className="text-xs text-[var(--color-text-secondary)]">Best Day</p>
              <p className="font-semibold">{stats.bestDay}</p>
            </div>
            <div className="rounded-lg bg-[var(--color-surface)] p-3">
              <p className="text-xs text-[var(--color-text-secondary)]">Worst Day</p>
              <p className="font-semibold">{stats.worstDay}</p>
            </div>
            <div className="rounded-lg bg-[var(--color-surface)] p-3">
              <p className="text-xs text-[var(--color-text-secondary)]">Best Session</p>
              <p className="font-semibold">{stats.bestSession}</p>
            </div>
            <div className="rounded-lg bg-[var(--color-surface)] p-3">
              <p className="text-xs text-[var(--color-text-secondary)]">Worst Session</p>
              <p className="font-semibold">{stats.worstSession}</p>
            </div>
            <div className="rounded-lg bg-[var(--color-surface)] p-3 sm:col-span-2">
              <p className="text-xs text-[var(--color-text-secondary)]">Most Used Entry Model</p>
              <p className="font-semibold">{stats.mostUsedEntryModel}</p>
            </div>
          </div>
        </Card>
        <ChartCard title="Daily RR This Week" data={dailyRR} type="bar" dataKey="rr" xKey="label" />
      </div>
    </div>
  )
}
