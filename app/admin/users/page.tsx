import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Card } from '@/components/shared/Card'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getMaxTrainees } from '@/lib/subscription-tiers'
import { formatDate } from '@/lib/utils'
import { AdminUsersTable } from '@/components/admin/AdminUsersTable'

async function getAdminUsers(roleFilter?: string) {
  const users = await prisma.user.findMany({
    where: roleFilter
      ? { role: roleFilter as 'ADMIN' | 'TRAINER' | 'TRAINEE' }
      : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          createdPrograms: true,
          programAssignments: true,
          trainingSessions: true,
        },
      },
      trainerSubscriptions: {
        where: { status: 'ACTIVE' },
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
      payments: {
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { name: 'asc' },
  })

  const trainerIds = users.filter((u) => u.role === 'TRAINER').map((u) => u.id)
  const traineeCounts =
    trainerIds.length > 0
      ? ((await prisma.$queryRaw`
          SELECT p."trainerId", COUNT(DISTINCT pa."traineeId")::int as count
          FROM "training_programs" p
          JOIN "program_assignments" pa ON pa."programId" = p."id"
          WHERE p."trainerId" IN (${Prisma.join(trainerIds)})
          GROUP BY p."trainerId"
        `) as { trainerId: string; count: number }[])
      : []
  const traineeCountMap = Object.fromEntries(
    traineeCounts.map((r) => [r.trainerId, r.count])
  )

  return users.map((u) => {
    const sub = u.trainerSubscriptions[0]
    const traineeCount = u.role === 'TRAINER' ? traineeCountMap[u.id] ?? 0 : 0
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      programsCount:
        u.role === 'TRAINER' ? u._count.createdPrograms : u._count.programAssignments,
      sessionsCount: u._count.trainingSessions,
      traineeCount,
      hasActiveSubscription: !!sub,
      subscriptionTier: sub?.tier ?? null,
      maxTrainees: sub ? getMaxTrainees(sub.tier) : null,
      lastPaymentAt: u.payments[0]?.createdAt ?? null,
    }
  })
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/trainee/dashboard')
  }

  const params = await searchParams
  const users = await getAdminUsers(params.role)
  const t = await getTranslations('admin.users')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">All platform users with subscription and payment status</p>
      </div>

      <Card>
        <AdminUsersTable users={users} />
      </Card>
    </div>
  )
}
