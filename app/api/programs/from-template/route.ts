import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canTrainerAddTrainee } from '@/lib/trainer-limits'
import { z } from 'zod'

const exerciseModSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.number().optional(),
  restTimeSeconds: z.number().int().positive().optional(),
  order: z.number().int().default(0),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  workoutDayIndex: z.number().int().min(1).max(7).optional(),
  tempo: z.string().optional(),
  supersetGroup: z.string().optional(),
})

const fromTemplateSchema = z.object({
  templateId: z.string().min(1, 'Template is required'),
  name: z.string().optional(),
  description: z.string().optional(),
  duration: z.number().int().positive().optional(),
  traineeId: z.string().optional(),
  exercises: z.array(exerciseModSchema).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = fromTemplateSchema.parse(body)

    const template = await prisma.programTemplate.findFirst({
      where: { id: validatedData.templateId, isActive: true },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: [{ workoutDayIndex: 'asc' }, { order: 'asc' }],
        },
      },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (validatedData.traineeId) {
      const trainee = await prisma.user.findUnique({
        where: { id: validatedData.traineeId },
      })
      if (!trainee || trainee.role !== 'TRAINEE') {
        return NextResponse.json({ error: 'Invalid trainee' }, { status: 400 })
      }

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
    }

    const exercisesToCreate = validatedData.exercises ?? template.exercises.map(
      (ex, idx) => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight ?? undefined,
        restTimeSeconds: ex.restTimeSeconds ?? undefined,
        order: ex.order ?? idx,
        dayOfWeek: ex.dayOfWeek ?? undefined,
        workoutDayIndex: ex.workoutDayIndex ?? undefined,
        tempo: (ex as any).tempo ?? undefined,
        supersetGroup: (ex as any).supersetGroup ?? undefined,
      })
    )

    const program = await prisma.trainingProgram.create({
      data: {
        name: validatedData.name ?? template.name,
        description: validatedData.description ?? template.description ?? undefined,
        duration: validatedData.duration ?? template.duration ?? undefined,
        trainerId: session.user.id,
        sourceTemplateId: template.id,
        exercises: {
          create: exercisesToCreate.map((ex) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            restTimeSeconds: ex.restTimeSeconds,
            order: ex.order,
            dayOfWeek: ex.dayOfWeek,
            workoutDayIndex: ex.workoutDayIndex,
            tempo: ex.tempo,
            supersetGroup: ex.supersetGroup,
          })),
        },
      },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: [{ workoutDayIndex: 'asc' }, { order: 'asc' }],
        },
      },
    })

    if (validatedData.traineeId) {
      await prisma.programAssignment.create({
        data: {
          programId: program.id,
          traineeId: validatedData.traineeId,
        },
      })
    }

    return NextResponse.json({ program }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating program from template:', error)
    return NextResponse.json(
      { error: 'Failed to create program from template' },
      { status: 500 }
    )
  }
}
