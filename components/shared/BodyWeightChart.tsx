'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'

export interface BodyWeightDataPoint {
  date: string
  weight: number
}

interface BodyWeightChartProps {
  data: BodyWeightDataPoint[]
  goalWeight?: number
  showLogForm?: boolean
  onLogWeight?: (weight: number) => Promise<void>
  logWeightLabel?: string
  logSuccessLabel?: string
  todayLogged?: boolean
}

export function BodyWeightChart({
  data,
  goalWeight,
  showLogForm = false,
  onLogWeight,
  logWeightLabel = 'Log today\'s weight',
  logSuccessLabel = 'Weight logged',
  todayLogged = false,
}: BodyWeightChartProps) {
  const [logValue, setLogValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    dateKey: d.date,
    weight: d.weight,
  }))

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const w = parseFloat(logValue)
    if (Number.isNaN(w) || w <= 0 || !onLogWeight) return
    setIsSubmitting(true)
    setSuccess(false)
    try {
      await onLogWeight(w)
      setSuccess(true)
      setLogValue('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {showLogForm && onLogWeight && (
        <form onSubmit={handleLogSubmit} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[140px]">
            <Input
              label={logWeightLabel}
              type="number"
              step="0.1"
              min={0}
              value={logValue}
              onChange={(e) => setLogValue(e.target.value)}
              placeholder={todayLogged ? 'Update' : 'kg'}
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '...' : todayLogged ? 'Update' : 'Log'}
          </Button>
          {success && (
            <span className="text-sm text-success-600">{logSuccessLabel}</span>
          )}
        </form>
      )}

      {chartData.length === 0 && !showLogForm ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No body weight data for the selected period
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Log your weight above to see progress over time
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip formatter={(value: number) => [`${value} kg`, 'Weight']} />
            <Legend />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#0ea5e9"
              name="Weight (kg)"
              dot={{ r: 4 }}
            />
            {goalWeight != null && (
              <ReferenceLine
                y={goalWeight}
                stroke="#22c55e"
                strokeDasharray="5 5"
                label={{ value: 'Goal', position: 'right' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
