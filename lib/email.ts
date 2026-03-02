import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendPasswordResetEmailParams {
  to: string
  resetUrl: string
  userName: string
}

export async function sendPasswordResetEmail({ to, resetUrl, userName }: SendPasswordResetEmailParams) {
  await resend.emails.send({
    from: 'Axio <onboarding@resend.dev>',
    to,
    subject: 'Reset your password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Hi ${userName},</h2>
        <p>We received a request to reset your password. Click the button below to set a new one:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">Reset password</a>
        <p style="margin-top: 16px; font-size: 14px; color: #6b7280;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="font-size: 14px; word-break: break-all; color: #4f46e5;">${resetUrl}</p>
        <p style="margin-top: 24px; font-size: 13px; color: #9ca3af;">This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.</p>
      </div>
    `,
  })
}
