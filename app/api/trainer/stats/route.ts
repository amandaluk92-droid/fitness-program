import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trainerId = session.user.id

    // Get total trainees (distinct trainees with at least one program assignment)
    const totalTraineesResult = await prisma.programAssignment.findMany({
      where: { program: { trainerId } },
      select: { traineeId: true },
      distinct: ['traineeId'],
    })
    const totalTrainees = totalTraineesResult.length

    // Get active programs
    const activePrograms = await prisma.trainingProgram.count({
      where: {
        trainerId,
        isActive: true,
      },
    })

    // Get total sessions this week
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

    // Get recent activity (last 5 sessions)
    const recentSessions = await prisma.trainingSession.findMany({
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

    return NextResponse.json({
      stats: {
        totalTrainees,
        activePrograms,
        sessionsThisWeek,
      },
      recentSessions,
    })
  } catch (error) {
    console.error('Error fetching trainer stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
