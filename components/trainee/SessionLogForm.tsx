'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { Select } from '@/components/shared/Select'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { ExerciseLogCard } from './ExerciseLogCard'

function getSessionSchema(programRequired: string) {
  return z.object({
    programId: z.string().min(1, programRequired),
    date: z.string().optional(),
    notes: z.string().optional(),
    rpe: z.string().optional(),
  })
}

type SessionFormData = z.infer<ReturnType<typeof getSessionSchema>>

interface Program {
  id: string
  name: string
  isActive?: boolean
  exercises: Array<{
    id: string
    exerciseId: string
    exercise: {
      id: string
      name: string
    }
    sets: number
    reps: number
    weight?: number
  }>
}

interface ExerciseData {
  exerciseId: string
  sets: number
  reps: number[]
  weights: number[]
  notes?: string
}

export function SessionLogForm() {
  const router = useRouter()
  const t = useTranslations('trainee.sessionsLog')
  const tCommon = useTranslations('common')
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [exerciseData, setExerciseData] = useState<Record<string, ExerciseData>>({})
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const sessionSchema = getSessionSchema(t('programRequired'))

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  })

  const programId = watch('programId')

  useEffect(() => {
    fetch('/api/programs')
      .then((res) => res.json())
      .then((data) => {
        const activePrograms = (data.programs || []).filter((p: Program) => p.isActive)
        setPrograms(activePrograms)
      })
      .catch((err) => console.error('Error fetching programs:', err))
  }, [])

  useEffect(() => {
    if (programId) {
      const program = programs.find((p) => p.id === programId)
      setSelectedProgram(program || null)
      
      // Initialize exercise data
      if (program) {
        const initialData: Record<string, ExerciseData> = {}
        program.exercises.forEach((ex) => {
          initialData[ex.exerciseId] = {
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: Array(ex.sets).fill(ex.reps),
            weights: Array(ex.sets).fill(ex.weight || 0),
          }
        })
        setExerciseData(initialData)
      }
    }
  }, [programId, programs])

  const updateExerciseData = (exerciseId: string, data: ExerciseData) => {
    setExerciseData((prev) => ({
      ...prev,
      [exerciseId]: data,
    }))
  }

  const onSubmit = async (data: SessionFormData) => {
    if (!selectedProgram) {
      setError(t('selectProgramError'))
      return
    }

    if (Object.keys(exerciseData).length === 0) {
      setError(t('logOneExerciseError'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const exercises = Object.values(exerciseData).map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        weights: ex.weights,
        notes: ex.notes,
      }))

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          rpe: data.rpe ? parseInt(data.rpe) : undefined,
          exercises,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || t('failedToLog'))
        setIsLoading(false)
        return
      }

      router.push('/trainee/sessions')
      router.refresh()
    } catch (err) {
      setError(t('errorOccurred'))
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label={t('program')}
          {...register('programId')}
          error={errors.programId?.message}
          options={[
            { value: '', label: t('selectProgram') },
            ...programs.map((p) => ({
              value: p.id,
              label: p.name,
            })),
          ]}
        />

        <Input
          label={t('date')}
          type="date"
          {...register('date')}
          error={errors.date?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('rpeOptional')}
          type="number"
          min="1"
          max="10"
          {...register('rpe')}
          error={errors.rpe?.message}
        />

        <Input
          label={t('sessionNotesOptional')}
          {...register('notes')}
          error={errors.notes?.message}
        />
      </div>

      {selectedProgram && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('exercises')}</h3>
          {selectedProgram.exercises.map((programExercise) => (
            <ExerciseLogCard
              key={programExercise.id}
              exercise={programExercise.exercise}
              programExercise={{
                sets: programExercise.sets,
                reps: programExercise.reps,
                weight: programExercise.weight,
              }}
              onUpdate={(data) =>
                updateExerciseData(programExercise.exerciseId, {
                  exerciseId: programExercise.exerciseId,
                  ...data,
                })
              }
            />
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || !selectedProgram}>
          {isLoading ? t('loggingSession') : t('logSession')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          {tCommon('cancel')}
        </Button>
      </div>
    </form>
  )
}
