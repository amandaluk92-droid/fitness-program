import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/shared/Card'
import { formatDate } from '@/lib/utils'
import { User, Calendar, Dumbbell } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { AssignTraineeForm } from '@/components/trainer/AssignTraineeForm'

async function getProgram(programId: string, trainerId: string) {
  return await prisma.trainingProgram.findFirst({
    where: {
      id: programId,
      trainerId,
    },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: 'asc' },
      },
      assignments: {
        include: {
          trainee: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      sessions: {
        take: 5,
        orderBy: { date: 'desc' },
      },
    },
  })
}

export default async function ProgramDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getSession()

  if (!session || session.user.role !== 'TRAINER') {
    redirect('/trainee/dashboard')
  }

  const program = await getProgram(params.id, session.user.id)

  if (!program) {
    notFound()
  }

  const t = await getTranslations('trainer.programDetail')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{program.name}</h1>
        {program.description && (
          <p className="text-gray-600 mt-1">{program.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <User className="h-5 w-5 text-primary-500" />
            <div>
              <p className="text-sm text-gray-600">{t('assignedTrainees')}</p>
              <p className="font-medium text-gray-900">
                {program.assignments.length === 0
                  ? t('none')
                  : program.assignments.map((a) => a.trainee.name).join(', ')}
              </p>
            </div>
          </div>
          <AssignTraineeForm
            programId={program.id}
            assignedTraineeIds={program.assignments.map((a) => a.trainee.id)}
          />
        </Card>

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
        <div className="space-y-4">
          {program.exercises.map((exercise, index) => (
            <div key={exercise.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">
                  {index + 1}. {exercise.exercise.name}
                </h4>
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
      </Card>

      {program.sessions.length > 0 && (
        <Card title={t('recentSessions')}>
          <div className="space-y-2">
            {program.sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-900">{formatDate(session.date)}</span>
                {session.notes && (
                  <span className="text-sm text-gray-600">{session.notes}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
