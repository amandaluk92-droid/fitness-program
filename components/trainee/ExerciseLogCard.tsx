'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { Plus, Trash2, Search } from 'lucide-react'
import { ExerciseSearchModal } from '@/components/ExerciseSearchModal'

interface Exercise {
  id: string
  name: string
  description?: string
}

interface ExerciseLogCardProps {
  exercise: Exercise
  programExercise?: {
    sets: number
    reps: number
    weight?: number
  }
  onUpdate: (data: {
    sets: number
    reps: number[]
    weights: number[]
    notes?: string
  }) => void
}

export function ExerciseLogCard({ exercise, programExercise, onUpdate }: ExerciseLogCardProps) {
  const t = useTranslations('trainee.exerciseLogCard')
  const [sets, setSets] = useState(programExercise?.sets || 3)
  const [reps, setReps] = useState<number[]>(Array(sets).fill(programExercise?.reps || 10))
  const [weights, setWeights] = useState<number[]>(Array(sets).fill(programExercise?.weight || 0))
  const [notes, setNotes] = useState('')
  const [searchModalOpen, setSearchModalOpen] = useState(false)

  const updateReps = (index: number, value: number) => {
    const newReps = [...reps]
    newReps[index] = value
    setReps(newReps)
    onUpdate({ sets, reps: newReps, weights, notes })
  }

  const updateWeight = (index: number, value: number) => {
    const newWeights = [...weights]
    newWeights[index] = value
    setWeights(newWeights)
    onUpdate({ sets, reps, weights: newWeights, notes })
  }

  const addSet = () => {
    const newSets = sets + 1
    setSets(newSets)
    setReps([...reps, reps[reps.length - 1] || 10])
    setWeights([...weights, weights[weights.length - 1] || 0])
    onUpdate({ sets: newSets, reps: [...reps, reps[reps.length - 1] || 10], weights: [...weights, weights[weights.length - 1] || 0], notes })
  }

  const removeSet = (index: number) => {
    if (sets <= 1) return
    const newSets = sets - 1
    setSets(newSets)
    const newReps = reps.filter((_, i) => i !== index)
    const newWeights = weights.filter((_, i) => i !== index)
    setReps(newReps)
    setWeights(newWeights)
    onUpdate({ sets: newSets, reps: newReps, weights: newWeights, notes })
  }

  const handleNotesChange = (value: string) => {
    setNotes(value)
    onUpdate({ sets, reps, weights, notes: value })
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
        <button
          type="button"
          onClick={() => setSearchModalOpen(true)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600"
          title={t('viewDemo')}
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {Array.from({ length: sets }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 text-sm font-medium text-gray-700">
              {t('set', { n: index + 1 })}
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t('reps')}</label>
                <input
                  type="number"
                  min="1"
                  value={reps[index] || ''}
                  onChange={(e) => updateReps(index, parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t('weightKg')}</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={weights[index] || ''}
                  onChange={(e) => updateWeight(index, parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            {sets > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSet(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <Button type="button" variant="outline" size="sm" onClick={addSet}>
          <Plus className="h-4 w-4 mr-1" />
          {t('addSet')}
        </Button>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('notesOptional')}
        </label>
        <textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={t('notesPlaceholder')}
        />
      </div>
      <ExerciseSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </Card>
  )
}
