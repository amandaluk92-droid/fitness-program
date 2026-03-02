import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/shared/Card'
import { formatDate } from '@/lib/utils'
import { Dumbbell, Calendar } from 'lucide-react'
import { ProgramExerciseDemoButton } from '@/components/trainee/ProgramExerciseDemoButton'

async function getProgram(programId: string, traineeId: string) {
  return await prisma.trainingProgram.findFirst({
    where: {
      id: programId,
      assignments: { some: { traineeId } },
    },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: [{ workoutDayIndex: 'asc' }, { order: 'asc' }],
      },
      trainer: { select: { id: true, name: true } },
    },
  })
}

export default async function ProgramDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getSession()

  if (!session || session.user.role !== 'TRAINEE') {
    redirect('/trainee/dashboard')
  }

  const program = await getProgram(params.id, session.user.id)

  if (!program) {
    notFound()
  }

  const t = await getTranslations('trainee.programDetail')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{program.name}</h1>
        {program.description && (
          <p className="text-gray-600 mt-1">{program.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <Dumbbell className="h-5 w-5 text-primary-500" />
            <div>
              <p className="text-sm text-gray-600">{t('exercises')}</p>
              <p className="font-medium text-gray-900">{program.exercises.length}</p>
            </div>
          </div>
        </Card>

        {program.duration && (
          <Card>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-600">{t('duration')}</p>
                <p className="font-medium text-gray-900">{program.duration} {t('weeks')}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Card title={t('exercises')}>
        {(() => {
          const hasWorkoutDays = program.exercises.some(
            (e) => e.workoutDayIndex != null
          )
          if (hasWorkoutDays) {
            const dayMap = new Map<number, typeof program.exercises>()
            program.exercises.forEach((ex) => {
              const day = ex.workoutDayIndex ?? 1
              if (!dayMap.has(day)) dayMap.set(day, [])
              dayMap.get(day)!.push(ex)
            })
            const sortedDays = [...dayMap.keys()].sort((a, b) => a - b)
            return (
              <div className="space-y-6">
                {sortedDays.map((day) => (
                  <div key={day}>
                    <h4 className="text-base font-semibold text-gray-800 mb-3">{t('day', { day })}</h4>
                    <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                      {dayMap.get(day)!.map((exercise, index) => (
                        <div key={exercise.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-semibold text-gray-900">
                              {index + 1}. {exercise.exercise.name}
                            </h5>
                            <ProgramExerciseDemoButton exerciseName={exercise.exercise.name} />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">{t('sets')}</span>{' '}
                              <span className="font-medium">{exercise.sets}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">{t('reps')}</span>{' '}
                              <span className="font-medium">{exercise.reps}</span>
                            </div>
                            {exercise.weight && (
                              <div>
                                <span className="text-gray-600">{t('weight')}</span>{' '}
                                <span className="font-medium">{exercise.weight} kg</span>
                              </div>
                            )}
                            {exercise.restTimeSeconds && (
                              <div>
                                <span className="text-gray-600">{t('rest')}</span>{' '}
                                <span className="font-medium">{exercise.restTimeSeconds}s</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          }
          return (
            <div className="space-y-4">
              {program.exercises.map((exercise, index) => (
                <div key={exercise.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {index + 1}. {exercise.exercise.name}
                    </h4>
                    <ProgramExerciseDemoButton exerciseName={exercise.exercise.name} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">{t('sets')}</span>{' '}
                      <span className="font-medium">{exercise.sets}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('reps')}</span>{' '}
                      <span className="font-medium">{exercise.reps}</span>
                    </div>
                    {exercise.weight && (
                      <div>
                        <span className="text-gray-600">{t('weight')}</span>{' '}
                        <span className="font-medium">{exercise.weight} kg</span>
                      </div>
                    )}
                    {exercise.restTimeSeconds && (
                      <div>
                        <span className="text-gray-600">{t('rest')}</span>{' '}
                        <span className="font-medium">{exercise.restTimeSeconds}s</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
      </Card>
    </div>
  )
}
