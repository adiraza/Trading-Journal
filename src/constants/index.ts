export const INSTRUMENTS = [
  'EURUSD',
  'GBPUSD',
  'USDJPY',
  'AUDUSD',
  'USDCAD',
  'NZDUSD',
  'EURGBP',
  'NAS100',
  'US30',
  'SPX500',
  'BTCUSD',
  'ETHUSD',
  'XAUUSD',
  'XAGUSD',
  'Custom',
] as const

export const ENTRY_MODELS = [
  'SMC Pullback',
  'Order Block',
  'Breaker',
  'Mitigation',
  'FVG',
  'Liquidity Sweep',
  'MSS',
  'CHOCH',
  'BOS',
  'Custom',
] as const

export const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'] as const

export const TRADE_TYPES = ['Scalp', 'Day Trade', 'Swing', 'Position'] as const

export const MARKET_STRUCTURES = ['Bullish', 'Bearish', 'Ranging', 'Breakout', 'Reversal'] as const

export const EXIT_REASONS = [
  { value: 'manual_close', label: 'Manual Close' },
  { value: 'tp', label: 'TP' },
  { value: 'sl', label: 'SL' },
  { value: 'partial_close', label: 'Partial Close' },
  { value: 'be', label: 'BE' },
  { value: 'trailing_stop', label: 'Trailing Stop' },
  { value: 'time_exit', label: 'Time Exit' },
  { value: 'other', label: 'Other' },
] as const

export const SESSIONS = ['Asian', 'London', 'New York', 'Sydney'] as const

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'] as const

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
