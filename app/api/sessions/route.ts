import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendSessionLoggedEmail } from '@/lib/email'
import { z } from 'zod'

const sessionSchema = z.object({
  programId: z.string().min(1, 'Program is required'),
  date: z.string().optional(),
  notes: z.string().optional(),
  rpe: z.number().int().min(1).max(10).optional(),
  exercises: z.array(
    z.object({
      exerciseId: z.string(),
      sets: z.number().int().positive(),
      reps: z.array(z.number().int().positive()),
      weights: z.array(z.number().nonnegative()),
      notes: z.string().optional(),
    })
  ),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.user.role !== 'TRAINEE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = sessionSchema.parse(body)

    // Verify trainee has this program assigned
    const assignment = await prisma.programAssignment.findFirst({
      where: {
        programId: validatedData.programId,
        traineeId: session.user.id,
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    // Create session with exercises
    const trainingSession = await prisma.trainingSession.create({
      data: {
        programId: validatedData.programId,
        traineeId: session.user.id,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        notes: validatedData.notes,
        rpe: validatedData.rpe,
        exercises: {
          create: validatedData.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weights: ex.weights,
            notes: ex.notes,
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
            trainer: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    })

    if (trainingSession.program.trainer) {
      const { trainer } = trainingSession.program
      sendSessionLoggedEmail({
        to: trainer.email,
        trainerId: trainer.id,
        trainerName: trainer.name,
        traineeName: session.user.name ?? 'A trainee',
        programName: trainingSession.program.name,
      }).catch(() => {})
    }

    return NextResponse.json({ session: trainingSession }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')
    const traineeId = searchParams.get('traineeId')

    const where: any = {}

    if (session.user.role === 'TRAINEE') {
      where.traineeId = session.user.id
      if (programId) {
        where.programId = programId
      }
    } else if (session.user.role === 'TRAINER') {
      if (!traineeId) {
        return NextResponse.json({ error: 'Trainee ID required' }, { status: 400 })
      }
      where.traineeId = traineeId
      where.program = {
        trainerId: session.user.id,
      }
      if (programId) {
        where.programId = programId
      }
    }

    const sessions = await prisma.trainingSession.findMany({
      where,
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}
