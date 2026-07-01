import Dexie, { type EntityTable } from 'dexie'
import type { AppSettings, Trade } from '../types'

const DEFAULT_SESSIONS = [
  { name: 'Sydney', startHour: 22, startMinute: 0, endHour: 7, endMinute: 0 },
  { name: 'Asian', startHour: 0, startMinute: 0, endHour: 9, endMinute: 0 },
  { name: 'London', startHour: 8, startMinute: 0, endHour: 16, endMinute: 0 },
  { name: 'New York', startHour: 13, startMinute: 0, endHour: 21, endMinute: 0 },
]

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'default',
  traderName: '',
  defaultAccountSize: 10000,
  defaultCurrency: 'USD',
  riskPerTrade: 1,
  commission: 0,
  spread: 0,
  tradingDays: [1, 2, 3, 4, 5],
  preferredTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  sessionTimings: DEFAULT_SESSIONS,
  theme: 'dark',
}

class TradingJournalDB extends Dexie {
  trades!: EntityTable<Trade, 'id'>
  settings!: EntityTable<AppSettings, 'id'>

  constructor() {
    super('TradingJournalDB')
    this.version(1).stores({
      trades: 'id, entryDate, entryYear, entryMonth, instrument, entryModel, status, createdAt',
      settings: 'id',
    })
  }
}

export const db = new TradingJournalDB()

export async function initDB(): Promise<void> {
  const existing = await db.settings.get('default')
  if (!existing) {
    await db.settings.put(DEFAULT_SETTINGS)
  }
}
