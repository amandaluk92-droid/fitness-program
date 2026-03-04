import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { ActiveProgramsList } from '@/components/trainee/ActiveProgramsList'
import { ConnectTrainerForm } from '@/components/trainee/ConnectTrainerForm'
import { DisconnectButton } from '@/components/shared/DisconnectButton'
import { Card } from '@/components/shared/Card'
import { formatDate } from '@/lib/utils'
import { FileText, Calendar, TrendingUp, User } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/shared/Button'
import { OnboardingChecklist } from '@/components/shared/OnboardingChecklist'

async function getTraineeData(traineeId: string) {
  const [programs, recentSessions, stats] = await Promise.all([
    prisma.trainingProgram.findMany({
      where: {
        assignments: { some: { traineeId } },
        isActive: true,
      },
      include: {
        exercises: { include: { exercise: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.trainingSession.findMany({
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
      },
      take: 5,
      orderBy: {
        date: 'desc',
      },
    }),
    (async () => {
      const totalSessions = await prisma.trainingSession.count({
        where: { traineeId },
      })

      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      const sessionsThisWeek = await prisma.trainingSession.count({
        where: {
          traineeId,
          date: {
            gte: startOfWeek,
          },
        },
      })

      return { totalSessions, sessionsThisWeek }
    })(),
  ])

  return { programs, recentSessions, stats }
}

async function getConnectedTrainers(traineeId: string) {
  const connections = await prisma.trainerTraineeConnection.findMany({
    where: { traineeId },
    include: {
      trainer: { select: { id: true, name: true, email: true } },
    },
  })
  return connections.map((c) => c.trainer)
}

export default async function TraineeDashboard() {
  const session = await getSession()

  if (!session || session.user.role !== 'TRAINEE') {
    redirect('/trainee/dashboard')
  }

  const [{ programs, recentSessions, stats }, connectedTrainers] = await Promise.all([
    getTraineeData(session.user.id),
    getConnectedTrainers(session.user.id),
  ])
  const t = await getTranslations('trainee.dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('welcomeBack', { name: session.user.name ?? '' })}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('activePrograms')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{programs.length}</p>
            </div>
            <FileText className="h-8 w-8 text-primary-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('totalSessions')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalSessions}</p>
            </div>
            <Calendar className="h-8 w-8 text-primary-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('sessionsThisWeek')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.sessionsThisWeek}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary-500" />
          </div>
        </Card>
      </div>

      <OnboardingChecklist role="TRAINEE" />

      {/* Connect with your trainer */}
      <Card title={t('connectCardTitle')}>
        <p className="text-sm text-gray-600 mb-4">
          {t('connectCardDesc')}
        </p>
        <ConnectTrainerForm />
        {connectedTrainers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">{t('yourTrainers')}</p>
            <ul className="space-y-2">
              {connectedTrainers.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary-500" />
                    <span className="font-medium text-gray-900">{t.name}</span>
                    <span>({t.email})</span>
                  </div>
                  <DisconnectButton email={t.email} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href="/trainee/sessions/log">
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            {t('logNewSession')}
          </Button>
        </Link>
        <Link href="/trainee/progress">
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            {t('viewProgress')}
          </Button>
        </Link>
      </div>

      {/* Active Programs */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('activeProgramsHeading')}</h2>
        <ActiveProgramsList programs={programs as any} />
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <Card title={t('recentSessions')}>
          <div className="space-y-3">
            {recentSessions.map((session) => (
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
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
