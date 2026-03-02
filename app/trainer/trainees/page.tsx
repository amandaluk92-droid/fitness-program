import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { TraineeList } from '@/components/trainer/TraineeList'
import { ConnectTraineeForm } from '@/components/trainer/ConnectTraineeForm'
import { Card } from '@/components/shared/Card'
import { User } from 'lucide-react'

async function getConnectedTrainees(trainerId: string) {
  return await prisma.user.findMany({
    where: {
      role: 'TRAINEE',
      connectionsAsTrainee: {
        some: { trainerId },
      },
    },
    include: {
      programAssignments: {
        where: { program: { trainerId } },
        include: {
          program: {
            include: {
              sessions: {
                take: 1,
                orderBy: { date: 'desc' },
              },
            },
          },
        },
      },
      trainingSessions: {
        where: { program: { trainerId } },
        take: 5,
        orderBy: { date: 'desc' },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export default async function TraineesPage() {
  const session = await getSession()

  if (!session || session.user.role !== 'TRAINER') {
    redirect('/trainee/dashboard')
  }

  const trainees = await getConnectedTrainees(session.user.id)
  const t = await getTranslations('trainer.trainees')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('subtitle')}</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-primary-500" />
          <div>
            <p className="font-medium text-gray-900">{t('totalTrainees')}</p>
            <p className="text-2xl font-bold text-primary-600">{trainees.length}</p>
          </div>
        </div>
      </Card>

      <Card title={t('connectCardTitle')}>
        <p className="text-sm text-gray-600 mb-4">
          {t('connectCardDesc')}
        </p>
        <ConnectTraineeForm />
      </Card>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('myTrainees')}</h2>
        <TraineeList trainees={trainees as any} />
      </div>
    </div>
  )
}
