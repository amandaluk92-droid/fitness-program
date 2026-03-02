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
      ...(categoryParam === 'GBC' || categoryParam === 'REHAB'
        ? { category: categoryParam as TemplateCategory }
        : {}),
      ...(injuryType ? { injuryType } : {}),
    }

    const templates = await prisma.programTemplate.findMany({
      where,
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: [{ workoutDayIndex: 'asc' }, { order: 'asc' }],
        },
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}
