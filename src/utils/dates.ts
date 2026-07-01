import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import type { SessionTiming } from '../types'

dayjs.extend(weekOfYear)

export function generateTradeId(): string {
  const now = dayjs()
  return `T-${now.format('YYYYMMDD')}-${now.format('HHmmss')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export function getDateTimeFields(date?: dayjs.Dayjs) {
  const d = date ?? dayjs()
  return {
    entryDate: d.format('YYYY-MM-DD'),
    entryTime: d.format('HH:mm'),
    entryDayName: d.format('dddd'),
    entryMonth: d.format('MMMM'),
    entryWeekNumber: d.week(),
    entryYear: d.year(),
  }
}

export function getExitDateTimeFields(date?: dayjs.Dayjs) {
  const d = date ?? dayjs()
  return {
    exitDate: d.format('YYYY-MM-DD'),
    exitTime: d.format('HH:mm'),
    exitDayName: d.format('dddd'),
  }
}

function timeToMinutes(hour: number, minute: number): number {
  return hour * 60 + minute
}

function isInSession(
  currentMinutes: number,
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number
): boolean {
  const start = timeToMinutes(startHour, startMinute)
  const end = timeToMinutes(endHour, endMinute)

  if (start <= end) {
    return currentMinutes >= start && currentMinutes < end
  }
  return currentMinutes >= start || currentMinutes < end
}

export function detectSessions(time: string, sessions: SessionTiming[]): string {
  const [hourStr, minuteStr] = time.split(':')
  const currentMinutes = timeToMinutes(parseInt(hourStr, 10), parseInt(minuteStr, 10))

  const active = sessions
    .filter((s) => isInSession(currentMinutes, s.startHour, s.startMinute, s.endHour, s.endMinute))
    .map((s) => s.name)

  return active.length > 0 ? active.join(' + ') : 'Off Hours'
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function formatHoldingTime(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (hours < 24) return `${hours}h ${mins}m`
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return `${days}d ${remainingHours}h`
}

export function getHoldingTimeMinutes(trade: {
  entryDate: string
  entryTime: string
  exitDate?: string
  exitTime?: string
}): number {
  if (!trade.exitDate || !trade.exitTime) return 0
  const entry = dayjs(`${trade.entryDate} ${trade.entryTime}`)
  const exit = dayjs(`${trade.exitDate} ${trade.exitTime}`)
  return exit.diff(entry, 'minute')
}
