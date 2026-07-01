import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, LogOut } from 'lucide-react'
import { useTrades } from '../hooks/useTrades'
import { useSettings } from '../hooks/useSettings'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Textarea } from '../components/ui/Textarea'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ImageUpload } from '../components/ui/ImageUpload'
import { ExitTradeModal } from '../components/trade/ExitTradeModal'
import {
  INSTRUMENTS,
  ENTRY_MODELS,
  TIMEFRAMES,
  TRADE_TYPES,
  MARKET_STRUCTURES,
} from '../constants'
import dayjs from 'dayjs'
import { generateTradeId, getDateTimeFields, getExitDateTimeFields, detectSessions } from '../utils/dates'
import { calculatePnL, calculateRiskPercent } from '../utils/calculations'
import type { Trade, TradeImage, ExitReason } from '../types'
import { ENTRY_MODELS as PREDEFINED_ENTRY_MODELS } from '../constants'

interface TradeFormData {
  entryDate: string
  entryTime: string
  entryDayName: string
  entryMonth: string
  entryWeekNumber: number
  entryYear: number
  entrySession: string
  instrument: string
  direction: 'buy' | 'sell'
  stopLoss: number
  takeProfit: number
  entryModel: string
  customEntryModel: string
  marketStructure: string
  timeframe: string
  tradeType: string
  notes: string
  psychologyNotes: string
  mistakes: string
  lessons: string
  tags: string
}

function exitReasonFromResult(profitLoss: number): ExitReason {
  if (profitLoss > 0) return 'tp'
  if (profitLoss < 0) return 'sl'
  return 'be'
}

export function TradeFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addTrade, updateTrade, getTrade } = useTrades()
  const { settings } = useSettings()
  const [beforeImages, setBeforeImages] = useState<TradeImage[]>([])
  const [showExitModal, setShowExitModal] = useState(false)
  const [savedProfitLoss, setSavedProfitLoss] = useState<number | undefined>(undefined)
  const [isClosed, setIsClosed] = useState(false)
  const [isCustomEntryModel, setIsCustomEntryModel] = useState(false)

  const accountSize = settings.defaultAccountSize
  const currency = settings.defaultCurrency

  const dateFields = getDateTimeFields()
  const { register, handleSubmit, watch, setValue, reset, getValues } = useForm<TradeFormData>({
    defaultValues: {
      ...dateFields,
      entrySession: detectSessions(dateFields.entryTime, settings.sessionTimings),
      instrument: 'EURUSD',
      direction: 'buy',
      stopLoss: 0,
      takeProfit: 0,
      entryModel: 'Decisional OF',
      customEntryModel: '',
      marketStructure: 'Bullish',
      timeframe: 'H1',
      tradeType: 'Day Trade',
      notes: '',
      psychologyNotes: '',
      mistakes: '',
      lessons: '',
      tags: '',
    },
  })

  const entryTime = watch('entryTime')
  const entryDate = watch('entryDate')
  const stopLoss = watch('stopLoss')
  const takeProfit = watch('takeProfit')
  const instrument = watch('instrument')
  const direction = watch('direction')
  const entryModel = watch('entryModel')

  const entryRiskPercent = useMemo(
    () => calculateRiskPercent(stopLoss, accountSize),
    [stopLoss, accountSize]
  )

  useEffect(() => {
    if (entryTime) {
      setValue('entrySession', detectSessions(entryTime, settings.sessionTimings))
    }
  }, [entryTime, settings.sessionTimings, setValue])

  useEffect(() => {
    if (entryDate && entryTime) {
      const d = dayjs(`${entryDate} ${entryTime}`)
      const fields = getDateTimeFields(d)
      setValue('entryDayName', fields.entryDayName)
      setValue('entryMonth', fields.entryMonth)
      setValue('entryWeekNumber', fields.entryWeekNumber)
      setValue('entryYear', fields.entryYear)
      setValue('entrySession', detectSessions(entryTime, settings.sessionTimings))
    }
  }, [entryDate, entryTime, settings.sessionTimings, setValue])

  useEffect(() => {
    setIsCustomEntryModel(entryModel === 'Custom')
  }, [entryModel])

  useEffect(() => {
    if (id) {
      getTrade(id).then((trade) => {
        if (trade) {
          const isPredefined = PREDEFINED_ENTRY_MODELS.includes(trade.entryModel as any)
          reset({
            entryDate: trade.entryDate,
            entryTime: trade.entryTime,
            entryDayName: trade.entryDayName,
            entryMonth: trade.entryMonth,
            entryWeekNumber: trade.entryWeekNumber,
            entryYear: trade.entryYear,
            entrySession: trade.entrySession,
            instrument: trade.instrument,
            direction: trade.direction,
            stopLoss: trade.stopLoss,
            takeProfit: trade.takeProfit,
            entryModel: isPredefined ? trade.entryModel : 'Custom',
            customEntryModel: isPredefined ? '' : trade.entryModel,
            marketStructure: trade.marketStructure,
            timeframe: trade.timeframe,
            tradeType: trade.tradeType,
            notes: trade.notes,
            psychologyNotes: trade.psychologyNotes,
            mistakes: trade.mistakes,
            lessons: trade.lessons,
            tags: trade.tags.join(', '),
          })
          setBeforeImages(trade.beforeEntryImages)
          setIsClosed(trade.status === 'closed')
          if (trade.status === 'closed') {
            setSavedProfitLoss(trade.profitLoss)
          }
        }
      })
    }
  }, [id, getTrade, reset])

  const buildTrade = async (
    data: TradeFormData,
    options: { closed: boolean; profitLoss?: number }
  ): Promise<Trade> => {
    const now = new Date().toISOString()
    const riskPercent = calculateRiskPercent(data.stopLoss, accountSize)
    const finalEntryModel = data.entryModel === 'Custom' ? data.customEntryModel : data.entryModel

    const base: Trade = {
      id: id ?? generateTradeId(),
      entryDate: data.entryDate,
      entryTime: data.entryTime,
      entryDayName: data.entryDayName,
      entryMonth: data.entryMonth,
      entryWeekNumber: data.entryWeekNumber,
      entryYear: data.entryYear,
      entrySession: data.entrySession,
      instrument: data.instrument,
      direction: data.direction,
      stopLoss: data.stopLoss,
      takeProfit: data.takeProfit,
      entryModel: finalEntryModel,
      marketStructure: data.marketStructure,
      timeframe: data.timeframe,
      tradeType: data.tradeType,
      notes: data.notes,
      psychologyNotes: data.psychologyNotes,
      mistakes: data.mistakes,
      lessons: data.lessons,
      tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
      beforeEntryImages: beforeImages,
      status: options.closed ? 'closed' : 'open',
      createdAt: id ? (await getTrade(id))?.createdAt ?? now : now,
      updatedAt: now,
    }

    if (options.closed && options.profitLoss !== undefined) {
      const exitFields = getExitDateTimeFields()
      const calc = calculatePnL(
        options.profitLoss,
        accountSize,
        data.stopLoss,
        settings.commission,
        settings.spread
      )

      return {
        ...base,
        exitDate: exitFields.exitDate,
        exitTime: exitFields.exitTime,
        exitDayName: exitFields.exitDayName,
        exitSession: detectSessions(exitFields.exitTime, settings.sessionTimings),
        exitReason: exitReasonFromResult(options.profitLoss),
        profitLoss: options.profitLoss,
        profitLossPercent: calc.profitLossPercent,
        riskPercentActual: calc.riskPercentActual,
        rr: calc.rr,
        roi: calc.roi,
        netPnl: calc.netPnl,
        afterExitImages: [],
      }
    }

    return base
  }

  const onSubmit = async (data: TradeFormData) => {
    const trade = await buildTrade(data, { closed: false })
    if (id) {
      await updateTrade(trade)
    } else {
      await addTrade(trade)
    }
    navigate('/trades')
  }

  const handleExitConfirm = async (profitLoss: number) => {
    const data = getValues()
    const trade = await buildTrade(data, { closed: true, profitLoss })
    if (id) {
      await updateTrade(trade)
    } else {
      await addTrade(trade)
    }
    setShowExitModal(false)
    navigate('/trades')
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{id ? 'Edit Trade' : 'New Trade'}</h2>
            {isClosed && (
              <p className="text-sm text-[var(--color-text-secondary)]">
                Trade closed
                {savedProfitLoss !== undefined && (
                  <span className={savedProfitLoss > 0 ? ' text-[var(--color-profit)]' : savedProfitLoss < 0 ? ' text-[var(--color-loss)]' : ' text-[var(--color-neutral)]'}>
                    {' '}· P/L: {currency} {savedProfitLoss >= 0 ? '+' : ''}{savedProfitLoss.toFixed(2)}
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowExitModal(true)}>
              <LogOut size={16} /> Exit Trade
            </Button>
            <Button type="submit">
              <Save size={16} /> Save Trade
            </Button>
          </div>
        </div>

        <Card title="Auto-Generated Fields">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input label="Trade ID" value={id ?? 'Auto-generated on save'} disabled />
            <Input label="Entry Date" {...register('entryDate')} type="date" />
            <Input label="Entry Time" {...register('entryTime')} type="time" />
            <Input label="Day" {...register('entryDayName')} />
            <Input label="Month" {...register('entryMonth')} />
            <Input label="Week #" {...register('entryWeekNumber', { valueAsNumber: true })} type="number" />
            <Input label="Year" {...register('entryYear', { valueAsNumber: true })} type="number" />
            <Input label="Session" {...register('entrySession')} />
          </div>
        </Card>

        <Card title="Entry Details">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              label="Instrument"
              {...register('instrument')}
              options={INSTRUMENTS.map((i) => ({ value: i, label: i }))}
            />
            <Select
              label="Direction"
              {...register('direction')}
              options={[
                { value: 'buy', label: 'Buy' },
                { value: 'sell', label: 'Sell' },
              ]}
            />
            <Input
              label="Stop Loss"
              {...register('stopLoss', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="Risk amount in account currency"
            />
            <Input label="Take Profit" {...register('takeProfit', { valueAsNumber: true })} type="number" step="0.01" />
            <Input
              label="Risk %"
              value={entryRiskPercent.toFixed(2)}
              readOnly
              disabled
            />
            <Select
              label="Entry Model"
              {...register('entryModel')}
              options={ENTRY_MODELS.map((m) => ({ value: m, label: m }))}
            />
            {isCustomEntryModel && (
              <Input
                label="Custom Entry Model"
                {...register('customEntryModel')}
                placeholder="Enter custom strategy name"
              />
            )}
            <Select
              label="Market Structure"
              {...register('marketStructure')}
              options={MARKET_STRUCTURES.map((m) => ({ value: m, label: m }))}
            />
            <Select
              label="Timeframe"
              {...register('timeframe')}
              options={TIMEFRAMES.map((t) => ({ value: t, label: t }))}
            />
            <Select
              label="Trade Type"
              {...register('tradeType')}
              options={TRADE_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </div>
          <div className="mt-4 grid gap-4">
            <Textarea label="Notes" {...register('notes')} />
            <Textarea label="Psychology Notes" {...register('psychologyNotes')} />
            <Textarea label="Mistakes" {...register('mistakes')} />
            <Textarea label="Lessons" {...register('lessons')} />
            <Input label="Tags (comma separated)" {...register('tags')} placeholder="scalp, news, fvg" />
          </div>
        </Card>

        <Card title="Before Entry Screenshots">
          <ImageUpload images={beforeImages} onChange={setBeforeImages} label="Before Entry" />
        </Card>
      </form>

      <ExitTradeModal
        open={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleExitConfirm}
        entryDate={entryDate}
        entryTime={entryTime}
        instrument={instrument}
        direction={direction}
        plannedRisk={stopLoss}
        plannedReward={takeProfit}
        accountSize={accountSize}
        currency={currency}
        initialProfitLoss={savedProfitLoss}
      />
    </>
  )
}
