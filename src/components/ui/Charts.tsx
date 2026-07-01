import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { Card } from './Card'

interface ChartCardProps {
  title: string
  data: Record<string, unknown>[]
  type: 'line' | 'bar'
  dataKey: string
  xKey: string
  color?: string
  height?: number
}

export function ChartCard({ title, data, type, dataKey, xKey, color = '#3b82f6', height = 250 }: ChartCardProps) {
  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={height}>
        {type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey={xKey} tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
              }}
            />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey={xKey} tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
              }}
            />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </Card>
  )
}

interface MultiBarChartProps {
  title: string
  data: Record<string, unknown>[]
  bars: { key: string; color: string; name: string }[]
  xKey: string
  height?: number
}

export function MultiBarChart({ title, data, bars, xKey, height = 250 }: MultiBarChartProps) {
  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey={xKey} tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
          <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
            }}
          />
          <Legend />
          {bars.map((bar) => (
            <Bar key={bar.key} dataKey={bar.key} fill={bar.color} name={bar.name} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
