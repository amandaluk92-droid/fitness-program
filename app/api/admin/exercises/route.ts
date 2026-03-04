import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  muscleGroup: z.string().optional(),
})

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  muscleGroup: z.string().optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const unauth = requireAdmin(session)
    if (unauth) return unauth

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    const skip = (page - 1) * limit

    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {}

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.exercise.count({ where }),
    ])

    return NextResponse.json({ exercises, total, page, limit })
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const unauth = requireAdmin(session)
    if (unauth) return unauth

    const body = await request.json()
    const data = createSchema.parse(body)

    const exercise = await prisma.exercise.create({ data })
    return NextResponse.json({ exercise }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error creating exercise:', error)
    return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    const unauth = requireAdmin(session)
    if (unauth) return unauth

    const body = await request.json()
    const { id, ...data } = updateSchema.parse(body)

    const exercise = await prisma.exercise.update({
      where: { id },
      data,
    })
    return NextResponse.json({ exercise })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error updating exercise:', error)
    return NextResponse.json({ error: 'Failed to update exercise' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    const unauth = requireAdmin(session)
    if (unauth) return unauth

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await prisma.exercise.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting exercise:', error)
    return NextResponse.json({ error: 'Failed to delete exercise' }, { status: 500 })
  }
}
