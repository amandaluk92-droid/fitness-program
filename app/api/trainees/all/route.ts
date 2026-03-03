import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'TRAINER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Admin can see all trainees
    if (session.user.role === 'ADMIN') {
      const trainees = await prisma.user.findMany({
        where: { role: 'TRAINEE' },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
      })
      return NextResponse.json({ trainees })
    }

    // Trainers can only see trainees connected to them
    const connections = await prisma.trainerTraineeConnection.findMany({
      where: { trainerId: session.user.id },
      select: {
        trainee: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    const trainees = connections
      .map((c) => c.trainee)
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({ trainees })
  } catch (error) {
    console.error('Error fetching trainees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trainees' },
      { status: 500 }
    )
  }
}
