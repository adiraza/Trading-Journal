import { useMemo } from 'react'
import { useTrades } from '../hooks/useTrades'
import { useSettings } from '../hooks/useSettings'
import { StatCard } from '../components/ui/StatCard'
import { MultiBarChart } from '../components/ui/Charts'
import { Card } from '../components/ui/Card'
import { PnlValue } from '../components/ui/PnlValue'
import { computeSessionStats } from '../utils/analytics'
import { formatCurrency } from '../utils/calculations'
import { SESSIONS } from '../constants'

export function SessionAnalyticsPage() {
  const { trades } = useTrades()
  const { settings } = useSettings()
  const currency = settings.defaultCurrency

  const sessionStats = useMemo(
    () => SESSIONS.map((s) => computeSessionStats(trades, s)),
    [trades]
  )

  const chartData = sessionStats.map((s) => ({
    session: s.session,
    profit: s.profit,
    loss: s.loss,
    rr: s.netRR,
  }))

  const bestSession = [...sessionStats].sort((a, b) => b.profit - b.loss - (a.profit - a.loss))[0]
  const worstSession = [...sessionStats].sort((a, b) => a.profit - a.loss - (b.profit - b.loss))[0]
  const highestRR = [...sessionStats].sort((a, b) => b.netRR - a.netRR)[0]
  const highestLoss = [...sessionStats].sort((a, b) => b.loss - a.loss)[0]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Session Analytics</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">Performance by trading session</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sessionStats.map((s) => (
          <Card key={s.session} title={`${s.session} Session`}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Trades" value={s.totalTrades} />
              <StatCard label="Wins" value={s.wins} colorClass="text-[var(--color-profit)]" />
              <StatCard label="Losses" value={s.losses} colorClass="text-[var(--color-loss)]" />
              <StatCard label="Win Rate" value={`${s.winRate.toFixed(1)}%`} />
              <StatCard label="Net RR" value={`${s.netRR.toFixed(2)}R`} />
              <StatCard label="Avg RR" value={`${s.averageRR.toFixed(2)}R`} />
              <StatCard label="Profit" value={formatCurrency(s.profit, currency)} colorClass="text-[var(--color-profit)]" />
              <StatCard label="Loss" value={formatCurrency(s.loss, currency)} colorClass="text-[var(--color-loss)]" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card title="Best Session">
          <p className="text-lg font-bold">{bestSession?.session ?? '-'}</p>
          {bestSession && <PnlValue value={bestSession.profit - bestSession.loss} className="text-sm" />}
        </Card>
        <Card title="Worst Session">
          <p className="text-lg font-bold">{worstSession?.session ?? '-'}</p>
          {worstSession && <PnlValue value={worstSession.profit - worstSession.loss} className="text-sm" />}
        </Card>
        <Card title="Highest RR Session">
          <p className="text-lg font-bold">{highestRR?.session ?? '-'}</p>
          {highestRR && <span className="text-sm font-semibold">{highestRR.netRR.toFixed(2)}R</span>}
        </Card>
        <Card title="Highest Loss Session">
          <p className="text-lg font-bold">{highestLoss?.session ?? '-'}</p>
          {highestLoss && <span className="text-sm font-semibold text-[var(--color-loss)]">{formatCurrency(highestLoss.loss, currency)}</span>}
        </Card>
      </div>

      <MultiBarChart
        title="Session Profit vs Loss"
        data={chartData}
        xKey="session"
        bars={[
          { key: 'profit', color: '#22c55e', name: 'Profit' },
          { key: 'loss', color: '#ef4444', name: 'Loss' },
        ]}
      />
    </div>
  )
}
