import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { logAuditEvent } from '@/lib/audit-log'

// 1 export per 24 hours
const EXPORT_RATE_LIMIT = { maxAttempts: 1, windowSeconds: 24 * 60 * 60 }

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = getClientIp(request.headers)
    const rateLimit = checkRateLimit(`export:${session.user.id}`, EXPORT_RATE_LIMIT)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'You can only request a data export once per 24 hours.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      )
    }

    const userId = session.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        role: true,
        phone: true,
        age: true,
        sex: true,
        goals: true,
        weight: true,
        goalWeight: true,
        newsletterOptIn: true,
        termsAcceptedAt: true,
        createdAt: true,
      },
    })

    const sessions = await prisma.trainingSession.findMany({
      where: { traineeId: userId },
      include: {
        exercises: {
          include: { exercise: { select: { name: true } } },
        },
        program: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    })

    const bodyWeight = await prisma.bodyWeightEntry.findMany({
      where: { traineeId: userId },
      select: { weight: true, date: true },
      orderBy: { date: 'desc' },
    })

    const programAssignments = await prisma.programAssignment.findMany({
      where: { traineeId: userId },
      include: {
        program: {
          select: { name: true, description: true, duration: true },
        },
      },
    })

    const connections = await prisma.trainerTraineeConnection.findMany({
      where: {
        OR: [{ traineeId: userId }, { trainerId: userId }],
      },
      include: {
        trainer: { select: { name: true, email: true } },
        trainee: { select: { name: true, email: true } },
      },
    })

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: user,
      trainingSessions: sessions.map((s) => ({
        date: s.date,
        program: s.program.name,
        notes: s.notes,
        rpe: s.rpe,
        exercises: s.exercises.map((e) => ({
          name: e.exercise.name,
          sets: e.sets,
          reps: e.reps,
          weights: e.weights,
          notes: e.notes,
        })),
      })),
      bodyWeight: bodyWeight.map((b) => ({
        date: b.date,
        weight: b.weight,
      })),
      programs: programAssignments.map((pa) => ({
        name: pa.program.name,
        description: pa.program.description,
        duration: pa.program.duration,
        assignedAt: pa.createdAt,
      })),
      connections: connections.map((c) => ({
        trainer: c.trainer.name,
        trainee: c.trainee.name,
        connectedAt: c.createdAt,
      })),
    }

    await logAuditEvent({
      userId,
      action: 'DATA_EXPORT',
      resource: 'User',
      resourceId: userId,
      ipAddress: ip,
    })

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="axio-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    })
  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}
