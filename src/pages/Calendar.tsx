import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTrades } from '../hooks/useTrades'
import { useSettings } from '../hooks/useSettings'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PnlValue } from '../components/ui/PnlValue'
import { getCalendarData } from '../utils/analytics'
import { clsx } from 'clsx'
import type { Trade } from '../types'

export function CalendarPage() {
  const { trades } = useTrades()
  const { settings } = useSettings()
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [selectedDay, setSelectedDay] = useState<{ day: number; trades: Trade[] } | null>(null)

  const year = currentDate.year()
  const month = currentDate.month() + 1
  const daysInMonth = currentDate.daysInMonth()
  const firstDayOfWeek = currentDate.startOf('month').day()

  const calendarData = useMemo(() => getCalendarData(trades, year, month), [trades, year, month])

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'))
  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'))

  const dayCells = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    dayCells.push(<div key={`empty-${i}`} />)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const data = calendarData.get(day)
    const pnl = data?.pnl ?? 0
    const hasTrades = data && data.trades.length > 0

    dayCells.push(
      <button
        key={day}
        onClick={() => data && setSelectedDay({ day, trades: data.trades })}
        className={clsx(
          'flex min-h-[60px] flex-col items-center justify-center rounded-lg border p-1 transition-all sm:min-h-[80px]',
          hasTrades
            ? pnl > 0
              ? 'border-green-500/30 bg-green-500/10 hover:bg-green-500/20'
              : pnl < 0
                ? 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20'
                : 'border-gray-500/30 bg-gray-500/10 hover:bg-gray-500/20'
            : 'border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)]'
        )}
      >
        <span className="text-sm font-medium">{day}</span>
        {hasTrades && (
          <PnlValue value={pnl} className="text-xs" />
        )}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={prevMonth}><ChevronLeft size={18} /></Button>
          <span className="min-w-[140px] text-center font-semibold">{currentDate.format('MMMM YYYY')}</span>
          <Button variant="ghost" size="sm" onClick={nextMonth}><ChevronRight size={18} /></Button>
        </div>
      </div>

      <div className="flex gap-4 text-xs text-[var(--color-text-secondary)]">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-green-500/30" /> Profit</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-500/30" /> Loss</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded border border-[var(--color-border)]" /> No Trade</span>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-[var(--color-text-secondary)]">{d}</div>
        ))}
        {dayCells}
      </div>

      {selectedDay && (
        <Card
          title={`Trades on ${currentDate.format('MMMM')} ${selectedDay.day}, ${year}`}
          action={
            <Button variant="ghost" size="sm" onClick={() => setSelectedDay(null)}>Close</Button>
          }
        >
          <div className="space-y-2">
            {selectedDay.trades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between rounded-lg bg-[var(--color-surface)] p-3">
                <div>
                  <p className="font-medium">{trade.instrument} - {trade.direction.toUpperCase()}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{trade.entryTime} | {trade.entryModel}</p>
                </div>
                {trade.status === 'closed' ? (
                  <PnlValue value={trade.profitLoss} prefix={`${settings.defaultCurrency} `} />
                ) : (
                  <span className="text-xs text-blue-400">Open</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
