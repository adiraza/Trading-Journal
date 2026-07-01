import { useState } from 'react'
import { FileSpreadsheet, FileText, FileJson, Upload, Download } from 'lucide-react'
import { useTrades } from '../hooks/useTrades'
import { useSettings } from '../hooks/useSettings'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  exportToJSON,
  importFromJSON,
} from '../utils/export'

export function ExportPage() {
  const { trades } = useTrades()
  const { settings } = useSettings()
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleExport = async (type: 'excel' | 'csv' | 'pdf' | 'json') => {
    setLoading(true)
    try {
      switch (type) {
        case 'excel':
          await exportToExcel(trades)
          break
        case 'csv':
          await exportToCSV(trades)
          break
        case 'pdf':
          await exportToPDF(trades, settings)
          break
        case 'json':
          await exportToJSON()
          break
      }
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const result = await importFromJSON(file)
      setImportStatus(`Successfully imported ${result.trades} trades${result.settings ? ' and settings' : ''}`)
    } catch (err) {
      setImportStatus(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Export & Backup</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Export your trading data or create backups
        </p>
      </div>

      <Card title="Export Data">
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
          {trades.length} trades available for export
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="secondary" onClick={() => handleExport('excel')} disabled={loading || trades.length === 0}>
            <FileSpreadsheet size={18} /> Export Excel
          </Button>
          <Button variant="secondary" onClick={() => handleExport('csv')} disabled={loading || trades.length === 0}>
            <FileText size={18} /> Export CSV
          </Button>
          <Button variant="secondary" onClick={() => handleExport('pdf')} disabled={loading || trades.length === 0}>
            <Download size={18} /> Export PDF
          </Button>
          <Button variant="secondary" onClick={() => handleExport('json')} disabled={loading}>
            <FileJson size={18} /> JSON Backup
          </Button>
        </div>
      </Card>

      <Card title="Import & Restore">
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
          Restore from a previously exported JSON backup file
        </p>
        <label className="inline-flex cursor-pointer">
          <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={loading} />
          <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-border)]/30">
            <Upload size={18} /> Import Backup
          </span>
        </label>
        {importStatus && (
          <p className={`mt-3 text-sm ${importStatus.includes('failed') ? 'text-[var(--color-loss)]' : 'text-[var(--color-profit)]'}`}>
            {importStatus}
          </p>
        )}
      </Card>
    </div>
  )
}
