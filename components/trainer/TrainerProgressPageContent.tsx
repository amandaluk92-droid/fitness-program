'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/shared/Card'
import { Select } from '@/components/shared/Select'
import { ProgressTracking as TrainerProgressTracking } from '@/components/trainer/TrainerProgressTracking'
import { User } from 'lucide-react'

interface TrainerProgressPageContentProps {
  trainees: { id: string; name: string }[]
  trainerId: string
}

export function TrainerProgressPageContent({
  trainees,
  trainerId,
}: TrainerProgressPageContentProps) {
  const t = useTranslations('trainer.progressPageContent')
  const [selectedTraineeId, setSelectedTraineeId] = useState('')

  if (trainees.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <Card>
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {t('noTraineesAssigned')}
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('subtitle')}</p>
      </div>

      <Card title={t('selectTrainee')}>
        <div className="max-w-sm">
          <Select
            label={t('selectTrainee')}
            value={selectedTraineeId}
            onChange={(e) => setSelectedTraineeId(e.target.value)}
            options={[
              { value: '', label: t('selectTrainee') },
              ...trainees.map((tr) => ({
                value: tr.id,
                label: tr.name,
              })),
            ]}
          />
        </div>
      </Card>

      {!selectedTraineeId ? (
        <Card>
          <p className="text-gray-500 text-center py-8">
            {t('selectTraineeAbove')}
          </p>
        </Card>
      ) : (
        <TrainerProgressTracking
          traineeId={selectedTraineeId}
          trainerId={trainerId}
        />
      )}
    </div>
  )
}
