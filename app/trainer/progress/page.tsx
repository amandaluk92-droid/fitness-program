import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TrainerProgressPageContent } from '@/components/trainer/TrainerProgressPageContent'

async function getTraineesForProgress(trainerId: string) {
  return await prisma.user.findMany({
    where: {
      role: 'TRAINEE',
      programAssignments: {
        some: { program: { trainerId } },
      },
    },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

export default async function TrainerProgressPage() {
  const session = await getSession()

  if (!session || session.user.role !== 'TRAINER') {
    redirect('/trainee/dashboard')
  }

  const trainees = await getTraineesForProgress(session.user.id)

  return (
    <div className="space-y-6">
      <TrainerProgressPageContent
        trainees={trainees}
        trainerId={session.user.id}
      />
    </div>
  )
}
