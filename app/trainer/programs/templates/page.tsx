'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { FileText, ChevronLeft, AlertTriangle } from 'lucide-react'

interface TemplateExercise {
  id: string
  sets: number
  reps: number
  restTimeSeconds?: number | null
  order: number
  dayOfWeek?: number | null
  workoutDayIndex?: number | null
  exercise: { id: string; name: string }
}

interface Template {
  id: string
  name: string
  description: string | null
  duration: number | null
  category: string
  injuryType: string | null
  isActive: boolean
  exercises: TemplateExercise[]
}

export default function TemplatesPage() {
  const router = useRouter()
  const t = useTranslations('trainer.templates')
  const tCommon = useTranslations('common')
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string>('')
  const [injuryType, setInjuryType] = useState<string>('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (injuryType) params.set('injuryType', injuryType)

    fetch(`/api/templates?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [category, injuryType])

  const injuryTypes = [...new Set(templates.map((t) => t.injuryType).filter(Boolean))] as string[]

  const hasRehabTemplates = templates.some((t) => t.category === 'REHAB')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/trainer/programs">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {tCommon('back')}
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {hasRehabTemplates && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            {t('rehabDisclaimer')}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('category')}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">{t('all')}</option>
            <option value="GBC">{t('gbc')}</option>
            <option value="REHAB">{t('rehab')}</option>
          </select>
        </div>

        {category === 'REHAB' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('injuryType')}</label>
            <select
              value={injuryType}
              onChange={(e) => setInjuryType(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">{t('all')}</option>
              {injuryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <Card>
          <div className="text-center py-12 text-gray-500">{t('loading')}</div>
        </Card>
      ) : templates.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t('noTemplates')}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      template.category === 'GBC'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {template.category === 'GBC' ? t('gbc') : t('rehab')}
                  </span>
                </div>
                {template.injuryType && (
                  <span className="text-xs text-gray-600 mb-2 block">{template.injuryType}</span>
                )}
                {template.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-3">{template.description}</p>
                )}

                <div className="mt-4 space-y-1 text-sm text-gray-600">
                  {template.duration && (
                    <div>{t('duration')}: {template.duration} {t('weeks')}</div>
                  )}
                  {(() => {
                    const workoutDays = new Set(
                      template.exercises
                        .map((e) => e.workoutDayIndex)
                        .filter((d): d is number => d != null)
                    ).size
                    return workoutDays > 0 ? (
                      <div>
                        {workoutDays} workout day{workoutDays !== 1 ? 's' : ''},{' '}
                        {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}
                      </div>
                    ) : (
                      <div>
                        {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}
                      </div>
                    )
                  })()}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() =>
                    router.push(`/trainer/programs/new?templateId=${template.id}`)
                  }
                >
                  {t('useTemplate')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
