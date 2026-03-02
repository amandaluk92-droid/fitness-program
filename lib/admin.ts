import type { Session } from 'next-auth'
import { NextResponse } from 'next/server'

/** Returns 401 response if not admin. Returns null if authorized. */
export function requireAdmin(session: Session | null): NextResponse | null {
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
