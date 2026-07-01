import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { CURRENCIES, DAY_NAMES } from '../constants'
import type { SessionTiming } from '../types'

export function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const [form, setForm] = useState({ ...settings })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm({ ...settings })
  }, [settings])

  const handleSave = async () => {
    await updateSettings(form)
    document.documentElement.setAttribute('data-theme', form.theme)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateSession = (index: number, field: keyof SessionTiming, value: number | string) => {
    const sessions = [...form.sessionTimings]
    sessions[index] = { ...sessions[index], [field]: typeof value === 'string' ? parseInt(value, 10) : value }
    setForm({ ...form, sessionTimings: sessions })
  }

  const toggleTradingDay = (day: number) => {
    const days = form.tradingDays.includes(day)
      ? form.tradingDays.filter((d) => d !== day)
      : [...form.tradingDays, day].sort()
    setForm({ ...form, tradingDays: days })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Configure your trading journal</p>
        </div>
        <Button onClick={handleSave}>
          <Save size={16} /> {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>

      <Card title="Account Defaults">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Default Account Size"
            type="number"
            value={form.defaultAccountSize}
            onChange={(e) => setForm({ ...form, defaultAccountSize: parseFloat(e.target.value) || 0 })}
          />
          <Select
            label="Default Currency"
            value={form.defaultCurrency}
            onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value })}
            options={CURRENCIES.map((c) => ({ value: c, label: c }))}
          />
          <Input
            label="Risk Per Trade (%)"
            type="number"
            step="0.1"
            value={form.riskPerTrade}
            onChange={(e) => setForm({ ...form, riskPerTrade: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Commission (per trade)"
            type="number"
            step="0.01"
            value={form.commission}
            onChange={(e) => setForm({ ...form, commission: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Spread (per trade)"
            type="number"
            step="0.01"
            value={form.spread}
            onChange={(e) => setForm({ ...form, spread: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Preferred Time Zone"
            value={form.preferredTimeZone}
            onChange={(e) => setForm({ ...form, preferredTimeZone: e.target.value })}
          />
        </div>
      </Card>

      <Card title="Trading Days">
        <div className="flex flex-wrap gap-2">
          {DAY_NAMES.map((day, index) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleTradingDay(index)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                form.tradingDays.includes(index)
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]/30'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Session Timings (Local Time)">
        <p className="mb-4 text-xs text-[var(--color-text-secondary)]">
          Configure when each trading session starts and ends in your local time
        </p>
        <div className="space-y-4">
          {form.sessionTimings.map((session, index) => (
            <div key={session.name} className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="mb-2 font-medium">{session.name}</p>
              <div className="grid grid-cols-4 gap-2">
                <Input
                  label="Start H"
                  type="number"
                  min="0"
                  max="23"
                  value={session.startHour}
                  onChange={(e) => updateSession(index, 'startHour', e.target.value)}
                />
                <Input
                  label="Start M"
                  type="number"
                  min="0"
                  max="59"
                  value={session.startMinute}
                  onChange={(e) => updateSession(index, 'startMinute', e.target.value)}
                />
                <Input
                  label="End H"
                  type="number"
                  min="0"
                  max="23"
                  value={session.endHour}
                  onChange={(e) => updateSession(index, 'endHour', e.target.value)}
                />
                <Input
                  label="End M"
                  type="number"
                  min="0"
                  max="59"
                  value={session.endMinute}
                  onChange={(e) => updateSession(index, 'endMinute', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Appearance">
        <Select
          label="Theme"
          value={form.theme}
          onChange={(e) => setForm({ ...form, theme: e.target.value as 'dark' | 'light' })}
          options={[
            { value: 'dark', label: 'Dark Theme' },
            { value: 'light', label: 'Light Theme' },
          ]}
        />
      </Card>
    </div>
  )
}
