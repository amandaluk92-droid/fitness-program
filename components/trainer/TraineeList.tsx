'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/shared/Card'
import { formatDate } from '@/lib/utils'
import { User, Calendar } from 'lucide-react'

interface Trainee {
  id: string
  name: string
  email: string
  programAssignments: Array<{
    program: {
      id: string
      name: string
      sessions: Array<{ date: Date }>
    }
  }>
  trainingSessions: Array<{
    id: string
    date: Date
  }>
}

interface TraineeListProps {
  trainees: Trainee[]
}

export function TraineeList({ trainees }: TraineeListProps) {
  const t = useTranslations('trainer.traineeList')

  if (trainees.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t('noConnectedTrainees')}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {trainees.map((trainee) => {
        const lastSession = trainee.trainingSessions[0]
        const programCount = trainee.programAssignments.length

        return (
          <Link key={trainee.id} href={`/trainer/trainees/${trainee.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{trainee.name}</h3>
                  <p className="text-sm text-gray-500">{trainee.email}</p>
                </div>
                <User className="h-8 w-8 text-primary-500" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t('activePrograms')}</span>
                  <span className="font-medium">{programCount}</span>
                </div>

                {lastSession && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{t('lastSession', { date: formatDate(lastSession.date) })}</span>
                  </div>
                )}

                {!lastSession && (
                  <p className="text-sm text-gray-400 italic">{t('noSessionsYet')}</p>
                )}
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
