'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'

interface SessionExercise {
  id: string
  exerciseId: string
  exercise: { id: string; name: string }
  sets: number
  reps: number[]
  weights: number[]
  notes?: string | null
}

interface SessionData {
  id: string
  notes?: string | null
  rpe?: number | null
  exercises: SessionExercise[]
  program: { id: string; name: string }
}

export function SessionEditForm({ session }: { session: SessionData }) {
  const router = useRouter()
  const t = useTranslations('trainee.sessions')
  const tCommon = useTranslations('common')
  const [notes, setNotes] = useState(session.notes || '')
  const [rpe, setRpe] = useState(session.rpe?.toString() || '')
  const [exercises, setExercises] = useState(
    session.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exercise.name,
      sets: ex.sets,
      reps: [...ex.reps],
      weights: [...ex.weights],
      notes: ex.notes || '',
    }))
  )
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const updateExerciseRep = (exIdx: number, setIdx: number, value: number) => {
    setExercises((prev) => {
      const next = [...prev]
      next[exIdx] = { ...next[exIdx], reps: [...next[exIdx].reps] }
      next[exIdx].reps[setIdx] = value
      return next
    })
  }

  const updateExerciseWeight = (exIdx: number, setIdx: number, value: number) => {
    setExercises((prev) => {
      const next = [...prev]
      next[exIdx] = { ...next[exIdx], weights: [...next[exIdx].weights] }
      next[exIdx].weights[setIdx] = value
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: notes || undefined,
          rpe: rpe ? parseInt(rpe) : null,
          exercises: exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weights: ex.weights,
            notes: ex.notes || undefined,
          })),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || t('updateFailed'))
        setIsLoading(false)
        return
      }

      router.push('/trainee/sessions')
      router.refresh()
    } catch {
      setError(t('updateFailed'))
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="RPE (1-10)"
          type="number"
          min="1"
          max="10"
          value={rpe}
          onChange={(e) => setRpe(e.target.value)}
        />
        <Input
          label={t('notesLabel')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('exercisesLabel')}</h3>
        {exercises.map((ex, exIdx) => (
          <Card key={ex.exerciseId}>
            <h4 className="font-medium text-gray-900 mb-3">{ex.exerciseName}</h4>
            <div className="space-y-2">
              {ex.reps.map((rep, setIdx) => (
                <div key={setIdx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 w-12">
                    {t('set', { n: setIdx + 1 })}
                  </span>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      value={rep}
                      onChange={(e) => updateExerciseRep(exIdx, setIdx, parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Reps"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={ex.weights[setIdx] || 0}
                      onChange={(e) => updateExerciseWeight(exIdx, setIdx, parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="kg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? tCommon('loading') : t('saveChanges')}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {tCommon('cancel')}
        </Button>
      </div>
    </form>
  )
}
