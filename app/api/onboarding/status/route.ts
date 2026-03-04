import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const role = session.user.role

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        phone: true,
        age: true,
        goals: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profileComplete = !!(user.name && (user.phone || user.age || user.goals))

    let hasConnection = false
    let hasProgram = false
    let hasSession = false

    if (role === 'TRAINEE') {
      const [connectionCount, assignmentCount, sessionCount] = await Promise.all([
        prisma.trainerTraineeConnection.count({ where: { traineeId: userId } }),
        prisma.programAssignment.count({ where: { traineeId: userId } }),
        prisma.trainingSession.count({ where: { traineeId: userId } }),
      ])
      hasConnection = connectionCount > 0
      hasProgram = assignmentCount > 0
      hasSession = sessionCount > 0
    } else if (role === 'TRAINER') {
      const [connectionCount, programCount] = await Promise.all([
        prisma.trainerTraineeConnection.count({ where: { trainerId: userId } }),
        prisma.trainingProgram.count({ where: { trainerId: userId } }),
      ])
      hasConnection = connectionCount > 0
      hasProgram = programCount > 0
      hasSession = true // Not relevant for trainers
    }

    const accountAgeDays = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    return NextResponse.json({
      profileComplete,
      hasConnection,
      hasProgram,
      hasSession,
      accountAgeDays,
      allComplete: profileComplete && hasConnection && hasProgram && hasSession,
    })
  } catch (error) {
    console.error('Error fetching onboarding status:', error)
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
  }
}
