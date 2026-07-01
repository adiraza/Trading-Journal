export type TradeDirection = 'buy' | 'sell'
export type TradeStatus = 'open' | 'closed'
export type ThemeMode = 'dark' | 'light'

export type ExitReason =
  | 'manual_close'
  | 'tp'
  | 'sl'
  | 'partial_close'
  | 'be'
  | 'trailing_stop'
  | 'time_exit'
  | 'other'

export interface TradeImage {
  id: string
  data: string
  name: string
  createdAt: string
}

export interface Trade {
  id: string
  entryDate: string
  entryTime: string
  entryDayName: string
  entryMonth: string
  entryWeekNumber: number
  entryYear: number
  entrySession: string
  instrument: string
  direction: TradeDirection
  lotSize: number
  accountName: string
  accountSize: number
  entryPrice: number
  stopLoss: number
  takeProfit: number
  riskAmount: number
  riskPercent: number
  entryModel: string
  marketStructure: string
  timeframe: string
  tradeType: string
  notes: string
  psychologyNotes: string
  mistakes: string
  lessons: string
  tags: string[]
  beforeEntryImages: TradeImage[]
  status: TradeStatus
  exitDate?: string
  exitTime?: string
  exitDayName?: string
  exitSession?: string
  exitPrice?: number
  exitReason?: ExitReason
  profitLoss?: number
  profitLossPercent?: number
  riskPercentActual?: number
  rr?: number
  roi?: number
  netPnl?: number
  exitNotes?: string
  afterExitImages?: TradeImage[]
  createdAt: string
  updatedAt: string
}

export interface SessionTiming {
  name: string
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
}

export interface AppSettings {
  id: string
  defaultAccountSize: number
  defaultCurrency: string
  riskPerTrade: number
  commission: number
  spread: number
  tradingDays: number[]
  preferredTimeZone: string
  sessionTimings: SessionTiming[]
  theme: ThemeMode
}

export interface TradeStats {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  breakevenTrades: number
  totalProfit: number
  totalLoss: number
  netPnl: number
  netRR: number
  winRate: number
  averageRR: number
  profitFactor: number
  largestWin: number
  largestLoss: number
  averageWin: number
  averageLoss: number
  expectancy: number
  currentStreak: number
  longestWinStreak: number
  longestLossStreak: number
}

export interface PeriodStats extends TradeStats {
  bestTrade: number
  worstTrade: number
  bestDay: string
  worstDay: string
  bestSession: string
  worstSession: string
  mostUsedEntryModel: string
  highestRR: number
  lowestRR: number
  averageHoldingTime: number
}

export interface SessionStats {
  session: string
  totalTrades: number
  wins: number
  losses: number
  netRR: number
  averageRR: number
  winRate: number
  profit: number
  loss: number
}

export interface GroupStats {
  name: string
  totalTrades: number
  wins: number
  losses: number
  winRate: number
  averageRR: number
  totalRR: number
  totalProfit: number
  totalLoss: number
  largestWin: number
  largestLoss: number
}

export interface FilterOptions {
  search?: string
  dateFrom?: string
  dateTo?: string
  instrument?: string
  entryModel?: string
  session?: string
  result?: 'win' | 'loss' | 'breakeven' | 'open'
  rrMin?: number
  rrMax?: number
  tags?: string
  month?: number
  year?: number
  timeframe?: string
}
