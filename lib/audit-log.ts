import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'REGISTER'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_COMPLETE'
  | 'ACCOUNT_DELETE'
  | 'DATA_EXPORT'
  | 'SUBSCRIPTION_CREATE'
  | 'SUBSCRIPTION_CANCEL'
  | 'SUBSCRIPTION_CHANGE'
  | 'TRAINEE_CONNECT'
  | 'TRAINEE_DISCONNECT'
  | 'PROGRAM_ASSIGN'
  | 'PROGRAM_CREATE'
  | 'ADMIN_USER_ROLE_CHANGE'
  | 'ADMIN_PASSWORD_RESET'
  | 'ADMIN_TRIAL_EXTEND'
  | 'SETTINGS_UPDATE'

interface AuditLogParams {
  userId?: string | null
  action: AuditAction
  resource?: string
  resourceId?: string
  metadata?: Prisma.InputJsonValue
  ipAddress?: string
}

/**
 * Record an audit log entry for sensitive actions.
 * This is fire-and-forget — errors are logged but don't block the caller.
 */
export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        resource: params.resource ?? null,
        resourceId: params.resourceId ?? null,
        metadata: params.metadata ?? undefined,
        ipAddress: params.ipAddress ?? null,
      },
    })
  } catch (error) {
    // Don't let audit logging failures break the application
    console.error('Failed to write audit log:', error)
  }
}
