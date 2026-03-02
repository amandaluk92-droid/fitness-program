import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import { ProgressTracking as TrainerProgressTracking } from '@/components/trainer/TrainerProgressTracking'

async function getTrainee(traineeId: string, trainerId: string) {
  const trainee = await prisma.user.findFirst({
    where: {
      id: traineeId,
      role: 'TRAINEE',
      programAssignments: {
        some: { program: { trainerId } },
      },
    },
    select: { id: true, name: true },
  })
  return trainee
}

export default async function TraineeProgressPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getSession()

  if (!session || session.user.role !== 'TRAINER') {
    redirect('/trainee/dashboard')
  }

  const trainee = await getTrainee(params.id, session.user.id)

  if (!trainee) {
    notFound()
  }

  const t = await getTranslations('trainer.traineeProgress')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('titleSuffix', { name: trainee.name })}</h1>
        <p className="text-gray-600 mt-1">{t('subtitle')}</p>
      </div>

      <TrainerProgressTracking traineeId={params.id} trainerId={session.user.id} />
    </div>
  )
}
