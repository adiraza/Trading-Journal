import { useMemo } from 'react'
import { Trophy } from 'lucide-react'
import { useTrades } from '../hooks/useTrades'
import { Card } from '../components/ui/Card'
import { ChartCard } from '../components/ui/Charts'
import { PnlValue } from '../components/ui/PnlValue'
import { computeGroupStats } from '../utils/analytics'

export function EntryModelAnalyticsPage() {
  const { trades } = useTrades()

  const modelStats = useMemo(() => {
    const stats = computeGroupStats(trades, 'entryModel')
    return stats.sort((a, b) => b.totalRR - a.totalRR)
  }, [trades])

  const chartData = modelStats.map((m) => ({
    name: m.name.length > 12 ? m.name.slice(0, 12) + '...' : m.name,
    winRate: m.winRate,
    avgRR: m.averageRR,
    trades: m.totalTrades,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Entry Model Analytics</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">Performance grouped by entry model</p>
      </div>

      <div className="space-y-3">
        {modelStats.map((m, index) => (
          <Card key={m.name}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {index < 3 && (
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-gray-400/20 text-gray-300' :
                    'bg-amber-700/20 text-amber-500'
                  }`}>
                  <Trophy size={16} />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{m.name}</h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">{m.totalTrades} trades</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm">{m.winRate.toFixed(1)}% Win Rate</p>
                <p className="text-sm font-semibold">{m.averageRR.toFixed(2)}R Avg</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              <div className="rounded-lg bg-[var(--color-surface)] p-2 text-center">
                <p className="text-xs text-[var(--color-text-secondary)]">Wins</p>
                <p className="font-semibold text-[var(--color-profit)]">{m.wins}</p>
              </div>
              <div className="rounded-lg bg-[var(--color-surface)] p-2 text-center">
                <p className="text-xs text-[var(--color-text-secondary)]">Losses</p>
                <p className="font-semibold text-[var(--color-loss)]">{m.losses}</p>
              </div>
              <div className="rounded-lg bg-[var(--color-surface)] p-2 text-center">
                <p className="text-xs text-[var(--color-text-secondary)]">Total RR</p>
                <p className="font-semibold">{m.totalRR.toFixed(2)}R</p>
              </div>
              <div className="rounded-lg bg-[var(--color-surface)] p-2 text-center">
                <p className="text-xs text-[var(--color-text-secondary)]">Profit</p>
                <PnlValue value={m.totalProfit} className="text-sm" />
              </div>
              <div className="rounded-lg bg-[var(--color-surface)] p-2 text-center">
                <p className="text-xs text-[var(--color-text-secondary)]">Largest Win</p>
                <PnlValue value={m.largestWin} className="text-sm" />
              </div>
              <div className="rounded-lg bg-[var(--color-surface)] p-2 text-center">
                <p className="text-xs text-[var(--color-text-secondary)]">Largest Loss</p>
                <PnlValue value={m.largestLoss} className="text-sm" />
              </div>
            </div>
          </Card>
        ))}
        {modelStats.length === 0 && (
          <p className="text-center text-[var(--color-text-secondary)]">No entry model data yet</p>
        )}
      </div>

      {chartData.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Win Rate by Model" data={chartData} type="bar" dataKey="winRate" xKey="name" color="#3b82f6" />
          <ChartCard title="Avg RR by Model" data={chartData} type="bar" dataKey="avgRR" xKey="name" color="#8b5cf6" />
        </div>
      )}
    </div>
  )
}
