'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/shared/Card'
import { formatDate } from '@/lib/utils'
import { FileText, Calendar } from 'lucide-react'

interface Program {
  id: string
  name: string
  description?: string
  duration?: number
  createdAt: Date
  exercises: Array<{
    id: string
    exercise: {
      name: string
    }
  }>
}

interface ActiveProgramsListProps {
  programs: Program[]
}

export function ActiveProgramsList({ programs }: ActiveProgramsListProps) {
  const t = useTranslations('trainee.activeProgramsList')

  if (programs.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t('noActive')}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {programs.map((program) => (
        <Link key={program.id} href={`/trainee/programs/${program.id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                {program.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{program.description}</p>
                )}
              </div>
              <FileText className="h-6 w-6 text-primary-500 flex-shrink-0" />
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                {t('exercisesCount', { count: program.exercises.length })}
              </div>

              {program.duration && (
                <div className="text-sm text-gray-600">
                  {t('duration')} <span className="font-medium">{program.duration}</span> {t('weeks')}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 pt-4 border-t border-gray-200">
                <Calendar className="h-4 w-4" />
                <span>{t('created', { date: formatDate(program.createdAt) })}</span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
