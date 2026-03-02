import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trainees = await prisma.user.findMany({
      where: {
        role: 'TRAINEE',
        programAssignments: {
          some: { program: { trainerId: session.user.id } },
        },
      },
      include: {
        programAssignments: {
          where: {
            program: {
              trainerId: session.user.id,
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
          where: { program: { trainerId: session.user.id } },
          take: 5,
          orderBy: { date: 'desc' },
        },
      },
    })

    return NextResponse.json({ trainees })
  } catch (error) {
    console.error('Error fetching trainees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trainees' },
      { status: 500 }
    )
  }
}
