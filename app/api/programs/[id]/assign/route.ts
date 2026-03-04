import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canTrainerAddTrainee } from '@/lib/trainer-limits'
import { sendProgramAssignedEmail } from '@/lib/email'
import { z } from 'zod'

const assignSchema = z.object({
  traineeId: z.string().min(1, 'Trainee is required'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || session.user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: programId } = await params
    const body = await request.json()
    const { traineeId } = assignSchema.parse(body)

    const program = await prisma.trainingProgram.findFirst({
      where: {
        id: programId,
        trainerId: session.user.id,
      },
    })

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    const trainee = await prisma.user.findUnique({
      where: { id: traineeId },
    })
    if (!trainee || trainee.role !== 'TRAINEE') {
      return NextResponse.json({ error: 'Invalid trainee' }, { status: 400 })
    }

    const existing = await prisma.programAssignment.findUnique({
      where: {
        programId_traineeId: { programId, traineeId },
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Program already assigned to this trainee' },
        { status: 400 }
      )
    }

    const { allowed } = await canTrainerAddTrainee(session.user.id, traineeId)
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            'Trainee limit reached. Upgrade your plan to add more trainees.',
        },
        { status: 403 }
      )
    }

    await prisma.programAssignment.create({
      data: { programId, traineeId },
    })

    sendProgramAssignedEmail({
      to: trainee.email,
      traineeId: trainee.id,
      traineeName: trainee.name,
      trainerName: session.user.name ?? 'Your trainer',
      programName: program.name,
    }).catch(() => {})

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Error assigning program:', error)
    return NextResponse.json(
      { error: 'Failed to assign program' },
      { status: 500 }
    )
  }
}
