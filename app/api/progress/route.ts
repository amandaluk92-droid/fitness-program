import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const traineeId = searchParams.get('traineeId')
    const programId = searchParams.get('programId')
    const exerciseId = searchParams.get('exerciseId')
    const weeks = parseInt(searchParams.get('weeks') || '8')

    let targetTraineeId = session.user.id

    // If trainer, require traineeId
    if (session.user.role === 'TRAINER') {
      if (!traineeId) {
        return NextResponse.json({ error: 'Trainee ID required' }, { status: 400 })
      }
      targetTraineeId = traineeId

      // Verify trainer has access to this trainee (via program assignment)
      const assignment = await prisma.programAssignment.findFirst({
        where: {
          traineeId: targetTraineeId,
          program: { trainerId: session.user.id },
        },
      })

      if (!assignment) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - weeks * 7)

    // Get sessions
    const where: any = {
      traineeId: targetTraineeId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    }

    if (programId) {
      where.programId = programId
    }

    const sessions = await prisma.trainingSession.findMany({
      where,
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Group by week
    const weeklyData: Record<string, any> = {}

    sessions.forEach((session) => {
      const weekStart = new Date(session.date)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)
      const weekKey = weekStart.toISOString().split('T')[0]

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          sessions: [],
          exercises: {},
        }
      }

      weeklyData[weekKey].sessions.push(session)

      session.exercises.forEach((ex) => {
        if (exerciseId && ex.exerciseId !== exerciseId) return

        if (!weeklyData[weekKey].exercises[ex.exerciseId]) {
          weeklyData[weekKey].exercises[ex.exerciseId] = {
            exerciseId: ex.exerciseId,
            exerciseName: ex.exercise.name,
            totalVolume: 0,
            maxWeight: 0,
            totalReps: 0,
            sessions: 0,
          }
        }

        const exerciseData = weeklyData[weekKey].exercises[ex.exerciseId]
        exerciseData.sessions += 1

        ex.reps.forEach((rep, index) => {
          const weight = ex.weights[index] || 0
          exerciseData.totalVolume += rep * weight
          exerciseData.totalReps += rep
          exerciseData.maxWeight = Math.max(exerciseData.maxWeight, weight)
        })
      })
    })

    // Convert to array and format for charts
    const weeklyArray = Object.values(weeklyData).map((week: any) => ({
      week: week.week,
      sessionCount: week.sessions.length,
      exercises: Object.values(week.exercises),
    }))

    // Personal records (all-time max weight per exercise)
    const allSessions = await prisma.trainingSession.findMany({
      where: { traineeId: targetTraineeId },
      include: {
        exercises: {
          include: { exercise: { select: { id: true, name: true } } },
        },
      },
    })

    const personalRecords: Record<string, { exerciseId: string; exerciseName: string; maxWeight: number; date: Date }> = {}
    allSessions.forEach((s) => {
      s.exercises.forEach((ex) => {
        const maxW = Math.max(...ex.weights, 0)
        if (!personalRecords[ex.exerciseId] || maxW > personalRecords[ex.exerciseId].maxWeight) {
          personalRecords[ex.exerciseId] = {
            exerciseId: ex.exerciseId,
            exerciseName: ex.exercise.name,
            maxWeight: maxW,
            date: s.date,
          }
        }
      })
    })

    // Adherence rate
    const totalSessionsInRange = sessions.length
    const expectedSessions = weeks // Assume ~1 session per week as baseline
    const adherenceRate = expectedSessions > 0 ? Math.min(100, Math.round((totalSessionsInRange / expectedSessions) * 100)) : 0

    return NextResponse.json({
      weeklyData: weeklyArray,
      sessions,
      personalRecords: Object.values(personalRecords),
      adherenceRate,
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}
