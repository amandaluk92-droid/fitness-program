import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  notes: z.string().optional(),
  rpe: z.number().int().min(1).max(10).optional().nullable(),
  exercises: z.array(
    z.object({
      exerciseId: z.string(),
      sets: z.number().int().positive(),
      reps: z.array(z.number().int().nonnegative()),
      weights: z.array(z.number().nonnegative()),
      notes: z.string().optional(),
    })
  ).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const trainingSession = await prisma.trainingSession.findUnique({
      where: { id },
      include: {
        exercises: { include: { exercise: true } },
        program: { select: { id: true, name: true } },
      },
    })

    if (!trainingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.user.role === 'TRAINEE' && trainingSession.traineeId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ session: trainingSession })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'TRAINEE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.trainingSession.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    if (existing.traineeId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const data = updateSchema.parse(body)

    const updated = await prisma.$transaction(async (tx) => {
      await tx.trainingSession.update({
        where: { id },
        data: {
          notes: data.notes !== undefined ? data.notes : undefined,
          rpe: data.rpe !== undefined ? data.rpe : undefined,
        },
      })

      if (data.exercises) {
        await tx.sessionExercise.deleteMany({ where: { sessionId: id } })
        if (data.exercises.length > 0) {
          await tx.sessionExercise.createMany({
            data: data.exercises.map((ex) => ({
              sessionId: id,
              exerciseId: ex.exerciseId,
              sets: ex.sets,
              reps: ex.reps,
              weights: ex.weights,
              notes: ex.notes,
            })),
          })
        }
      }

      return tx.trainingSession.findUnique({
        where: { id },
        include: {
          exercises: { include: { exercise: true } },
          program: { select: { id: true, name: true } },
        },
      })
    })

    return NextResponse.json({ session: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error updating session:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'TRAINEE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.trainingSession.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    if (existing.traineeId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.trainingSession.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
  }
}
