import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'
import { TraineeList } from '@/components/trainer/TraineeList'
import { Card } from '@/components/shared/Card'
import { prisma } from '@/lib/prisma'
import { canTrainerAddTrainee, isPaymentsDisabled } from '@/lib/trainer-limits'
import { formatDate } from '@/lib/utils'
import { Users, FileText, Calendar, TrendingUp, CreditCard } from 'lucide-react'

async function getTrainerStats(trainerId: string) {
  const totalTraineesResult = await prisma.programAssignment.findMany({
    where: { program: { trainerId } },
    select: { traineeId: true },
    distinct: ['traineeId'],
  })
  const totalTrainees = totalTraineesResult.length

  const activePrograms = await prisma.trainingProgram.count({
    where: {
      trainerId,
      isActive: true,
    },
  })

  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const sessionsThisWeek = await prisma.trainingSession.count({
    where: {
      program: {
        trainerId,
      },
      date: {
        gte: startOfWeek,
      },
    },
  })

  return { totalTrainees, activePrograms, sessionsThisWeek }
}

async function getTrainees(trainerId: string) {
  return await prisma.user.findMany({
    where: {
      role: 'TRAINEE',
      programAssignments: {
        some: { program: { trainerId } },
      },
    },
    include: {
      programAssignments: {
        where: {
          program: {
            trainerId,
            isActive: true,
          },
        },
        include: {
          program: {
            include: {
              sessions: {
                take: 1,
                orderBy: { date: 'desc' },
              },
            },
          },
        },
      },
      trainingSessions: {
        where: { program: { trainerId } },
        take: 5,
        orderBy: { date: 'desc' },
      },
    },
  })
}

async function getRecentSessions(trainerId: string) {
  return await prisma.trainingSession.findMany({
    where: {
      program: {
        trainerId,
      },
    },
    include: {
      trainee: {
        select: {
          id: true,
          name: true,
        },
      },
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
  })
}

export default async function TrainerDashboard() {
  const session = await getSession()

  if (!session || session.user.role !== 'TRAINER') {
    redirect('/trainee/dashboard')
  }

  const trainerId = session.user.id
  const [stats, trainees, recentSessions, limits, freeTrialRecord] =
    await Promise.all([
      getTrainerStats(trainerId),
      getTrainees(trainerId),
      getRecentSessions(trainerId),
      canTrainerAddTrainee(trainerId),
      prisma.trainerSubscription.findFirst({
        where: { trainerId, tier: 'FREE_TRIAL' },
      }),
    ])
  const paymentsDisabled = isPaymentsDisabled()
  const hadExpiredTrial =
    !paymentsDisabled && !limits.subscription && freeTrialRecord !== null

  const nearLimit =
    limits.subscription &&
    limits.maxTrainees > 0 &&
    limits.currentCount >= limits.maxTrainees - 1

  const isFreeTrial = limits.subscription?.tier === 'FREE_TRIAL'
  const trialEndDate = limits.subscription?.endDate
    ? new Date(limits.subscription.endDate)
    : null
  const now = new Date()
  const daysUntilTrialEnd = trialEndDate
    ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    : null
  const trialEndingSoon =
    !paymentsDisabled &&
    isFreeTrial &&
    trialEndDate &&
    daysUntilTrialEnd !== null &&
    daysUntilTrialEnd <= 5

  const t = await getTranslations('trainer.dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('welcomeBack', { name: session.user.name ?? '' })}</p>
      </div>

      {!paymentsDisabled && !limits.subscription && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-amber-600" />
            <p className="text-amber-800 font-medium">
              {hadExpiredTrial ? t('trialEnded') : t('subscribePrompt')}
            </p>
          </div>
          <Link
            href="/trainer/subscription"
            className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700"
          >
            {t('subscribe')}
          </Link>
        </div>
      )}

      {!paymentsDisabled && trialEndingSoon && trialEndDate && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-center justify-between">
          <p className="text-blue-800 font-medium">
            {t('trialEndsOn', { date: formatDate(trialEndDate) })}
          </p>
          <Link
            href="/trainer/subscription"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            {t('choosePlan')}
          </Link>
        </div>
      )}

      {!paymentsDisabled && limits.subscription && nearLimit && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-center justify-between">
          <p className="text-blue-800 font-medium">
            {t('nearLimit', { current: limits.currentCount, max: limits.maxTrainees })}
          </p>
          <Link
            href="/trainer/subscription"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            {t('upgrade')}
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('totalTrainees')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalTrainees}</p>
            </div>
            <Users className="h-8 w-8 text-primary-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('activePrograms')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activePrograms}</p>
            </div>
            <FileText className="h-8 w-8 text-primary-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('sessionsThisWeek')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.sessionsThisWeek}</p>
            </div>
            <Calendar className="h-8 w-8 text-primary-500" />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      {recentSessions.length > 0 && (
        <Card title={t('recentActivity')}>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{session.trainee.name}</p>
                  <p className="text-sm text-gray-600">{session.program.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{formatDate(session.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Trainees */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('yourTrainees')}</h2>
        <TraineeList trainees={trainees as any} />
      </div>
    </div>
  )
}
