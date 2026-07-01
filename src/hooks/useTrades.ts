import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Trade } from '../types'

export function useTrades() {
  const trades = useLiveQuery(() => db.trades.orderBy('createdAt').reverse().toArray(), []) ?? []

  const addTrade = async (trade: Trade) => {
    await db.trades.put(trade)
  }

  const updateTrade = async (trade: Trade) => {
    await db.trades.put({ ...trade, updatedAt: new Date().toISOString() })
  }

  const deleteTrade = async (id: string) => {
    await db.trades.delete(id)
  }

  const getTrade = async (id: string) => {
    return db.trades.get(id)
  }

  return { trades, addTrade, updateTrade, deleteTrade, getTrade }
}

export function useTrade(id: string | undefined) {
  const trade = useLiveQuery(() => (id ? db.trades.get(id) : undefined), [id])
  return trade
}
