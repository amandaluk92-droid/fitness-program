import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendConnectionEmail } from '@/lib/email'
import { z } from 'zod'

const connectSchema = z.object({
  email: z.string().email('Invalid email'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || (session.user.role !== 'TRAINER' && session.user.role !== 'TRAINEE')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email } = connectSchema.parse(body)

    const otherUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    if (!otherUser) {
      return NextResponse.json(
        { error: 'User not found with this email' },
        { status: 400 }
      )
    }

    if (session.user.role === 'TRAINER') {
      if (otherUser.role !== 'TRAINEE') {
        return NextResponse.json(
          { error: 'User is not a trainee. Only trainees can be connected.' },
          { status: 400 }
        )
      }
      const trainerId = session.user.id
      const traineeId = otherUser.id
      const existing = await prisma.trainerTraineeConnection.findUnique({
        where: {
          trainerId_traineeId: { trainerId, traineeId },
        },
      })
      if (existing) {
        return NextResponse.json(
          { message: 'Already connected', connection: existing },
          { status: 200 }
        )
      }
      const connection = await prisma.trainerTraineeConnection.create({
        data: { trainerId, traineeId },
      })

      sendConnectionEmail({
        to: otherUser.email,
        userId: otherUser.id,
        userName: otherUser.name,
        otherName: session.user.name ?? 'A trainer',
        otherRole: 'trainer',
      }).catch(() => {})
      sendConnectionEmail({
        to: session.user.email!,
        userId: session.user.id,
        userName: session.user.name ?? 'Trainer',
        otherName: otherUser.name,
        otherRole: 'trainee',
      }).catch(() => {})

      return NextResponse.json({ message: 'Connected', connection }, { status: 201 })
    }

    if (session.user.role === 'TRAINEE') {
      if (otherUser.role !== 'TRAINER') {
        return NextResponse.json(
          { error: 'User is not a trainer. Only trainers can be connected.' },
          { status: 400 }
        )
      }
      const trainerId = otherUser.id
      const traineeId = session.user.id
      const existing = await prisma.trainerTraineeConnection.findUnique({
        where: {
          trainerId_traineeId: { trainerId, traineeId },
        },
      })
      if (existing) {
        return NextResponse.json(
          { message: 'Already connected', connection: existing },
          { status: 200 }
        )
      }
      const connection = await prisma.trainerTraineeConnection.create({
        data: { trainerId, traineeId },
      })

      sendConnectionEmail({
        to: otherUser.email,
        userId: otherUser.id,
        userName: otherUser.name,
        otherName: session.user.name ?? 'A trainee',
        otherRole: 'trainee',
      }).catch(() => {})
      sendConnectionEmail({
        to: session.user.email!,
        userId: session.user.id,
        userName: session.user.name ?? 'Trainee',
        otherName: otherUser.name,
        otherRole: 'trainer',
      }).catch(() => {})

      return NextResponse.json({ message: 'Connected', connection }, { status: 201 })
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Error creating connection:', error)
    return NextResponse.json(
      { error: 'Failed to create connection' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.user.role !== 'TRAINER' && session.user.role !== 'TRAINEE')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const email = body.email as string | undefined
    const connectionId = body.connectionId as string | undefined

    if (!email && !connectionId) {
      return NextResponse.json({ error: 'Email or connectionId required' }, { status: 400 })
    }

    let connection
    if (connectionId) {
      connection = await prisma.trainerTraineeConnection.findUnique({
        where: { id: connectionId },
      })
    } else if (email) {
      const otherUser = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      })
      if (!otherUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      const trainerId = session.user.role === 'TRAINER' ? session.user.id : otherUser.id
      const traineeId = session.user.role === 'TRAINEE' ? session.user.id : otherUser.id
      connection = await prisma.trainerTraineeConnection.findUnique({
        where: { trainerId_traineeId: { trainerId, traineeId } },
      })
    }

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    // Verify requesting user is part of this connection
    if (connection.trainerId !== session.user.id && connection.traineeId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.trainerTraineeConnection.delete({ where: { id: connection.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting connection:', error)
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getSession()

    if (!session || (session.user.role !== 'TRAINER' && session.user.role !== 'TRAINEE')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role === 'TRAINER') {
      const connections = await prisma.trainerTraineeConnection.findMany({
        where: { trainerId: session.user.id },
        include: {
          trainee: {
            select: { id: true, name: true, email: true },
          },
        },
      })
      return NextResponse.json({
        users: connections.map((c) => c.trainee),
      })
    }

    if (session.user.role === 'TRAINEE') {
      const connections = await prisma.trainerTraineeConnection.findMany({
        where: { traineeId: session.user.id },
        include: {
          trainer: {
            select: { id: true, name: true, email: true },
          },
        },
      })
      return NextResponse.json({
        users: connections.map((c) => c.trainer),
      })
    }

    return NextResponse.json({ users: [] })
  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    )
  }
}
