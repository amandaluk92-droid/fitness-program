import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const patchProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  age: z.coerce.number().int().positive().optional(),
  sex: z.string().optional(),
  goals: z.string().optional(),
  weight: z.coerce.number().positive().optional(),
  goalWeight: z.coerce.number().positive().optional(),
})

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId =
      typeof session.user.id === 'string' && session.user.id.trim() !== ''
        ? session.user.id
        : null
    const userEmail =
      typeof session.user.email === 'string' && session.user.email.trim() !== ''
        ? session.user.email
        : null
    if (!userId && !userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'TRAINEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email: userEmail! },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        age: true,
        sex: true,
        goals: true,
        weight: true,
        goalWeight: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId =
      typeof session.user.id === 'string' && session.user.id.trim() !== ''
        ? session.user.id
        : null
    const userEmail =
      typeof session.user.email === 'string' && session.user.email.trim() !== ''
        ? session.user.email
        : null
    if (!userId && !userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'TRAINEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = patchProfileSchema.parse(body)

    const user = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: userId ? { id: userId } : { email: userEmail! },
        select: { id: true },
      })
      if (!existing) throw new Error('User not found')

      if (validatedData.weight !== undefined) {
        const today = new Date()
        today.setUTCHours(0, 0, 0, 0)
        await tx.bodyWeightEntry.upsert({
          where: {
            traineeId_date: {
              traineeId: existing.id,
              date: today,
            },
          },
          create: {
            traineeId: existing.id,
            weight: validatedData.weight,
            date: today,
          },
          update: { weight: validatedData.weight },
        })
      }

      return tx.user.update({
        where: { id: existing.id },
        data: {
          ...(validatedData.name !== undefined && { name: validatedData.name }),
          ...(validatedData.phone !== undefined && { phone: validatedData.phone }),
          ...(validatedData.age !== undefined && { age: validatedData.age }),
          ...(validatedData.sex !== undefined && { sex: validatedData.sex }),
          ...(validatedData.goals !== undefined && { goals: validatedData.goals }),
          ...(validatedData.weight !== undefined && { weight: validatedData.weight }),
          ...(validatedData.goalWeight !== undefined && { goalWeight: validatedData.goalWeight }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          age: true,
          sex: true,
          goals: true,
          weight: true,
          goalWeight: true,
        },
      })
    })

    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
