import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canTrainerAddTrainee } from '@/lib/trainer-limits'
import { z } from 'zod'

const programSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  description: z.string().optional(),
  duration: z.number().int().positive().optional(),
  traineeId: z.string().min(1, 'Trainee is required'),
  exercises: z.array(
    z.object({
      exerciseId: z.string(),
      sets: z.number().int().positive(),
      reps: z.number().int().positive(),
      weight: z.number().optional(),
      restTimeSeconds: z.number().int().positive().optional(),
      order: z.number().int().default(0),
      dayOfWeek: z.number().int().min(0).max(6).optional(),
    })
  ),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = programSchema.parse(body)

    // Verify trainee exists and is a trainee
    const trainee = await prisma.user.findUnique({
      where: { id: validatedData.traineeId },
    })

    if (!trainee || trainee.role !== 'TRAINEE') {
      return NextResponse.json({ error: 'Invalid trainee' }, { status: 400 })
    }

    // Check trainee limit
    const { allowed } = await canTrainerAddTrainee(
      session.user.id,
      validatedData.traineeId
    )
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            'Trainee limit reached. Upgrade your plan to add more trainees.',
        },
        { status: 403 }
      )
    }

    // Create program (no traineeId) then assign to trainee
    const program = await prisma.trainingProgram.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        duration: validatedData.duration,
        trainerId: session.user.id,
        exercises: {
          create: validatedData.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            restTimeSeconds: ex.restTimeSeconds,
            order: ex.order,
            dayOfWeek: ex.dayOfWeek,
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    })

    await prisma.programAssignment.create({
      data: {
        programId: program.id,
        traineeId: validatedData.traineeId,
      },
    })

    return NextResponse.json({ program }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating program:', error)
    return NextResponse.json(
      { error: 'Failed to create program' },
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
    const traineeIdParam = searchParams.get('traineeId')

    if (session.user.role === 'TRAINER') {
      const where: any = { trainerId: session.user.id }
      if (traineeIdParam) {
        where.assignments = { some: { traineeId: traineeIdParam } }
      }
      const programs = await prisma.trainingProgram.findMany({
        where,
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: 'asc' },
          },
          assignments: {
            include: {
              trainee: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          trainer: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ programs })
    }

    if (session.user.role === 'TRAINEE') {
      const programs = await prisma.trainingProgram.findMany({
        where: {
          assignments: {
            some: { traineeId: session.user.id },
          },
        },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: 'asc' },
          },
          trainer: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ programs })
    }

    return NextResponse.json({ programs: [] })
  } catch (error) {
    console.error('Error fetching programs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    )
  }
}



