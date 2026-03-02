import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  description: z.string().optional(),
  muscleGroup: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = exerciseSchema.parse(body)

    const exercise = await prisma.exercise.create({
      data: validatedData,
    })

    return NextResponse.json({ exercise }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating exercise:', error)
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ exercises })
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    )
  }
}
