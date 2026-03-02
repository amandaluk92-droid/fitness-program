import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/shared/Card'
import { formatDate } from '@/lib/utils'
import { User, Mail, Calendar, FileText, Phone, Target, Scale } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/shared/Button'

async function getTrainee(traineeId: string, trainerId: string) {
  const trainee = await prisma.user.findFirst({
    where: {
      id: traineeId,
      role: 'TRAINEE',
      programAssignments: {
        some: { program: { trainerId } },
      },
    },
    include: {
      programAssignments: {
        where: { program: { trainerId } },
        include: {
          program: {
            include: {
              exercises: { include: { exercise: true } },
              sessions: {
                take: 5,
                orderBy: { date: 'desc' },
              },
            },
          },
        },
      },
      trainingSessions: {
        where: { program: { trainerId } },
        include: {
          program: { select: { id: true, name: true } },
        },
        take: 10,
        orderBy: { date: 'desc' },
      },
    },
  })
  return trainee
}

export default async function TraineeDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getSession()

  if (!session || session.user.role !== 'TRAINER') {
    redirect('/trainee/dashboard')
  }

  const trainee = await getTrainee(params.id, session.user.id)

  if (!trainee) {
    notFound()
  }

  const totalSessions = trainee.trainingSessions.length
  const activePrograms = trainee.programAssignments.filter((pa) => pa.program.isActive).length
  const t = await getTranslations('trainer.traineeDetail')
  const tPrograms = await getTranslations('trainer.programs')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{trainee.name}</h1>
          <p className="text-gray-600 mt-1">{t('traineeProfile')}</p>
        </div>
        <Link href={`/trainer/trainees/${params.id}/progress`}>
          <Button variant="outline">
            {t('viewProgress')}
          </Button>
        </Link>
      </div>

      {/* Trainee Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary-500" />
            <div>
              <p className="text-sm text-gray-600">{t('name')}</p>
              <p className="font-medium text-gray-900">{trainee.name}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary-500" />
            <div>
              <p className="text-sm text-gray-600">{t('email')}</p>
              <p className="font-medium text-gray-900">{trainee.email}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary-500" />
            <div>
              <p className="text-sm text-gray-600">{t('activePrograms')}</p>
              <p className="font-medium text-gray-900">{activePrograms}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Personal profile */}
      <Card title={t('personalProfile')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary-500" />
            <div>
              <p className="text-sm text-gray-600">{t('phone')}</p>
              <p className="font-medium text-gray-900">{trainee.phone ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary-500" />
            <div>
              <p className="text-sm text-gray-600">{t('age')}</p>
              <p className="font-medium text-gray-900">{trainee.age != null ? trainee.age : '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary-500" />
            <div>
              <p className="text-sm text-gray-600">{t('sex')}</p>
              <p className="font-medium text-gray-900">{trainee.sex ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Scale className="h-5 w-5 text-primary-500" />
            <div>
              <p className="text-sm text-gray-600">{t('weightKg')}</p>
              <p className="font-medium text-gray-900">{trainee.weight != null ? trainee.weight : '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary-500" />
            <div>
              <p className="text-sm text-gray-600">{t('goalWeightKg')}</p>
              <p className="font-medium text-gray-900">{trainee.goalWeight != null ? trainee.goalWeight : '—'}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-3">
          <Target className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-600">{t('goals')}</p>
            <p className="font-medium text-gray-900 whitespace-pre-wrap">{trainee.goals ?? '—'}</p>
          </div>
        </div>
      </Card>

      {/* Programs */}
      <Card title={t('assignedPrograms')}>
        {trainee.programAssignments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">{t('noProgramsAssigned')}</p>
            <Link href="/trainer/programs/new">
              <Button>
                {t('createProgram')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {trainee.programAssignments.map((pa) => {
              const program = pa.program
              return (
                <Link key={program.id} href={`/trainer/programs/${program.id}`}>
                  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{program.name}</h3>
                        {program.description && (
                          <p className="text-sm text-gray-600 mt-1">{program.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                          {program.exercises.length} exercises • {program.sessions.length} sessions
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${program.isActive ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-600'}`}>
                        {program.isActive ? tPrograms('active') : tPrograms('inactive')}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </Card>

      {/* Recent Sessions */}
      {trainee.trainingSessions.length > 0 && (
        <Card title={t('recentSessions')}>
          <div className="space-y-3">
            {trainee.trainingSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{session.program.name}</p>
                  {session.notes && (
                    <p className="text-sm text-gray-600 mt-1">{session.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{formatDate(session.date)}</p>
                  {session.rpe && (
                    <p className="text-xs text-gray-500 mt-1">RPE: {session.rpe}/10</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
