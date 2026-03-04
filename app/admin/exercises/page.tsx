import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/shared/Card'
import { AdminExercisesTable } from '@/components/admin/AdminExercisesTable'

export default async function AdminExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/trainee/dashboard')
  }

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1'))
  const limit = 50
  const search = params.search || ''

  const where = search
    ? { name: { contains: search, mode: 'insensitive' as const } }
    : {}

  const [exercises, total] = await Promise.all([
    prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        muscleGroup: true,
        createdAt: true,
        _count: { select: { sessionExercises: true, programExercises: true } },
      },
    }),
    prisma.exercise.count({ where }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Exercises</h1>
        <p className="text-gray-600 mt-1">Manage the exercise library</p>
      </div>
      <Card>
        <AdminExercisesTable
          exercises={JSON.parse(JSON.stringify(exercises))}
          total={total}
          page={page}
          limit={limit}
          search={search}
        />
      </Card>
    </div>
  )
}
