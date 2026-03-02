import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all trainees (not just those with assigned programs)
    const trainees = await prisma.user.findMany({
      where: {
        role: 'TRAINEE',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ trainees })
  } catch (error) {
    console.error('Error fetching all trainees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trainees' },
      { status: 500 }
    )
  }
}
