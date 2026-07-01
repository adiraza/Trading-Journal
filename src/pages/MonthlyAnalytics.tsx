import { useMemo } from 'react'
import dayjs from 'dayjs'
import { useTrades } from '../hooks/useTrades'
import { useSettings } from '../hooks/useSettings'
import { StatCard } from '../components/ui/StatCard'
import { ChartCard } from '../components/ui/Charts'
import { Card } from '../components/ui/Card'
import { PnlValue } from '../components/ui/PnlValue'
import {
  computePeriodStats,
  getTradesForPeriod,
  getProfitCurveData,
  getWeeklyBreakdown,
  getCalendarData,
} from '../utils/analytics'
import { formatCurrency } from '../utils/calculations'
import { formatHoldingTime } from '../utils/dates'
import { clsx } from 'clsx'

export function MonthlyAnalyticsPage() {
  const { trades } = useTrades()
  const { settings } = useSettings()

  const monthTrades = useMemo(() => getTradesForPeriod(trades, 'month'), [trades])
  const stats = useMemo(() => computePeriodStats(monthTrades), [monthTrades])
  const equityCurve = useMemo(() => getProfitCurveData(monthTrades), [monthTrades])
  const weeklyBreakdown = useMemo(
    () => getWeeklyBreakdown(trades, dayjs().year(), dayjs().month() + 1),
    [trades]
  )

  const year = dayjs().year()
  const month = dayjs().month() + 1
  const calendarData = useMemo(() => getCalendarData(trades, year, month), [trades, year, month])
  const currency = settings.defaultCurrency

  const bestWeek = weeklyBreakdown.sort((a, b) => b.stats.netPnl - a.stats.netPnl)[0]
  const worstWeek = weeklyBreakdown.sort((a, b) => a.stats.netPnl - b.stats.netPnl)[0]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Monthly Analytics</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">{dayjs().format('MMMM YYYY')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Trades" value={stats.totalTrades} />
        <StatCard label="Wins" value={stats.winningTrades} colorClass="text-[var(--color-profit)]" />
        <StatCard label="Losses" value={stats.losingTrades} colorClass="text-[var(--color-loss)]" />
        <StatCard label="Monthly Profit" value={formatCurrency(stats.totalProfit, currency)} colorClass="text-[var(--color-profit)]" />
        <StatCard label="Monthly Loss" value={formatCurrency(stats.totalLoss, currency)} colorClass="text-[var(--color-loss)]" />
        <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} />
        <StatCard label="Expectancy" value={formatCurrency(stats.expectancy, currency)} />
        <StatCard label="Total RR" value={`${stats.netRR.toFixed(2)}R`} />
        <StatCard label="Avg RR" value={`${stats.averageRR.toFixed(2)}R`} />
        <StatCard label="Avg Daily RR" value={`${stats.totalTrades > 0 ? (stats.netRR / Math.max(dayjs().date(), 1)).toFixed(2) : '0'}R`} />
        <StatCard label="Best Trade" value={formatCurrency(stats.bestTrade, currency)} colorClass="text-[var(--color-profit)]" />
        <StatCard label="Worst Trade" value={formatCurrency(stats.worstTrade, currency)} colorClass="text-[var(--color-loss)]" />
      </div>

      <ChartCard title="Monthly Equity Curve" data={equityCurve} type="line" dataKey="cumulative" xKey="date" color="#22c55e" height={300} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Weekly Breakdown">
          <div className="space-y-2">
            {weeklyBreakdown.map(({ week, stats: ws }) => (
              <div key={week} className="flex items-center justify-between rounded-lg bg-[var(--color-surface)] p-3">
                <span className="font-medium">Week {week}</span>
                <div className="flex gap-4 text-sm">
                  <span>{ws.totalTrades} trades</span>
                  <span>{ws.winRate.toFixed(0)}% WR</span>
                  <PnlValue value={ws.netPnl} prefix={`${currency} `} />
                </div>
              </div>
            ))}
            {weeklyBreakdown.length === 0 && (
              <p className="text-sm text-[var(--color-text-secondary)]">No data this month</p>
            )}
          </div>
        </Card>

        <Card title="Highlights">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-[var(--color-surface)] p-3">
              <p className="text-xs text-[var(--color-text-secondary)]">Best Week</p>
              <p className="font-semibold">Week {bestWeek?.week ?? '-'}</p>
              {bestWeek && <PnlValue value={bestWeek.stats.netPnl} className="text-sm" />}
            </div>
            <div className="rounded-lg bg-[var(--color-surface)] p-3">
              <p className="text-xs text-[var(--color-text-secondary)]">Worst Week</p>
              <p className="font-semibold">Week {worstWeek?.week ?? '-'}</p>
              {worstWeek && <PnlValue value={worstWeek.stats.netPnl} className="text-sm" />}
            </div>
            <div className="rounded-lg bg-[var(--color-surface)] p-3">
              <p className="text-xs text-[var(--color-text-secondary)]">Best Day</p>
              <p className="font-semibold">{stats.bestDay}</p>
            </div>
            <div className="rounded-lg bg-[var(--color-surface)] p-3">
              <p className="text-xs text-[var(--color-text-secondary)]">Worst Day</p>
              <p className="font-semibold">{stats.worstDay}</p>
            </div>
            <div className="rounded-lg bg-[var(--color-surface)] p-3">
              <p className="text-xs text-[var(--color-text-secondary)]">Avg Hold Time</p>
              <p className="font-semibold">{formatHoldingTime(stats.averageHoldingTime)}</p>
            </div>
            <div className="rounded-lg bg-[var(--color-surface)] p-3">
              <p className="text-xs text-[var(--color-text-secondary)]">Most Used Model</p>
              <p className="font-semibold">{stats.mostUsedEntryModel}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Monthly Calendar">
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: dayjs().daysInMonth() }, (_, i) => {
            const day = i + 1
            const data = calendarData.get(day)
            const pnl = data?.pnl ?? 0
            const hasTrades = data && data.trades.length > 0
            return (
              <div
                key={day}
                className={clsx(
                  'flex min-h-[40px] flex-col items-center justify-center rounded text-xs',
                  hasTrades
                    ? pnl > 0
                      ? 'bg-green-500/10 text-green-400'
                      : pnl < 0
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-gray-500/10'
                    : ''
                )}
              >
                <span>{day}</span>
                {hasTrades && <PnlValue value={pnl} className="text-[10px]" />}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
