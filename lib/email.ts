import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Axio <onboarding@resend.dev>'

function emailTemplate(content: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      ${content}
      <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
        You received this email from Axio. To stop receiving notification emails,
        visit your <a href="${process.env.NEXTAUTH_URL}/trainee/settings" style="color: #4f46e5;">notification settings</a>.
      </p>
    </div>
  `
}

export async function canSendNotification(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailNotifications: true },
  })
  return user?.emailNotifications ?? true
}

// ─── Password Reset (existing) ──────────────────────────────────────────────

interface SendPasswordResetEmailParams {
  to: string
  resetUrl: string
  userName: string
}

export async function sendPasswordResetEmail({ to, resetUrl, userName }: SendPasswordResetEmailParams) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your password',
    html: emailTemplate(`
      <h2>Hi ${userName},</h2>
      <p>We received a request to reset your password. Click the button below to set a new one:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">Reset password</a>
      <p style="margin-top: 16px; font-size: 14px; color: #6b7280;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="font-size: 14px; word-break: break-all; color: #4f46e5;">${resetUrl}</p>
      <p style="margin-top: 24px; font-size: 13px; color: #9ca3af;">This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.</p>
    `),
  })
}

// ─── Welcome Email (always sends, no opt-out check) ─────────────────────────

interface SendWelcomeEmailParams {
  to: string
  userName: string
}

export async function sendWelcomeEmail({ to, userName }: SendWelcomeEmailParams) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to Axio!',
    html: emailTemplate(`
      <h2>Welcome, ${userName}!</h2>
      <p>Thanks for joining Axio. You're all set to start your fitness journey.</p>
      <p>Here's what you can do next:</p>
      <ul style="color: #374151; line-height: 1.8;">
        <li>Connect with your trainer or trainees</li>
        <li>Browse program templates</li>
        <li>Start logging sessions</li>
      </ul>
      <a href="${process.env.NEXTAUTH_URL}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">Go to Axio</a>
    `),
  })
}

// ─── Program Assigned Email ─────────────────────────────────────────────────

interface SendProgramAssignedEmailParams {
  to: string
  traineeId: string
  traineeName: string
  trainerName: string
  programName: string
}

export async function sendProgramAssignedEmail({
  to,
  traineeId,
  traineeName,
  trainerName,
  programName,
}: SendProgramAssignedEmailParams) {
  if (!(await canSendNotification(traineeId))) return

  await resend.emails.send({
    from: FROM,
    to,
    subject: `New program assigned: ${programName}`,
    html: emailTemplate(`
      <h2>Hi ${traineeName},</h2>
      <p>Your trainer <strong>${trainerName}</strong> has assigned you a new program:</p>
      <div style="padding: 16px; background-color: #f3f4f6; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; font-weight: 600; font-size: 18px; color: #111827;">${programName}</p>
      </div>
      <a href="${process.env.NEXTAUTH_URL}/trainee/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">View program</a>
    `),
  })
}

// ─── Session Logged Email ───────────────────────────────────────────────────

interface SendSessionLoggedEmailParams {
  to: string
  trainerId: string
  trainerName: string
  traineeName: string
  programName: string
}

export async function sendSessionLoggedEmail({
  to,
  trainerId,
  trainerName,
  traineeName,
  programName,
}: SendSessionLoggedEmailParams) {
  if (!(await canSendNotification(trainerId))) return

  await resend.emails.send({
    from: FROM,
    to,
    subject: `${traineeName} logged a session`,
    html: emailTemplate(`
      <h2>Hi ${trainerName},</h2>
      <p>Your trainee <strong>${traineeName}</strong> just logged a session for:</p>
      <div style="padding: 16px; background-color: #f3f4f6; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; font-weight: 600; font-size: 18px; color: #111827;">${programName}</p>
      </div>
      <a href="${process.env.NEXTAUTH_URL}/trainer/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">View dashboard</a>
    `),
  })
}

// ─── Connection Email ───────────────────────────────────────────────────────

interface SendConnectionEmailParams {
  to: string
  userId: string
  userName: string
  otherName: string
  otherRole: 'trainer' | 'trainee'
}

export async function sendConnectionEmail({
  to,
  userId,
  userName,
  otherName,
  otherRole,
}: SendConnectionEmailParams) {
  if (!(await canSendNotification(userId))) return

  await resend.emails.send({
    from: FROM,
    to,
    subject: `New connection: ${otherName}`,
    html: emailTemplate(`
      <h2>Hi ${userName},</h2>
      <p>You're now connected with <strong>${otherName}</strong> (${otherRole}) on Axio.</p>
      <a href="${process.env.NEXTAUTH_URL}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">Go to Axio</a>
    `),
  })
}
