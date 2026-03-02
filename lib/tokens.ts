import crypto from 'crypto'
import { prisma } from './prisma'

export async function generatePasswordResetToken(userId: string): Promise<string> {
  // Delete any existing tokens for this user
  await prisma.passwordResetToken.deleteMany({ where: { userId } })

  // Generate a 32-byte random token
  const rawToken = crypto.randomBytes(32).toString('hex')

  // Store SHA-256 hash in DB (never store raw token)
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

  await prisma.passwordResetToken.create({
    data: {
      token: hashedToken,
      userId,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  })

  return rawToken
}

export async function validatePasswordResetToken(rawToken: string): Promise<string | null> {
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

  const record = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
  })

  if (!record) return null

  // Delete token (single-use)
  await prisma.passwordResetToken.delete({ where: { id: record.id } })

  // Check expiry
  if (record.expiresAt < new Date()) return null

  return record.userId
}
