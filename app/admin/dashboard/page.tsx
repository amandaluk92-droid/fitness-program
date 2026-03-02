import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Card } from '@/components/shared/Card'
import { prisma } from '@/lib/prisma'
import { formatDate, formatCurrencyHKD } from '@/lib/utils'
import Link from 'next/link'
import {
  Users,
  UserCheck,
  UserCog,
  CreditCard,
  DollarSign,
  ArrowRight,
} from 'lucide-react'

async function getAdminStats() {
  const now = new Date()
  const [totalUsers, trainersCount, traineesCount, activeSubscriptions, activeFreeTrials, totalRevenue, recentPayments] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'TRAINER' } }),
      prisma.user.count({ where: { role: 'TRAINEE' } }),
      prisma.trainerSubscription.count({ where: { status: 'ACTIVE' } }),
      prisma.trainerSubscription.count({
        where: {
          tier: 'FREE_TRIAL',
          status: 'ACTIVE',
          endDate: { gte: now },
        },
      }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        include: { user: { select: { name: true } } },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ])

  return {
    totalUsers,
    trainersCount,
    traineesCount,
    activeSubscriptions,
    activeFreeTrials,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    recentPayments,
  }
}

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/trainee/dashboard')
  }

  const stats = await getAdminStats()
  const t = await getTranslations('admin.dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('totalUsers')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-primary-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('trainers')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.trainersCount}</p>
            </div>
            <UserCheck className="h-8 w-8 text-primary-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('trainees')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.traineesCount}</p>
            </div>
            <UserCog className="h-8 w-8 text-primary-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('activeSubscriptions')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.activeSubscriptions}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-primary-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('totalRevenue')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrencyHKD(stats.totalRevenue)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary-500" />
          </div>
        </Card>
      </div>

      {stats.activeFreeTrials > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('activeFreeTrials')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.activeFreeTrials}
              </p>
            </div>
            <Link
              href="/admin/subscriptions"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              {t('viewSubscriptions')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      )}

      <Card title={t('recentPayments')} action={
        <Link
          href="/admin/payments"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          {t('viewAll')} <ArrowRight className="h-4 w-4" />
        </Link>
      }>
        {stats.recentPayments.length > 0 ? (
          <div className="space-y-3">
            {stats.recentPayments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{p.user.name}</p>
                  <p className="text-sm text-gray-600">{p.description ?? t('payment')}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrencyHKD(p.amount)}</p>
                  <p className="text-sm text-gray-600">{formatDate(p.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">{t('noPaymentsYet')}</p>
        )}
      </Card>
    </div>
  )
}
