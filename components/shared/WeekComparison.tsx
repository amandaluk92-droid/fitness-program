'use client'

import { Card } from './Card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WeekComparisonProps {
  currentWeek: {
    week: string
    sessionCount: number
    exercises: Array<{
      exerciseId: string
      exerciseName: string
      totalVolume: number
      maxWeight: number
      totalReps: number
    }>
  }
  previousWeek?: {
    week: string
    sessionCount: number
    exercises: Array<{
      exerciseId: string
      exerciseName: string
      totalVolume: number
      maxWeight: number
      totalReps: number
    }>
  }
  exerciseId?: string
}

export function WeekComparison({ currentWeek, previousWeek, exerciseId }: WeekComparisonProps) {
  if (!previousWeek) {
    return (
      <Card title="Week Comparison">
        <p className="text-gray-500 text-sm">No previous week data available for comparison</p>
      </Card>
    )
  }

  const getExerciseData = (week: typeof currentWeek) => {
    if (!exerciseId) return null
    return week.exercises.find((ex) => ex.exerciseId === exerciseId)
  }

  const currentExercise = getExerciseData(currentWeek)
  const previousExercise = getExerciseData(previousWeek)

  const compareMetric = (current: number, previous: number) => {
    if (previous === 0) return { change: 100, trend: 'up' as const }
    const change = ((current - previous) / previous) * 100
    return {
      change: Math.abs(change),
      trend: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const,
    }
  }

  const renderComparison = (label: string, current: number, previous: number) => {
    const { change, trend } = compareMetric(current, previous)
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-lg font-semibold text-gray-900">{current.toFixed(1)}</p>
        </div>
        <div className={cn(
          'flex items-center gap-2',
          trend === 'up' && 'text-success-600',
          trend === 'down' && 'text-red-600',
          trend === 'neutral' && 'text-gray-600'
        )}>
          <TrendIcon className="h-5 w-5" />
          <span className="text-sm font-medium">
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{change.toFixed(1)}%
          </span>
        </div>
      </div>
    )
  }

  return (
    <Card title="Week Comparison">
      <div className="space-y-3">
        {renderComparison(
          'Sessions',
          currentWeek.sessionCount,
          previousWeek.sessionCount
        )}

        {currentExercise && previousExercise && (
          <>
            {renderComparison(
              'Total Volume (kg)',
              currentExercise.totalVolume,
              previousExercise.totalVolume
            )}
            {renderComparison(
              'Max Weight (kg)',
              currentExercise.maxWeight,
              previousExercise.maxWeight
            )}
            {renderComparison(
              'Total Reps',
              currentExercise.totalReps,
              previousExercise.totalReps
            )}
          </>
        )}
      </div>
    </Card>
  )
}
