import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit, Trash2, Filter } from 'lucide-react'
import { useTrades } from '../hooks/useTrades'
import { useSettings } from '../hooks/useSettings'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PnlValue } from '../components/ui/PnlValue'
import { filterTrades } from '../utils/analytics'
import { formatCurrency } from '../utils/calculations'
import { INSTRUMENTS, ENTRY_MODELS, TIMEFRAMES } from '../constants'
import type { FilterOptions } from '../types'

export function TradesPage() {
  const { trades, deleteTrade } = useTrades()
  const { settings } = useSettings()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({})

  const filtered = useMemo(() => filterTrades(trades, filters), [trades, filters])

  const handleDelete = async (id: string) => {
    if (confirm('Delete this trade?')) {
      await deleteTrade(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trades</h2>
        <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
          <Filter size={16} /> Filters
        </Button>
      </div>

      {showFilters && (
        <Card title="Search & Filters">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Search"
              value={filters.search ?? ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search trades..."
            />
            <Input
              label="Date From"
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
            <Input
              label="Date To"
              type="date"
              value={filters.dateTo ?? ''}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
            <Select
              label="Instrument"
              value={filters.instrument ?? ''}
              onChange={(e) => setFilters({ ...filters, instrument: e.target.value || undefined })}
              options={[{ value: '', label: 'All' }, ...INSTRUMENTS.map((i) => ({ value: i, label: i }))]}
            />
            <Select
              label="Entry Model"
              value={filters.entryModel ?? ''}
              onChange={(e) => setFilters({ ...filters, entryModel: e.target.value || undefined })}
              options={[{ value: '', label: 'All' }, ...ENTRY_MODELS.map((m) => ({ value: m, label: m }))]}
            />
            <Select
              label="Result"
              value={filters.result ?? ''}
              onChange={(e) => setFilters({ ...filters, result: (e.target.value || undefined) as FilterOptions['result'] })}
              options={[
                { value: '', label: 'All' },
                { value: 'win', label: 'Win' },
                { value: 'loss', label: 'Loss' },
                { value: 'breakeven', label: 'Breakeven' },
                { value: 'open', label: 'Open' },
              ]}
            />
            <Select
              label="Timeframe"
              value={filters.timeframe ?? ''}
              onChange={(e) => setFilters({ ...filters, timeframe: e.target.value || undefined })}
              options={[{ value: '', label: 'All' }, ...TIMEFRAMES.map((t) => ({ value: t, label: t }))]}
            />
            <Input
              label="Tags"
              value={filters.tags ?? ''}
              onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
            />
          </div>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => setFilters({})}>
            Clear Filters
          </Button>
        </Card>
      )}

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Date</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Instrument</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Direction</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Model</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Session</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">P/L</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">RR</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Status</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                  No trades found. <Link to="/new-trade" className="text-[var(--color-accent)]">Create one</Link>
                </td>
              </tr>
            ) : (
              filtered.map((trade) => (
                <tr key={trade.id} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-surface-elevated)]/50">
                  <td className="px-4 py-3">{trade.entryDate}</td>
                  <td className="px-4 py-3 font-medium">{trade.instrument}</td>
                  <td className="px-4 py-3">
                    <span className={trade.direction === 'buy' ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'}>
                      {trade.direction.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">{trade.entryModel}</td>
                  <td className="px-4 py-3 text-xs">{trade.entrySession}</td>
                  <td className="px-4 py-3">
                    {trade.status === 'closed' ? (
                      <PnlValue value={trade.profitLoss} prefix={formatCurrency(0, settings.defaultCurrency).replace('0.00', '')} />
                    ) : (
                      <span className="text-[var(--color-text-secondary)]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {trade.rr !== undefined ? <PnlValue value={trade.rr} suffix="R" /> : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        trade.status === 'open'
                          ? 'bg-blue-500/10 text-blue-400'
                          : (trade.profitLoss ?? 0) > 0
                            ? 'bg-green-500/10 text-green-400'
                            : (trade.profitLoss ?? 0) < 0
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-gray-500/10 text-gray-400'
                      }`}
                    >
                      {trade.status === 'open' ? 'Open' : (trade.profitLoss ?? 0) > 0 ? 'Win' : (trade.profitLoss ?? 0) < 0 ? 'Loss' : 'BE'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Link to={`/edit-trade/${trade.id}`}>
                        <Button variant="ghost" size="sm"><Edit size={14} /></Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(trade.id)}>
                        <Trash2 size={14} className="text-[var(--color-loss)]" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-[var(--color-text-secondary)]">{filtered.length} trade(s)</p>
    </div>
  )
}
