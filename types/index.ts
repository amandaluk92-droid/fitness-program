import { UserRole } from '@prisma/client'

export type { UserRole }

export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
}
