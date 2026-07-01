import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Award,
  Flame,
} from 'lucide-react'
import { useTrades } from '../hooks/useTrades'
import { useSettings } from '../hooks/useSettings'
import { StatCard } from '../components/ui/StatCard'
import { ChartCard } from '../components/ui/Charts'
import { Card } from '../components/ui/Card'
import { PnlValue } from '../components/ui/PnlValue'
import { Button } from '../components/ui/Button'
import {
  computeTradeStats,
  computeGroupStats,
  computeSessionStats,
  getProfitCurveData,
  getRRChartData,
  getTradesForPeriod,
} from '../utils/analytics'
import { formatCurrency } from '../utils/calculations'
import { SESSIONS } from '../constants'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good Morning'
  if (hour >= 12 && hour < 17) return 'Good Afternoon'
  if (hour >= 17 && hour < 21) return 'Good Evening'
  return 'Welcome Back'
}

export function DashboardPage() {
  const { trades } = useTrades()
  const { settings } = useSettings()
  const greeting = getGreeting()

  const allStats = useMemo(() => computeTradeStats(trades), [trades])
  const todayStats = useMemo(() => computeTradeStats(getTradesForPeriod(trades, 'today')), [trades])
  const weekStats = useMemo(() => computeTradeStats(getTradesForPeriod(trades, 'week')), [trades])
  const monthStats = useMemo(() => computeTradeStats(getTradesForPeriod(trades, 'month')), [trades])
  const yearStats = useMemo(() => computeTradeStats(getTradesForPeriod(trades, 'year')), [trades])

  const profitCurve = useMemo(() => getProfitCurveData(trades), [trades])
  const weeklyRR = useMemo(() => getRRChartData(trades, 'weekly'), [trades])
  const monthlyRR = useMemo(() => getRRChartData(trades, 'monthly'), [trades])
  const dailyRR = useMemo(() => getRRChartData(trades, 'daily').slice(-14), [trades])

  const sessionStats = useMemo(
    () =>
      SESSIONS.map((s) => {
        const stats = computeSessionStats(trades, s)
        return {
          session: s,
          trades: stats.totalTrades,
          profit: stats.profit,
          loss: stats.loss,
          net: stats.profit - stats.loss,
        }
      }),
    [trades]
  )

  const entryModelStats = useMemo(() => computeGroupStats(trades, 'entryModel').slice(0, 8), [trades])
  const instrumentStats = useMemo(() => computeGroupStats(trades, 'instrument').slice(0, 8), [trades])

  const currency = settings.defaultCurrency

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {settings.traderName ? `${greeting}, ${settings.traderName}` : greeting}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Your trading performance overview</p>
        </div>
        <Link to="/new-trade">
          <Button>
            <TrendingUp size={16} /> New Trade
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Today" value={todayStats.totalTrades} subValue={`P/L: ${formatCurrency(todayStats.netPnl, currency)}`} />
        <StatCard label="This Week" value={weekStats.totalTrades} subValue={`P/L: ${formatCurrency(weekStats.netPnl, currency)}`} />
        <StatCard label="This Month" value={monthStats.totalTrades} subValue={`P/L: ${formatCurrency(monthStats.netPnl, currency)}`} />
        <StatCard label="This Year" value={yearStats.totalTrades} subValue={`P/L: ${formatCurrency(yearStats.netPnl, currency)}`} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard
          label="Total Profit"
          value={formatCurrency(allStats.totalProfit, currency)}
          colorClass="text-[var(--color-profit)]"
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          label="Total Loss"
          value={formatCurrency(allStats.totalLoss, currency)}
          colorClass="text-[var(--color-loss)]"
          icon={<TrendingDown size={16} />}
        />
        <StatCard
          label="Net P/L"
          value={formatCurrency(allStats.netPnl, currency)}
          colorClass={allStats.netPnl >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}
        />
        <StatCard label="Net RR" value={`${allStats.netRR >= 0 ? '+' : ''}${allStats.netRR.toFixed(2)}R`} />
        <StatCard label="Win Rate" value={`${allStats.winRate.toFixed(1)}%`} icon={<Target size={16} />} />
        <StatCard label="Avg RR" value={`${allStats.averageRR.toFixed(2)}R`} />
        <StatCard label="Profit Factor" value={allStats.profitFactor >= 999 ? '∞' : allStats.profitFactor.toFixed(2)} />
        <StatCard label="Largest Win" value={formatCurrency(allStats.largestWin, currency)} colorClass="text-[var(--color-profit)]" />
        <StatCard label="Largest Loss" value={formatCurrency(allStats.largestLoss, currency)} colorClass="text-[var(--color-loss)]" />
        <StatCard label="Avg Win" value={formatCurrency(allStats.averageWin, currency)} colorClass="text-[var(--color-profit)]" />
        <StatCard label="Avg Loss" value={formatCurrency(allStats.averageLoss, currency)} colorClass="text-[var(--color-loss)]" />
        <StatCard label="Expectancy" value={formatCurrency(allStats.expectancy, currency)} icon={<Activity size={16} />} />
        <StatCard
          label="Current Streak"
          value={allStats.currentStreak > 0 ? `+${allStats.currentStreak}W` : allStats.currentStreak < 0 ? `${allStats.currentStreak}L` : '0'}
          icon={<Flame size={16} />}
        />
        <StatCard label="Longest Win Streak" value={allStats.longestWinStreak} icon={<Award size={16} />} />
        <StatCard label="Longest Loss Streak" value={allStats.longestLossStreak} />
        <StatCard label="Total Trades" value={allStats.totalTrades} />
        <StatCard label="Wins" value={allStats.winningTrades} colorClass="text-[var(--color-profit)]" />
        <StatCard label="Losses" value={allStats.losingTrades} colorClass="text-[var(--color-loss)]" />
        <StatCard label="Breakeven" value={allStats.breakevenTrades} colorClass="text-[var(--color-neutral)]" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Profit Curve" data={profitCurve} type="line" dataKey="cumulative" xKey="date" color="#22c55e" />
        <ChartCard title="Weekly RR" data={weeklyRR} type="bar" dataKey="rr" xKey="label" color="#3b82f6" />
        <ChartCard title="Monthly RR" data={monthlyRR} type="bar" dataKey="rr" xKey="label" color="#8b5cf6" />
        <ChartCard title="Daily RR (Last 14 Days)" data={dailyRR} type="bar" dataKey="rr" xKey="label" color="#f59e0b" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Session Analysis">
          <div className="space-y-2">
            {sessionStats.map((s) => (
              <div key={s.session} className="flex items-center justify-between rounded-lg bg-[var(--color-surface)] p-2">
                <span className="text-sm font-medium">{s.session}</span>
                <div className="text-right">
                  <p className="text-xs text-[var(--color-text-secondary)]">{s.trades} trades</p>
                  <PnlValue value={s.net} prefix={currency + ' '} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Entry Model Analysis">
          <div className="space-y-2">
            {entryModelStats.map((m) => (
              <div key={m.name} className="flex items-center justify-between rounded-lg bg-[var(--color-surface)] p-2">
                <span className="truncate text-sm font-medium">{m.name}</span>
                <div className="text-right">
                  <p className="text-xs text-[var(--color-text-secondary)]">{m.winRate.toFixed(0)}% WR</p>
                  <span className="text-sm font-semibold">{m.totalTrades} trades</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Instrument Analysis">
          <div className="space-y-2">
            {instrumentStats.map((i) => (
              <div key={i.name} className="flex items-center justify-between rounded-lg bg-[var(--color-surface)] p-2">
                <span className="text-sm font-medium">{i.name}</span>
                <div className="text-right">
                  <p className="text-xs text-[var(--color-text-secondary)]">{i.winRate.toFixed(0)}% WR</p>
                  <PnlValue value={i.totalProfit - i.totalLoss} prefix={currency + ' '} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
