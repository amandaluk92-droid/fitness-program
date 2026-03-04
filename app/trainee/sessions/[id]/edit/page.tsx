import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { SessionEditForm } from '@/components/trainee/SessionEditForm'

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session || session.user.role !== 'TRAINEE') {
    redirect('/trainee/dashboard')
  }

  const { id } = await params
  const trainingSession = await prisma.trainingSession.findUnique({
    where: { id, traineeId: session.user.id },
    include: {
      exercises: { include: { exercise: true } },
      program: {
        select: { id: true, name: true },
      },
    },
  })

  if (!trainingSession) {
    redirect('/trainee/sessions')
  }

  const t = await getTranslations('trainee.sessions')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('editSession')}</h1>
        <p className="text-gray-600 mt-1">{trainingSession.program.name}</p>
      </div>
      <SessionEditForm session={JSON.parse(JSON.stringify(trainingSession))} />
    </div>
  )
}
