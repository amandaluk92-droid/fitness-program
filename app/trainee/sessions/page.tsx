import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Calendar } from 'lucide-react'
import { SessionActions } from '@/components/trainee/SessionActions'

async function getSessions(traineeId: string) {
  return await prisma.trainingSession.findMany({
    where: {
      traineeId,
    },
    include: {
      program: {
        select: {
          id: true,
          name: true,
        },
      },
      exercises: {
        include: {
          exercise: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  })
}

export default async function SessionsPage() {
  const session = await getSession()

  if (!session || session.user.role !== 'TRAINEE') {
    redirect('/trainee/dashboard')
  }

  const sessions = await getSessions(session.user.id)
  const t = await getTranslations('trainee.sessions')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <Link href="/trainee/sessions/log">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('logSession')}
          </Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{t('noSessionsYet')}</p>
            <p className="text-sm text-gray-400 mb-4">{t('noSessionsHint')}</p>
            <Link href="/trainee/sessions/log">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('logFirstSession')}
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{session.program.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(session.date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {session.rpe && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">RPE</p>
                      <p className="text-lg font-semibold text-primary-600">{session.rpe}/10</p>
                    </div>
                  )}
                  <SessionActions sessionId={session.id} />
                </div>
              </div>

              {session.notes && (
                <p className="text-sm text-gray-700 mb-4">{session.notes}</p>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">{t('exercisesLabel')}</h4>
                {session.exercises.map((exercise) => (
                  <div key={exercise.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{exercise.exercise.name}</p>
                    <div className="mt-2 text-sm text-gray-600">
                      {exercise.reps.map((rep, index) => (
                        <span key={index} className="mr-3">
                          {t('set', { n: index + 1 })}: {rep} reps @ {exercise.weights[index] || 0} kg
                        </span>
                      ))}
                    </div>
                    {exercise.notes && (
                      <p className="text-xs text-gray-500 mt-1">{exercise.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
