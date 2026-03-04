import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const unauth = requireAdmin(session)
    if (unauth) return unauth

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    const skip = (page - 1) * limit

    const [templates, total] = await Promise.all([
      prisma.programTemplate.findMany({
        include: {
          _count: { select: { exercises: true, programs: true } },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.programTemplate.count(),
    ])

    return NextResponse.json({ templates, total, page, limit })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    const unauth = requireAdmin(session)
    if (unauth) return unauth

    const body = await request.json()
    const { id, ...data } = updateSchema.parse(body)

    const template = await prisma.programTemplate.update({
      where: { id },
      data,
    })
    return NextResponse.json({ template })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error updating template:', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
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

    await prisma.programTemplate.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}
