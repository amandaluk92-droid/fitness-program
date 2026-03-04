import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/shared/Card'
import { AdminTemplatesTable } from '@/components/admin/AdminTemplatesTable'

export default async function AdminTemplatesPage() {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/trainee/dashboard')
  }

  const templates = await prisma.programTemplate.findMany({
    include: {
      _count: { select: { exercises: true, programs: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
        <p className="text-gray-600 mt-1">Manage program templates</p>
      </div>
      <Card>
        <AdminTemplatesTable templates={JSON.parse(JSON.stringify(templates))} />
      </Card>
    </div>
  )
}
