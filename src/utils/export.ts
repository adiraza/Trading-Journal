import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import type { AppSettings, Trade } from '../types'
import { db } from '../db'

export async function exportToExcel(trades: Trade[]): Promise<void> {
  const data = trades.map(tradeToRow)
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Trades')
  XLSX.writeFile(wb, `trading-journal-${Date.now()}.xlsx`)
}

export async function exportToCSV(trades: Trade[]): Promise<void> {
  const data = trades.map(tradeToRow)
  const ws = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(ws)
  const blob = new Blob([csv], { type: 'text/csv' })
  downloadBlob(blob, `trading-journal-${Date.now()}.csv`)
}

export async function exportToPDF(trades: Trade[], settings: AppSettings): Promise<void> {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Trading Journal Export', 14, 20)
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28)
  doc.text(`Total Trades: ${trades.length}`, 14, 34)

  let y = 44
  const closed = trades.filter((t) => t.status === 'closed')

  for (const trade of closed.slice(0, 50)) {
    if (y > 270) {
      doc.addPage()
      y = 20
    }
    const line = `${trade.entryDate} | ${trade.instrument} | ${trade.direction.toUpperCase()} | P/L: ${settings.defaultCurrency} ${trade.profitLoss?.toFixed(2)} | RR: ${trade.rr?.toFixed(2)}`
    doc.text(line, 14, y)
    y += 7
  }

  doc.save(`trading-journal-${Date.now()}.pdf`)
}

export async function exportToJSON(): Promise<void> {
  const trades = await db.trades.toArray()
  const settings = await db.settings.get('default')
  const backup = { version: 1, exportedAt: new Date().toISOString(), trades, settings }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `trading-journal-backup-${Date.now()}.json`)
}

export async function importFromJSON(file: File): Promise<{ trades: number; settings: boolean }> {
  const text = await file.text()
  const backup = JSON.parse(text)

  if (!backup.trades || !Array.isArray(backup.trades)) {
    throw new Error('Invalid backup file: missing trades array')
  }

  await db.trades.clear()
  await db.trades.bulkPut(backup.trades)

  let settingsUpdated = false
  if (backup.settings) {
    await db.settings.put(backup.settings)
    settingsUpdated = true
  }

  return { trades: backup.trades.length, settings: settingsUpdated }
}

function tradeToRow(trade: Trade) {
  return {
    ID: trade.id,
    'Entry Date': trade.entryDate,
    'Entry Time': trade.entryTime,
    Instrument: trade.instrument,
    Direction: trade.direction,
    'Lot Size': trade.lotSize,
    'Entry Price': trade.entryPrice,
    'Stop Loss': trade.stopLoss,
    'Take Profit': trade.takeProfit,
    'Risk Amount': trade.riskAmount,
    'Entry Model': trade.entryModel,
    Session: trade.entrySession,
    Timeframe: trade.timeframe,
    Status: trade.status,
    'Exit Date': trade.exitDate ?? '',
    'Exit Price': trade.exitPrice ?? '',
    'Exit Reason': trade.exitReason ?? '',
    'Profit/Loss': trade.profitLoss ?? '',
    RR: trade.rr ?? '',
    ROI: trade.roi ?? '',
    Tags: trade.tags.join(', '),
    Notes: trade.notes,
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function generateImageId(): string {
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
