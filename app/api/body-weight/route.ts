import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const postSchema = z.object({
  weight: z.coerce.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const traineeId = searchParams.get('traineeId')
    const weeks = parseInt(searchParams.get('weeks') || '8')

    let targetTraineeId = session.user.id

    if (session.user.role === 'TRAINER') {
      if (!traineeId) {
        return NextResponse.json({ error: 'Trainee ID required' }, { status: 400 })
      }
      targetTraineeId = traineeId

      const assignment = await prisma.programAssignment.findFirst({
        where: {
          traineeId: targetTraineeId,
          program: { trainerId: session.user.id },
        },
      })

      if (!assignment) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - weeks * 7)
    startDate.setHours(0, 0, 0, 0)

    const entries = await prisma.bodyWeightEntry.findMany({
      where: {
        traineeId: targetTraineeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    })

    const trainee = await prisma.user.findUnique({
      where: { id: targetTraineeId },
      select: { goalWeight: true },
    })

    return NextResponse.json({
      entries: entries.map((e) => ({
        id: e.id,
        date: e.date.toISOString().split('T')[0],
        weight: e.weight,
      })),
      goalWeight: trainee?.goalWeight ?? undefined,
    })
  } catch (error) {
    console.error('Error fetching body weight:', error)
    return NextResponse.json(
      { error: 'Failed to fetch body weight' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'TRAINEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { weight, date: dateStr } = postSchema.parse(body)

    const now = new Date()
    const date = dateStr
      ? new Date(dateStr + 'T00:00:00.000Z')
      : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))

    const entry = await prisma.$transaction(async (tx) => {
      const upserted = await tx.bodyWeightEntry.upsert({
        where: {
          traineeId_date: {
            traineeId: session.user.id,
            date,
          },
        },
        create: {
          traineeId: session.user.id,
          weight,
          date,
        },
        update: { weight },
      })

      await tx.user.update({
        where: { id: session.user.id },
        data: { weight },
      })

      return upserted
    })

    return NextResponse.json({
      entry: {
        id: entry.id,
        date: entry.date.toISOString().split('T')[0],
        weight: entry.weight,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Error logging body weight:', error)
    return NextResponse.json(
      { error: 'Failed to log body weight' },
      { status: 500 }
    )
  }
}
