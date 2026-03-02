import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'
import { ProgramForm } from '@/components/trainer/ProgramForm'
import { Card } from '@/components/shared/Card'

export default async function NewProgramPage({
  searchParams,
}: {
  searchParams: Promise<{ templateId?: string }>
}) {
  const session = await getSession()

  if (!session || session.user.role !== 'TRAINER') {
    redirect('/trainee/dashboard')
  }

  const params = await searchParams
  const templateId = params?.templateId ?? undefined
  const t = await getTranslations('trainer.programNew')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {templateId ? t('fromTemplate') : t('createNew')}
        </h1>
        <p className="text-gray-600 mt-1">
          {templateId ? t('fromTemplateSubtitle') : t('createNewSubtitle')}
        </p>
      </div>

      <Card>
        <ProgramForm templateId={templateId} />
      </Card>
    </div>
  )
}
