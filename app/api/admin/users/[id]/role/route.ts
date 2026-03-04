import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit-log'
import { z } from 'zod'

const roleSchema = z.object({
  role: z.enum(['ADMIN', 'TRAINER', 'TRAINEE']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const unauth = requireAdmin(session)
    if (unauth) return unauth

    const { id } = await params
    const body = await request.json()
    const { role } = roleSchema.parse(body)

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    })

    logAuditEvent({
      userId: session!.user.id,
      action: 'ADMIN_USER_ROLE_CHANGE',
      resource: 'User',
      resourceId: id,
      metadata: { newRole: role, userName: user.name },
    }).catch(() => {})

    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}
