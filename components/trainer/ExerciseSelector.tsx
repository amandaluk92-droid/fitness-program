'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Select } from '@/components/shared/Select'
import { Button } from '@/components/shared/Button'
import { Plus, X, Search } from 'lucide-react'
import { ExerciseSearchModal } from '@/components/ExerciseSearchModal'
import type { ExerciseResult } from '@/components/ExerciseSearch'

interface Exercise {
  id: string
  name: string
  description?: string
  muscleGroup?: string
}

interface ExerciseSelectorProps {
  onExercisesChange: (exercises: ProgramExercise[]) => void
  initialExercises?: ProgramExercise[]
}

export interface ProgramExercise {
  exerciseId: string
  sets: number
  reps: number
  weight?: number
  restTimeSeconds?: number
  order: number
  dayOfWeek?: number
  workoutDayIndex?: number
  tempo?: string
  supersetGroup?: string
}

export function ExerciseSelector({ onExercisesChange, initialExercises = [] }: ExerciseSelectorProps) {
  const t = useTranslations('trainer.exerciseSelector')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedExercises, setSelectedExercises] = useState<ProgramExercise[]>(initialExercises)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [searchTargetIndex, setSearchTargetIndex] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/exercises')
      .then((res) => res.json())
      .then((data) => setExercises(data.exercises || []))
      .catch((err) => console.error('Error fetching exercises:', err))
  }, [])

  useEffect(() => {
    if (initialExercises.length > 0 && selectedExercises.length === 0) {
      setSelectedExercises(initialExercises)
    }
  }, [initialExercises])

  useEffect(() => {
    onExercisesChange(selectedExercises)
  }, [selectedExercises, onExercisesChange])

  const addExercise = (workoutDayIndex?: number) => {
    const maxOrder = selectedExercises
      .filter((e) => (workoutDayIndex != null ? e.workoutDayIndex === workoutDayIndex : e.workoutDayIndex == null))
      .reduce((max, e) => Math.max(max, e.order), -1)
    setSelectedExercises([
      ...selectedExercises,
      {
        exerciseId: '',
        sets: 3,
        reps: 10,
        order: maxOrder + 1,
        ...(workoutDayIndex != null ? { workoutDayIndex } : {}),
      },
    ])
  }

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index: number, field: keyof ProgramExercise, value: any) => {
    const updated = [...selectedExercises]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedExercises(updated)
  }

  const handleExerciseSearchSelect = (result: ExerciseResult) => {
    // Check if exercise already exists in our local DB list
    const existing = exercises.find((e) => e.name.toLowerCase() === result.name.toLowerCase())
    if (existing && searchTargetIndex !== null) {
      updateExercise(searchTargetIndex, 'exerciseId', existing.id)
    }
    setSearchTargetIndex(null)
  }

  const openSearchForExercise = (index: number) => {
    setSearchTargetIndex(index)
    setSearchModalOpen(true)
  }

  const hasWorkoutDays = selectedExercises.some((e) => e.workoutDayIndex != null)
  const groupedByDay = hasWorkoutDays
    ? (() => {
        const groups: { day: number; items: { exercise: ProgramExercise; flatIndex: number }[] }[] = []
        const dayMap = new Map<number, { exercise: ProgramExercise; flatIndex: number }[]>()
        selectedExercises.forEach((ex, idx) => {
          const day = ex.workoutDayIndex ?? 1
          if (!dayMap.has(day)) dayMap.set(day, [])
          dayMap.get(day)!.push({ exercise: ex, flatIndex: idx })
        })
        const sortedDays = [...dayMap.keys()].sort((a, b) => a - b)
        sortedDays.forEach((day) => groups.push({ day, items: dayMap.get(day)! }))
        return groups
      })()
    : null

  const renderExerciseRow = (exercise: ProgramExercise, flatIndex: number) => (
    <div key={flatIndex} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {exercise.supersetGroup && (
            <span className="inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
              {exercise.supersetGroup}
            </span>
          )}
          <h4 className="font-medium text-gray-900">{t('exercises')}</h4>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => removeExercise(flatIndex)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Select
              label={t('exercises')}
              value={exercise.exerciseId}
              onChange={(e) => updateExercise(flatIndex, 'exerciseId', e.target.value)}
              options={[
                { value: '', label: t('selectExercise') },
                ...exercises.map((ex) => ({
                  value: ex.id,
                  label: ex.name,
                })),
              ]}
            />
          </div>
          <button
            type="button"
            onClick={() => openSearchForExercise(flatIndex)}
            className="mb-0.5 p-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-500 hover:text-primary-600"
            title={t('searchExercise')}
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('sets')}</label>
            <input
              type="number"
              min="1"
              value={exercise.sets}
              onChange={(e) => updateExercise(flatIndex, 'sets', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reps')}</label>
            <input
              type="number"
              min="1"
              value={exercise.reps}
              onChange={(e) => updateExercise(flatIndex, 'reps', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('weightOptional')}</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={exercise.weight || ''}
            onChange={(e) => updateExercise(flatIndex, 'weight', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder={t('targetWeight')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('restOptional')}</label>
          <input
            type="number"
            min="0"
            value={exercise.restTimeSeconds || ''}
            onChange={(e) => updateExercise(flatIndex, 'restTimeSeconds', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder={t('restPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('tempoOptional')}</label>
          <input
            type="text"
            maxLength={4}
            value={exercise.tempo || ''}
            onChange={(e) => updateExercise(flatIndex, 'tempo', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder={t('tempoPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('supersetOptional')}</label>
          <input
            type="text"
            maxLength={2}
            value={exercise.supersetGroup || ''}
            onChange={(e) => updateExercise(flatIndex, 'supersetGroup', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder={t('supersetPlaceholder')}
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{t('exercises')}</h3>
        {!groupedByDay && (
          <Button type="button" onClick={() => addExercise()} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {t('addExercise')}
          </Button>
        )}
      </div>

      {selectedExercises.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          {t('noExercisesHint')}
        </p>
      )}

      {groupedByDay ? (
        <div className="space-y-6">
          {groupedByDay.map(({ day, items }) => (
            <div key={day} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-gray-800">{t('day', { day })}</h4>
                <Button type="button" onClick={() => addExercise(day)} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  {t('addExercise')}
                </Button>
              </div>
              <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                {items.map(({ exercise, flatIndex }) => renderExerciseRow(exercise, flatIndex))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {selectedExercises.map((exercise, index) => renderExerciseRow(exercise, index))}
          {selectedExercises.length > 0 && (
            <Button type="button" onClick={() => addExercise()} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              {t('addExercise')}
            </Button>
          )}
        </div>
      )}

      <ExerciseSearchModal
        isOpen={searchModalOpen}
        onClose={() => {
          setSearchModalOpen(false)
          setSearchTargetIndex(null)
        }}
        onSelect={handleExerciseSearchSelect}
        showSelectButton
      />
    </div>
  )
}
