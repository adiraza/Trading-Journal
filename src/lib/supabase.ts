import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          trader_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          trader_name?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          trader_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          entry_time: string
          entry_day_name: string
          entry_month: string
          entry_week_number: number
          entry_year: number
          entry_session: string
          instrument: string
          direction: 'buy' | 'sell'
          stop_loss: number
          take_profit: number
          entry_model: string
          market_structure: string
          timeframe: string
          trade_type: string
          notes: string
          psychology_notes: string
          mistakes: string
          lessons: string
          tags: string[]
          status: 'open' | 'closed'
          exit_date: string | null
          exit_time: string | null
          exit_day_name: string | null
          exit_session: string | null
          exit_reason: 'manual_close' | 'tp' | 'sl' | 'partial_close' | 'be' | 'trailing_stop' | 'time_exit' | 'other' | null
          profit_loss: number | null
          profit_loss_percent: number | null
          risk_percent_actual: number | null
          rr: number | null
          roi: number | null
          net_pnl: number | null
          exit_notes: string
          created_at: string
          updated_at: string
          synced_at: string
        }
        Insert: {
          id: string
          user_id: string
          entry_date: string
          entry_time: string
          entry_day_name: string
          entry_month: string
          entry_week_number: number
          entry_year: number
          entry_session: string
          instrument: string
          direction: 'buy' | 'sell'
          stop_loss: number
          take_profit: number
          entry_model: string
          market_structure: string
          timeframe: string
          trade_type: string
          notes?: string
          psychology_notes?: string
          mistakes?: string
          lessons?: string
          tags?: string[]
          status: 'open' | 'closed'
          exit_date?: string | null
          exit_time?: string | null
          exit_day_name?: string | null
          exit_session?: string | null
          exit_reason?: 'manual_close' | 'tp' | 'sl' | 'partial_close' | 'be' | 'trailing_stop' | 'time_exit' | 'other' | null
          profit_loss?: number | null
          profit_loss_percent?: number | null
          risk_percent_actual?: number | null
          rr?: number | null
          roi?: number | null
          net_pnl?: number | null
          exit_notes?: string
          created_at?: string
          updated_at?: string
          synced_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          entry_time?: string
          entry_day_name?: string
          entry_month?: string
          entry_week_number?: number
          entry_year?: number
          entry_session?: string
          instrument?: string
          direction?: 'buy' | 'sell'
          stop_loss?: number
          take_profit?: number
          entry_model?: string
          market_structure?: string
          timeframe?: string
          trade_type?: string
          notes?: string
          psychology_notes?: string
          mistakes?: string
          lessons?: string
          tags?: string[]
          status?: 'open' | 'closed'
          exit_date?: string | null
          exit_time?: string | null
          exit_day_name?: string | null
          exit_session?: string | null
          exit_reason?: 'manual_close' | 'tp' | 'sl' | 'partial_close' | 'be' | 'trailing_stop' | 'time_exit' | 'other' | null
          profit_loss?: number | null
          profit_loss_percent?: number | null
          risk_percent_actual?: number | null
          rr?: number | null
          roi?: number | null
          net_pnl?: number | null
          exit_notes?: string
          created_at?: string
          updated_at?: string
          synced_at?: string
        }
      }
      trade_images: {
        Row: {
          id: string
          trade_id: string
          user_id: string
          data: string
          name: string
          type: 'before_entry' | 'after_exit'
          storage_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trade_id: string
          user_id: string
          data: string
          name: string
          type: 'before_entry' | 'after_exit'
          storage_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trade_id?: string
          user_id?: string
          data?: string
          name?: string
          type?: 'before_entry' | 'after_exit'
          storage_url?: string | null
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          user_id: string
          trader_name: string
          default_account_size: number
          default_currency: string
          risk_per_trade: number
          commission: number
          spread: number
          trading_days: number[]
          preferred_time_zone: string
          session_timings: any
          theme: 'dark' | 'light'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trader_name?: string
          default_account_size?: number
          default_currency?: string
          risk_per_trade?: number
          commission?: number
          spread?: number
          trading_days?: number[]
          preferred_time_zone?: string
          session_timings?: any
          theme?: 'dark' | 'light'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trader_name?: string
          default_account_size?: number
          default_currency?: string
          risk_per_trade?: number
          commission?: number
          spread?: number
          trading_days?: number[]
          preferred_time_zone?: string
          session_timings?: any
          theme?: 'dark' | 'light'
          created_at?: string
          updated_at?: string
        }
      }
      weekly_stats: {
        Row: {
          id: string
          user_id: string
          year: number
          week_number: number
          total_trades: number
          winning_trades: number
          losing_trades: number
          breakeven_trades: number
          total_profit: number
          total_loss: number
          net_pnl: number
          net_rr: number
          win_rate: number
          average_rr: number
          profit_factor: number
          largest_win: number
          largest_loss: number
          average_win: number
          average_loss: number
          expectancy: number
          current_streak: number
          longest_win_streak: number
          longest_loss_streak: number
          best_trade: number
          worst_trade: number
          best_day: string | null
          worst_day: string | null
          best_session: string | null
          worst_session: string | null
          most_used_entry_model: string | null
          highest_rr: number
          lowest_rr: number
          average_holding_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          year: number
          week_number: number
          total_trades?: number
          winning_trades?: number
          losing_trades?: number
          breakeven_trades?: number
          total_profit?: number
          total_loss?: number
          net_pnl?: number
          net_rr?: number
          win_rate?: number
          average_rr?: number
          profit_factor?: number
          largest_win?: number
          largest_loss?: number
          average_win?: number
          average_loss?: number
          expectancy?: number
          current_streak?: number
          longest_win_streak?: number
          longest_loss_streak?: number
          best_trade?: number
          worst_trade?: number
          best_day?: string | null
          worst_day?: string | null
          best_session?: string | null
          worst_session?: string | null
          most_used_entry_model?: string | null
          highest_rr?: number
          lowest_rr?: number
          average_holding_time?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          year?: number
          week_number?: number
          total_trades?: number
          winning_trades?: number
          losing_trades?: number
          breakeven_trades?: number
          total_profit?: number
          total_loss?: number
          net_pnl?: number
          net_rr?: number
          win_rate?: number
          average_rr?: number
          profit_factor?: number
          largest_win?: number
          largest_loss?: number
          average_win?: number
          average_loss?: number
          expectancy?: number
          current_streak?: number
          longest_win_streak?: number
          longest_loss_streak?: number
          best_trade?: number
          worst_trade?: number
          best_day?: string | null
          worst_day?: string | null
          best_session?: string | null
          worst_session?: string | null
          most_used_entry_model?: string | null
          highest_rr?: number
          lowest_rr?: number
          average_holding_time?: number
          created_at?: string
          updated_at?: string
        }
      }
      monthly_stats: {
        Row: {
          id: string
          user_id: string
          year: number
          month: string
          total_trades: number
          winning_trades: number
          losing_trades: number
          breakeven_trades: number
          total_profit: number
          total_loss: number
          net_pnl: number
          net_rr: number
          win_rate: number
          average_rr: number
          profit_factor: number
          largest_win: number
          largest_loss: number
          average_win: number
          average_loss: number
          expectancy: number
          current_streak: number
          longest_win_streak: number
          longest_loss_streak: number
          best_trade: number
          worst_trade: number
          best_day: string | null
          worst_day: string | null
          best_session: string | null
          worst_session: string | null
          most_used_entry_model: string | null
          highest_rr: number
          lowest_rr: number
          average_holding_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          year: number
          month: string
          total_trades?: number
          winning_trades?: number
          losing_trades?: number
          breakeven_trades?: number
          total_profit?: number
          total_loss?: number
          net_pnl?: number
          net_rr?: number
          win_rate?: number
          average_rr?: number
          profit_factor?: number
          largest_win?: number
          largest_loss?: number
          average_win?: number
          average_loss?: number
          expectancy?: number
          current_streak?: number
          longest_win_streak?: number
          longest_loss_streak?: number
          best_trade?: number
          worst_trade?: number
          best_day?: string | null
          worst_day?: string | null
          best_session?: string | null
          worst_session?: string | null
          most_used_entry_model?: string | null
          highest_rr?: number
          lowest_rr?: number
          average_holding_time?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          year?: number
          month?: string
          total_trades?: number
          winning_trades?: number
          losing_trades?: number
          breakeven_trades?: number
          total_profit?: number
          total_loss?: number
          net_pnl?: number
          net_rr?: number
          win_rate?: number
          average_rr?: number
          profit_factor?: number
          largest_win?: number
          largest_loss?: number
          average_win?: number
          average_loss?: number
          expectancy?: number
          current_streak?: number
          longest_win_streak?: number
          longest_loss_streak?: number
          best_trade?: number
          worst_trade?: number
          best_day?: string | null
          worst_day?: string | null
          best_session?: string | null
          worst_session?: string | null
          most_used_entry_model?: string | null
          highest_rr?: number
          lowest_rr?: number
          average_holding_time?: number
          created_at?: string
          updated_at?: string
        }
      }
      sync_queue: {
        Row: {
          id: string
          user_id: string
          operation: 'create' | 'update' | 'delete'
          table_name: 'trades' | 'trade_images' | 'settings'
          record_id: string
          data: any
          created_at: string
          processed_at: string | null
          error: string | null
        }
        Insert: {
          id?: string
          user_id: string
          operation: 'create' | 'update' | 'delete'
          table_name: 'trades' | 'trade_images' | 'settings'
          record_id: string
          data?: any
          created_at?: string
          processed_at?: string | null
          error?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          operation?: 'create' | 'update' | 'delete'
          table_name?: 'trades' | 'trade_images' | 'settings'
          record_id?: string
          data?: any
          created_at?: string
          processed_at?: string | null
          error?: string | null
        }
      }
    }
  }
}
