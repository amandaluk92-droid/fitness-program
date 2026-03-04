import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  description: z.string().optional(),
  muscleGroup: z.string().optional(),
  imageUrl: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'TRAINER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.exercise.count(),
    ])

    return NextResponse.json({
      exercises,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    )
  }
}
