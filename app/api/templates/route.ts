import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { TemplateCategory } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryParam = searchParams.get('category') // GBC | REHAB
    const injuryType = searchParams.get('injuryType')

    const where = {
      isActive: true,
      ...(categoryParam === 'GBC' || categoryParam === 'REHAB' || categoryParam === 'POWERLIFTING'
        ? { category: categoryParam as TemplateCategory }
        : {}),
      ...(injuryType ? { injuryType } : {}),
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    const [templates, total] = await Promise.all([
      prisma.programTemplate.findMany({
        where,
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: [{ workoutDayIndex: 'asc' }, { order: 'asc' }],
          },
        },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.programTemplate.count({ where }),
    ])

    return NextResponse.json({ templates, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}
