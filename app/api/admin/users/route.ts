import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getMaxTrainees } from '@/lib/subscription-tiers'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const unauth = requireAdmin(session)
    if (unauth) return unauth

    const { searchParams } = new URL(request.url)
    const roleFilter = searchParams.get('role') // TRAINER | TRAINEE | null for all

    const users = await prisma.user.findMany({
      where: roleFilter ? { role: roleFilter as 'TRAINER' | 'TRAINEE' | 'ADMIN' } : undefined,
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

    const usersWithSummary = users.map((u) => {
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

    return NextResponse.json({ users: usersWithSummary })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
