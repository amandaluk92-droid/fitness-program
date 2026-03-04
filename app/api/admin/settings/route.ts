import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit-log'
import { z } from 'zod'

function maskSecret(value: string | null): string {
  if (!value || value.length < 12) return value ? '••••••••' : ''
  const prefix = value.startsWith('sk_live_') ? 'sk_live_' : value.startsWith('sk_test_') ? 'sk_test_' : value.slice(0, 8)
  return `${prefix}••••••••`
}

function maskWebhookSecret(value: string | null): string {
  if (!value || value.length < 12) return value ? '••••••••' : ''
  return `whsec_••••••••`
}

export async function GET() {
  const session = await getSession()
  const unauth = requireAdmin(session)
  if (unauth) return unauth

  try {
    const row = await prisma.stripeConfig.findFirst({
      orderBy: { updatedAt: 'desc' },
    })
    if (!row) {
      return NextResponse.json({
        stripeSecretKeyMasked: '',
        stripeWebhookSecretMasked: '',
        stripePriceIdStarter: null,
        stripePriceIdGrowth: null,
        stripePriceIdStudio: null,
        stripePriceIdPro: null,
        stripePriceIdStarter6mo: null,
        stripePriceIdStarter12mo: null,
        stripePriceIdGrowth6mo: null,
        stripePriceIdGrowth12mo: null,
        stripePriceIdStudio6mo: null,
        stripePriceIdStudio12mo: null,
        stripePriceIdPro6mo: null,
        stripePriceIdPro12mo: null,
        stripePublishableKey: null,
      })
    }
    return NextResponse.json({
      stripeSecretKeyMasked: maskSecret(row.stripeSecretKey),
      stripeWebhookSecretMasked: maskWebhookSecret(row.stripeWebhookSecret),
      stripePriceIdStarter: row.stripePriceIdStarter,
      stripePriceIdGrowth: row.stripePriceIdGrowth,
      stripePriceIdStudio: row.stripePriceIdStudio,
      stripePriceIdPro: row.stripePriceIdPro,
      stripePriceIdStarter6mo: row.stripePriceIdStarter6mo,
      stripePriceIdStarter12mo: row.stripePriceIdStarter12mo,
      stripePriceIdGrowth6mo: row.stripePriceIdGrowth6mo,
      stripePriceIdGrowth12mo: row.stripePriceIdGrowth12mo,
      stripePriceIdStudio6mo: row.stripePriceIdStudio6mo,
      stripePriceIdStudio12mo: row.stripePriceIdStudio12mo,
      stripePriceIdPro6mo: row.stripePriceIdPro6mo,
      stripePriceIdPro12mo: row.stripePriceIdPro12mo,
      stripePublishableKey: row.stripePublishableKey,
    })
  } catch (error) {
    console.error('Admin settings GET error:', error)
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    )
  }
}

const patchSchema = z.object({
  stripeSecretKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
  stripePriceIdStarter: z.string().optional(),
  stripePriceIdGrowth: z.string().optional(),
  stripePriceIdStudio: z.string().optional(),
  stripePriceIdPro: z.string().optional(),
  stripePriceIdStarter6mo: z.string().optional(),
  stripePriceIdStarter12mo: z.string().optional(),
  stripePriceIdGrowth6mo: z.string().optional(),
  stripePriceIdGrowth12mo: z.string().optional(),
  stripePriceIdStudio6mo: z.string().optional(),
  stripePriceIdStudio12mo: z.string().optional(),
  stripePriceIdPro6mo: z.string().optional(),
  stripePriceIdPro12mo: z.string().optional(),
  stripePublishableKey: z.string().optional(),
})

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  const unauth = requireAdmin(session)
  if (unauth) return unauth

  try {
    const body = await request.json()
    const data = patchSchema.parse(body)

    const existing = await prisma.stripeConfig.findFirst({
      orderBy: { updatedAt: 'desc' },
    })

    const updatePayload: {
      stripeSecretKey?: string | null
      stripeWebhookSecret?: string | null
      stripePriceIdStarter?: string | null
      stripePriceIdGrowth?: string | null
      stripePriceIdStudio?: string | null
      stripePriceIdPro?: string | null
      stripePriceIdStarter6mo?: string | null
      stripePriceIdStarter12mo?: string | null
      stripePriceIdGrowth6mo?: string | null
      stripePriceIdGrowth12mo?: string | null
      stripePriceIdStudio6mo?: string | null
      stripePriceIdStudio12mo?: string | null
      stripePriceIdPro6mo?: string | null
      stripePriceIdPro12mo?: string | null
      stripePublishableKey?: string | null
    } = {}
    if (data.stripeSecretKey !== undefined) updatePayload.stripeSecretKey = data.stripeSecretKey || null
    if (data.stripeWebhookSecret !== undefined) updatePayload.stripeWebhookSecret = data.stripeWebhookSecret || null
    if (data.stripePriceIdStarter !== undefined) updatePayload.stripePriceIdStarter = data.stripePriceIdStarter || null
    if (data.stripePriceIdGrowth !== undefined) updatePayload.stripePriceIdGrowth = data.stripePriceIdGrowth || null
    if (data.stripePriceIdStudio !== undefined) updatePayload.stripePriceIdStudio = data.stripePriceIdStudio || null
    if (data.stripePriceIdPro !== undefined) updatePayload.stripePriceIdPro = data.stripePriceIdPro || null
    if (data.stripePriceIdStarter6mo !== undefined) updatePayload.stripePriceIdStarter6mo = data.stripePriceIdStarter6mo || null
    if (data.stripePriceIdStarter12mo !== undefined) updatePayload.stripePriceIdStarter12mo = data.stripePriceIdStarter12mo || null
    if (data.stripePriceIdGrowth6mo !== undefined) updatePayload.stripePriceIdGrowth6mo = data.stripePriceIdGrowth6mo || null
    if (data.stripePriceIdGrowth12mo !== undefined) updatePayload.stripePriceIdGrowth12mo = data.stripePriceIdGrowth12mo || null
    if (data.stripePriceIdStudio6mo !== undefined) updatePayload.stripePriceIdStudio6mo = data.stripePriceIdStudio6mo || null
    if (data.stripePriceIdStudio12mo !== undefined) updatePayload.stripePriceIdStudio12mo = data.stripePriceIdStudio12mo || null
    if (data.stripePriceIdPro6mo !== undefined) updatePayload.stripePriceIdPro6mo = data.stripePriceIdPro6mo || null
    if (data.stripePriceIdPro12mo !== undefined) updatePayload.stripePriceIdPro12mo = data.stripePriceIdPro12mo || null
    if (data.stripePublishableKey !== undefined) updatePayload.stripePublishableKey = data.stripePublishableKey || null

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    if (existing) {
      await prisma.stripeConfig.update({
        where: { id: existing.id },
        data: updatePayload,
      })
    } else {
      await prisma.stripeConfig.create({
        data: {
          stripeSecretKey: updatePayload.stripeSecretKey ?? null,
          stripeWebhookSecret: updatePayload.stripeWebhookSecret ?? null,
          stripePriceIdStarter: updatePayload.stripePriceIdStarter ?? null,
          stripePriceIdGrowth: updatePayload.stripePriceIdGrowth ?? null,
          stripePriceIdStudio: updatePayload.stripePriceIdStudio ?? null,
          stripePriceIdPro: updatePayload.stripePriceIdPro ?? null,
          stripePriceIdStarter6mo: updatePayload.stripePriceIdStarter6mo ?? null,
          stripePriceIdStarter12mo: updatePayload.stripePriceIdStarter12mo ?? null,
          stripePriceIdGrowth6mo: updatePayload.stripePriceIdGrowth6mo ?? null,
          stripePriceIdGrowth12mo: updatePayload.stripePriceIdGrowth12mo ?? null,
          stripePriceIdStudio6mo: updatePayload.stripePriceIdStudio6mo ?? null,
          stripePriceIdStudio12mo: updatePayload.stripePriceIdStudio12mo ?? null,
          stripePriceIdPro6mo: updatePayload.stripePriceIdPro6mo ?? null,
          stripePriceIdPro12mo: updatePayload.stripePriceIdPro12mo ?? null,
          stripePublishableKey: updatePayload.stripePublishableKey ?? null,
        },
      })
    }

    logAuditEvent({
      userId: session!.user.id,
      action: 'SETTINGS_UPDATE',
      resource: 'StripeConfig',
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Admin settings PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
