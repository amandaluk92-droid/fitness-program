'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatDate } from '@/lib/utils'

interface ProgressChartProps {
  data: Array<{
    week: string
    sessionCount: number
    exercises: Array<{
      exerciseId: string
      exerciseName: string
      totalVolume: number
      maxWeight: number
      totalReps: number
    }>
  }>
  exerciseId?: string
  type?: 'line' | 'bar'
  metric?: 'volume' | 'weight' | 'reps' | 'sessions'
}

export function ProgressChart({ data, exerciseId, type = 'line', metric = 'sessions' }: ProgressChartProps) {
  // Format data for chart
  const chartData = data.map((week) => {
    const formatted: any = {
      week: formatDate(new Date(week.week)),
      weekKey: week.week,
    }

    if (metric === 'sessions') {
      formatted.value = week.sessionCount
    } else if (exerciseId) {
      const exercise = week.exercises.find((ex) => ex.exerciseId === exerciseId)
      if (exercise) {
        if (metric === 'volume') {
          formatted.value = exercise.totalVolume
        } else if (metric === 'weight') {
          formatted.value = exercise.maxWeight
        } else if (metric === 'reps') {
          formatted.value = exercise.totalReps
        }
      }
    }

    return formatted
  }).filter((d) => d.value !== undefined)

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available for the selected period
      </div>
    )
  }

  const ChartComponent = type === 'line' ? LineChart : BarChart
  const dataProps = {
    dataKey: 'value' as const,
    stroke: '#0ea5e9',
    fill: '#0ea5e9',
    name: metric === 'sessions' ? 'Sessions' : metric.charAt(0).toUpperCase() + metric.slice(1),
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ChartComponent data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Legend />
        {type === 'line' ? (
          <Line type="monotone" {...dataProps} />
        ) : (
          <Bar {...dataProps} />
        )}
      </ChartComponent>
    </ResponsiveContainer>
  )
}
