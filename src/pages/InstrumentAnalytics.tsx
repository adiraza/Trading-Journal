import { useMemo } from 'react'
import { useTrades } from '../hooks/useTrades'
import { Card } from '../components/ui/Card'
import { ChartCard } from '../components/ui/Charts'
import { PnlValue } from '../components/ui/PnlValue'
import { computeGroupStats } from '../utils/analytics'

export function InstrumentAnalyticsPage() {
  const { trades } = useTrades()

  const instrumentStats = useMemo(() => {
    const stats = computeGroupStats(trades, 'instrument')
    return stats.sort((a, b) => (b.totalProfit - b.totalLoss) - (a.totalProfit - a.totalLoss))
  }, [trades])

  const best = instrumentStats[0]
  const worst = instrumentStats[instrumentStats.length - 1]

  const chartData = instrumentStats.map((i) => ({
    name: i.name,
    profit: i.totalProfit,
    loss: i.totalLoss,
    winRate: i.winRate,
    rr: i.totalRR,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Instrument Analytics</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">Performance grouped by instrument</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card title="Best Instrument">
          <p className="text-lg font-bold">{best?.name ?? '-'}</p>
          {best && <PnlValue value={best.totalProfit - best.totalLoss} className="text-sm" />}
        </Card>
        <Card title="Worst Instrument">
          <p className="text-lg font-bold">{worst?.name ?? '-'}</p>
          {worst && <PnlValue value={worst.totalProfit - worst.totalLoss} className="text-sm" />}
        </Card>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              <th className="px-4 py-3 text-left">Instrument</th>
              <th className="px-4 py-3 text-left">Trades</th>
              <th className="px-4 py-3 text-left">Wins</th>
              <th className="px-4 py-3 text-left">Losses</th>
              <th className="px-4 py-3 text-left">Profit</th>
              <th className="px-4 py-3 text-left">Loss</th>
              <th className="px-4 py-3 text-left">RR</th>
              <th className="px-4 py-3 text-left">Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {instrumentStats.map((i) => (
              <tr key={i.name} className="border-b border-[var(--color-border)]/50">
                <td className="px-4 py-3 font-medium">{i.name}</td>
                <td className="px-4 py-3">{i.totalTrades}</td>
                <td className="px-4 py-3 text-[var(--color-profit)]">{i.wins}</td>
                <td className="px-4 py-3 text-[var(--color-loss)]">{i.losses}</td>
                <td className="px-4 py-3"><PnlValue value={i.totalProfit} /></td>
                <td className="px-4 py-3"><PnlValue value={-i.totalLoss} /></td>
                <td className="px-4 py-3">{i.totalRR.toFixed(2)}R</td>
                <td className="px-4 py-3">{i.winRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {chartData.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Win Rate by Instrument" data={chartData} type="bar" dataKey="winRate" xKey="name" color="#3b82f6" />
          <ChartCard title="Total RR by Instrument" data={chartData} type="bar" dataKey="rr" xKey="name" color="#22c55e" />
        </div>
      )}
    </div>
  )
}
