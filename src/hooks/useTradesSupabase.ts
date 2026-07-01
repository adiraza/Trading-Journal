import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Trade } from '../types'

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTrades()
  }, [])

  const fetchTrades = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setTrades([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform Supabase data to Trade type
      const transformedTrades = data?.map(trade => ({
        id: trade.id,
        entryDate: trade.entry_date,
        entryTime: trade.entry_time,
        entryDayName: trade.entry_day_name,
        entryMonth: trade.entry_month,
        entryWeekNumber: trade.entry_week_number,
        entryYear: trade.entry_year,
        entrySession: trade.entry_session,
        instrument: trade.instrument,
        direction: trade.direction,
        stopLoss: trade.stop_loss,
        takeProfit: trade.take_profit,
        entryModel: trade.entry_model,
        marketStructure: trade.market_structure,
        timeframe: trade.timeframe,
        tradeType: trade.trade_type,
        notes: trade.notes,
        psychologyNotes: trade.psychology_notes,
        mistakes: trade.mistakes,
        lessons: trade.lessons,
        tags: trade.tags,
        status: trade.status,
        exitDate: trade.exit_date ?? undefined,
        exitTime: trade.exit_time ?? undefined,
        exitDayName: trade.exit_day_name ?? undefined,
        exitSession: trade.exit_session ?? undefined,
        exitReason: trade.exit_reason ?? undefined,
        profitLoss: trade.profit_loss ?? undefined,
        profitLossPercent: trade.profit_loss_percent ?? undefined,
        riskPercentActual: trade.risk_percent_actual ?? undefined,
        rr: trade.rr ?? undefined,
        roi: trade.roi ?? undefined,
        netPnl: trade.net_pnl ?? undefined,
        exitNotes: trade.exit_notes ?? undefined,
        beforeEntryImages: [], // Will be fetched separately
        afterExitImages: [],
        createdAt: trade.created_at,
        updatedAt: trade.updated_at,
      })) || []

      setTrades(transformedTrades)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addTrade = async (trade: Trade) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('trades').insert({
        id: trade.id,
        user_id: user.id,
        entry_date: trade.entryDate,
        entry_time: trade.entryTime,
        entry_day_name: trade.entryDayName,
        entry_month: trade.entryMonth,
        entry_week_number: trade.entryWeekNumber,
        entry_year: trade.entryYear,
        entry_session: trade.entrySession,
        instrument: trade.instrument,
        direction: trade.direction,
        stop_loss: trade.stopLoss,
        take_profit: trade.takeProfit,
        entry_model: trade.entryModel,
        market_structure: trade.marketStructure,
        timeframe: trade.timeframe,
        trade_type: trade.tradeType,
        notes: trade.notes,
        psychology_notes: trade.psychologyNotes,
        mistakes: trade.mistakes,
        lessons: trade.lessons,
        tags: trade.tags,
        status: trade.status,
        exit_date: trade.exitDate,
        exit_time: trade.exitTime,
        exit_day_name: trade.exitDayName,
        exit_session: trade.exitSession,
        exit_reason: trade.exitReason,
        profit_loss: trade.profitLoss,
        profit_loss_percent: trade.profitLossPercent,
        risk_percent_actual: trade.riskPercentActual,
        rr: trade.rr,
        roi: trade.roi,
        net_pnl: trade.netPnl,
        exit_notes: trade.exitNotes,
      })

      if (error) throw error
      await fetchTrades()
    } catch (err: any) {
      console.error('Error adding trade:', err)
      throw err
    }
  }

  const updateTrade = async (trade: Trade) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('trades')
        .update({
          entry_date: trade.entryDate,
          entry_time: trade.entryTime,
          entry_day_name: trade.entryDayName,
          entry_month: trade.entryMonth,
          entry_week_number: trade.entryWeekNumber,
          entry_year: trade.entryYear,
          entry_session: trade.entrySession,
          instrument: trade.instrument,
          direction: trade.direction,
          stop_loss: trade.stopLoss,
          take_profit: trade.takeProfit,
          entry_model: trade.entryModel,
          market_structure: trade.marketStructure,
          timeframe: trade.timeframe,
          trade_type: trade.tradeType,
          notes: trade.notes,
          psychology_notes: trade.psychologyNotes,
          mistakes: trade.mistakes,
          lessons: trade.lessons,
          tags: trade.tags,
          status: trade.status,
          exit_date: trade.exitDate,
          exit_time: trade.exitTime,
          exit_day_name: trade.exitDayName,
          exit_session: trade.exitSession,
          exit_reason: trade.exitReason,
          profit_loss: trade.profitLoss,
          profit_loss_percent: trade.profitLossPercent,
          risk_percent_actual: trade.riskPercentActual,
          rr: trade.rr,
          roi: trade.roi,
          net_pnl: trade.netPnl,
          exit_notes: trade.exitNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', trade.id)
        .eq('user_id', user.id)

      if (error) throw error
      await fetchTrades()
    } catch (err: any) {
      console.error('Error updating trade:', err)
      throw err
    }
  }

  const deleteTrade = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      await fetchTrades()
    } catch (err: any) {
      console.error('Error deleting trade:', err)
      throw err
    }
  }

  const getTrade = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      if (!data) return null

      return {
        id: data.id,
        entryDate: data.entry_date,
        entryTime: data.entry_time,
        entryDayName: data.entry_day_name,
        entryMonth: data.entry_month,
        entryWeekNumber: data.entry_week_number,
        entryYear: data.entry_year,
        entrySession: data.entry_session,
        instrument: data.instrument,
        direction: data.direction,
        stopLoss: data.stop_loss,
        takeProfit: data.take_profit,
        entryModel: data.entry_model,
        marketStructure: data.market_structure,
        timeframe: data.timeframe,
        tradeType: data.trade_type,
        notes: data.notes,
        psychologyNotes: data.psychology_notes,
        mistakes: data.mistakes,
        lessons: data.lessons,
        tags: data.tags,
        status: data.status,
        exitDate: data.exit_date ?? undefined,
        exitTime: data.exit_time ?? undefined,
        exitDayName: data.exit_day_name ?? undefined,
        exitSession: data.exit_session ?? undefined,
        exitReason: data.exit_reason ?? undefined,
        profitLoss: data.profit_loss ?? undefined,
        profitLossPercent: data.profit_loss_percent ?? undefined,
        riskPercentActual: data.risk_percent_actual ?? undefined,
        rr: data.rr ?? undefined,
        roi: data.roi ?? undefined,
        netPnl: data.net_pnl ?? undefined,
        exitNotes: data.exit_notes ?? undefined,
        beforeEntryImages: [],
        afterExitImages: [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as Trade
    } catch (err: any) {
      console.error('Error getting trade:', err)
      return null
    }
  }

  return { trades, loading, error, addTrade, updateTrade, deleteTrade, getTrade, refetch: fetchTrades }
}

export function useTrade(id: string | undefined) {
  const [trade, setTrade] = useState<Trade | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const fetchTrade = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setTrade(null)
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Error fetching trade:', error)
          setTrade(null)
        } else if (data) {
          setTrade({
            id: data.id,
            entryDate: data.entry_date,
            entryTime: data.entry_time,
            entryDayName: data.entry_day_name,
            entryMonth: data.entry_month,
            entryWeekNumber: data.entry_week_number,
            entryYear: data.entry_year,
            entrySession: data.entry_session,
            instrument: data.instrument,
            direction: data.direction,
            stopLoss: data.stop_loss,
            takeProfit: data.take_profit,
            entryModel: data.entry_model,
            marketStructure: data.market_structure,
            timeframe: data.timeframe,
            tradeType: data.trade_type,
            notes: data.notes,
            psychologyNotes: data.psychology_notes,
            mistakes: data.mistakes,
            lessons: data.lessons,
            tags: data.tags,
            status: data.status,
            exitDate: data.exit_date ?? undefined,
            exitTime: data.exit_time ?? undefined,
            exitDayName: data.exit_day_name ?? undefined,
            exitSession: data.exit_session ?? undefined,
            exitReason: data.exit_reason ?? undefined,
            profitLoss: data.profit_loss ?? undefined,
            profitLossPercent: data.profit_loss_percent ?? undefined,
            riskPercentActual: data.risk_percent_actual ?? undefined,
            rr: data.rr ?? undefined,
            roi: data.roi ?? undefined,
            netPnl: data.net_pnl ?? undefined,
            exitNotes: data.exit_notes ?? undefined,
            beforeEntryImages: [],
            afterExitImages: [],
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          })
        }
        setLoading(false)
      }

      fetchTrade()
    } else {
      setTrade(null)
      setLoading(false)
    }
  }, [id])

  return { trade, loading }
}
