'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/shared/Input'
import { Select } from '@/components/shared/Select'
import { Button } from '@/components/shared/Button'
import { ExerciseSelector, ProgramExercise } from './ExerciseSelector'
import { AlertTriangle } from 'lucide-react'

interface Trainee {
  id: string
  name: string
  email: string
}

interface ProgramFormProps {
  programId?: string
  initialData?: any
  templateId?: string
}

export function ProgramForm({ programId, initialData, templateId }: ProgramFormProps) {
  const router = useRouter()
  const t = useTranslations('trainer.programForm')
  const tCommon = useTranslations('common')
  const [trainees, setTrainees] = useState<Trainee[]>([])
  const [exercises, setExercises] = useState<ProgramExercise[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [templateLoading, setTemplateLoading] = useState(!!templateId)
  const [isRehabTemplate, setIsRehabTemplate] = useState(false)

  const programSchema = z.object({
    name: z.string().min(1, t('nameRequired')),
    description: z.string().optional(),
    duration: z.string().optional(),
    traineeId: z.string().min(1, t('traineeRequired')),
  })
  const programFromTemplateSchema = z.object({
    name: z.string().min(1, t('nameRequired')),
    description: z.string().optional(),
    duration: z.string().optional(),
    traineeId: z.string().optional(),
  })
  type ProgramFormData = z.infer<typeof programSchema>
  type ProgramFromTemplateFormData = z.infer<typeof programFromTemplateSchema>
  const schema = templateId ? programFromTemplateSchema : programSchema
  type FormData = typeof templateId extends string ? ProgramFromTemplateFormData : ProgramFormData

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      name: '',
      description: '',
      duration: '',
      traineeId: '',
    },
  })

  useEffect(() => {
    fetch('/api/connections')
      .then((res) => res.json())
      .then((data) => setTrainees(data.users || []))
      .catch((err) => console.error('Error fetching connected trainees:', err))
  }, [])

  useEffect(() => {
    if (templateId) {
      setTemplateLoading(true)
      fetch(`/api/templates/${templateId}`)
        .then((res) => res.json())
        .then((data) => {
          const t = data.template
          if (t) {
            setIsRehabTemplate(t.category === 'REHAB')
            setValue('name', t.name)
            setValue('description', t.description ?? '')
            setValue('duration', t.duration?.toString() ?? '')
            setExercises(
              t.exercises.map((ex: any) => ({
                exerciseId: ex.exerciseId,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight,
                restTimeSeconds: ex.restTimeSeconds,
                order: ex.order,
                dayOfWeek: ex.dayOfWeek,
                workoutDayIndex: ex.workoutDayIndex,
              }))
            )
          }
        })
        .catch((err) => {
          console.error(err)
          setError(t('loadingTemplate'))
        })
        .finally(() => setTemplateLoading(false))
    } else if (initialData?.exercises) {
      setExercises(
        initialData.exercises.map((ex: any) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          restTimeSeconds: ex.restTimeSeconds,
          order: ex.order,
          dayOfWeek: ex.dayOfWeek,
          workoutDayIndex: ex.workoutDayIndex,
        }))
      )
    }
  }, [templateId, initialData, setValue])

  const onSubmit = async (data: FormData) => {
    if (exercises.some((ex) => !ex.exerciseId)) {
      setError(t('selectExerciseForAll'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        duration: data.duration ? parseInt(data.duration) : undefined,
        traineeId: data.traineeId || undefined,
        exercises,
      }

      const url = templateId ? '/api/programs/from-template' : '/api/programs'
      const body = templateId
        ? { ...payload, templateId }
        : payload

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || t('failedToCreate'))
        setIsLoading(false)
        return
      }

      router.push('/trainer/programs')
      router.refresh()
    } catch (err) {
      setError(t('errorOccurred'))
      setIsLoading(false)
    }
  }

  if (templateLoading) {
    return (
      <div className="text-center py-8 text-gray-500">{t('loadingTemplate')}</div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isRehabTemplate && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            {t('rehabDisclaimer')}
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('programName')}
          {...register('name')}
          error={errors.name?.message}
        />

        <Select
          label={templateId ? t('traineeOptional') : t('traineeLabel')}
          {...register('traineeId')}
          error={errors.traineeId?.message}
          options={[
            { value: '', label: templateId ? t('noTraineeYet') : t('selectTrainee') },
            ...trainees.map((tr) => ({
              value: tr.id,
              label: `${tr.name} (${tr.email})`,
            })),
          ]}
        />
      </div>

      <Input
        label={t('descriptionOptional')}
        {...register('description')}
        error={errors.description?.message}
      />

      <Input
        label={t('durationOptional')}
        type="number"
        min="1"
        {...register('duration')}
        error={errors.duration?.message}
      />

      <ExerciseSelector
        onExercisesChange={setExercises}
        initialExercises={exercises}
      />

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t('creating') : programId ? t('updateProgram') : t('createProgram')}
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
