'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { chartData as fallbackChartData } from '@/lib/mock-data'

export interface OverviewChartPoint {
  day: string
  sent: number
  failed: number
}

// Кастомный тултип для графиков
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-secondary/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-glass">
        <p className="text-white/60 text-xs mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white/70">{entry.name}:</span>
            <span className="text-white font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// График SMS за последние 7 дней
export function SmsOverviewChart({ data }: { data?: OverviewChartPoint[] }) {
  const chartData = data && data.length > 0
    ? data
    : (fallbackChartData.map((d) => ({ day: d.day, sent: d.sent, failed: d.failed })) as OverviewChartPoint[])
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barGap={2} barCategoryGap="30%">
          <defs>
            {/* Градиент для баров */}
            <linearGradient id="barGradientPurple" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="barGradientRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="sent" fill="url(#barGradientPurple)" radius={[4, 4, 0, 0]} name="Sent" />
          <Bar dataKey="failed" fill="url(#barGradientRed)" radius={[4, 4, 0, 0]} name="Failed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Круговая диаграмма доставки
const COLORS = ['#06b6d4', '#ef4444']

export function DeliveryPieChart({ rate = 96.3 }: { rate?: number }) {
  const data = [
    { name: 'Sent', value: rate },
    { name: 'Failed', value: 100 - rate },
  ]

  return (
    <div className="relative flex items-center justify-center h-40">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={68}
            startAngle={90}
            endAngle={-270}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                opacity={index === 0 ? 1 : 0.5}
                filter={index === 0 ? 'url(#glow)' : undefined}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Текст в центре */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-white font-display">{rate}%</p>
        </div>
      </div>
    </div>
  )
}
