'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/shared/Card'
import { Select } from '@/components/shared/Select'
import { ProgressChart } from '@/components/shared/ProgressChart'
import { WeekComparison } from '@/components/shared/WeekComparison'
import { BodyWeightChart } from '@/components/shared/BodyWeightChart'
import { ProgressPhotoUpload } from '@/components/shared/ProgressPhotoUpload'
import { ProgressPhotoGallery } from '@/components/shared/ProgressPhotoGallery'

interface ProgressTrackingProps {
  traineeId: string
}

export function ProgressTracking({ traineeId }: ProgressTrackingProps) {
  const t = useTranslations('trainee.progress')
  const tp = useTranslations('progressPhotos')
  const [programs, setPrograms] = useState<any[]>([])
  const [exercises, setExercises] = useState<any[]>([])
  const [selectedProgram, setSelectedProgram] = useState('')
  const [selectedExercise, setSelectedExercise] = useState('')
  const [weeks, setWeeks] = useState('8')
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [metric, setMetric] = useState<'sessions' | 'volume' | 'weight' | 'reps'>('sessions')
  const [progressData, setProgressData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [bodyWeightData, setBodyWeightData] = useState<{ entries: { date: string; weight: number }[]; goalWeight?: number } | null>(null)
  const [bodyWeightLoading, setBodyWeightLoading] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [photoRefreshKey, setPhotoRefreshKey] = useState(0)

  useEffect(() => {
    fetch('/api/programs')
      .then((res) => res.json())
      .then((data) => {
        const activePrograms = (data.programs || []).filter((p: any) => p.isActive)
        setPrograms(activePrograms)
      })
      .catch((err) => console.error('Error fetching programs:', err))
  }, [])

  useEffect(() => {
    if (selectedProgram) {
      const program = programs.find((p) => p.id === selectedProgram)
      if (program) {
        const uniqueExercises = program.exercises.map((ex: any) => ({
          id: ex.exerciseId,
          name: ex.exercise.name,
        }))
        setExercises(uniqueExercises)
      }
    } else {
      setExercises([])
      setSelectedExercise('')
    }
  }, [selectedProgram, programs])

  useEffect(() => {
    if (traineeId) {
      fetchProgress()
    }
  }, [traineeId, selectedProgram, selectedExercise, weeks])

  const fetchBodyWeight = useCallback(async () => {
    setBodyWeightLoading(true)
    try {
      const res = await fetch(`/api/body-weight?weeks=${weeks}`)
      const data = await res.json()
      if (res.ok) {
        setBodyWeightData({
          entries: data.entries || [],
          goalWeight: data.goalWeight,
        })
      } else {
        setBodyWeightData(null)
      }
    } catch {
      setBodyWeightData(null)
    } finally {
      setBodyWeightLoading(false)
    }
  }, [weeks])

  useEffect(() => {
    if (traineeId) fetchBodyWeight()
  }, [traineeId, weeks, fetchBodyWeight])

  const handleLogWeight = useCallback(
    async (weight: number) => {
      const res = await fetch('/api/body-weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to log weight')
      }
      await fetchBodyWeight()
    },
    [fetchBodyWeight]
  )

  const fetchProgress = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        traineeId,
        weeks,
      })
      if (selectedProgram) params.append('programId', selectedProgram)
      if (selectedExercise) params.append('exerciseId', selectedExercise)

      const response = await fetch(`/api/progress?${params}`)
      const data = await response.json()
      setProgressData(data)
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentWeek = progressData?.weeklyData?.[progressData.weeklyData.length - 1]
  const previousWeek = progressData?.weeklyData?.[progressData.weeklyData.length - 2]

  const todayStr = new Date().toISOString().split('T')[0]
  const todayLogged = bodyWeightData?.entries?.some((e) => e.date === todayStr) ?? false

  return (
    <div className="space-y-6">
      {/* Body weight */}
      <Card title={t('bodyWeight')}>
        {bodyWeightLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">{t('loadingProgress')}</p>
          </div>
        ) : (
          <BodyWeightChart
            data={bodyWeightData?.entries ?? []}
            goalWeight={bodyWeightData?.goalWeight}
            showLogForm
            onLogWeight={handleLogWeight}
            logWeightLabel={t('logWeight')}
            logSuccessLabel={t('weightLogged')}
            todayLogged={todayLogged}
          />
        )}
      </Card>

      {/* Progress Photos */}
      <Card
        title={tp('title')}
        action={
          <button
            onClick={() => setShowPhotoUpload(!showPhotoUpload)}
            className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {tp('uploadPhotos')}
          </button>
        }
      >
        {showPhotoUpload && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <ProgressPhotoUpload
              onComplete={() => {
                setShowPhotoUpload(false)
                setPhotoRefreshKey((k) => k + 1)
              }}
            />
          </div>
        )}
        <ProgressPhotoGallery traineeId={traineeId} refreshKey={photoRefreshKey} />
      </Card>

      {/* Filters */}
      <Card title={t('filters')}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label={t('programOptional')}
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            options={[
              { value: '', label: t('allPrograms') },
              ...programs.map((p) => ({
                value: p.id,
                label: p.name,
              })),
            ]}
          />

          <Select
            label={t('exerciseOptional')}
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            disabled={!selectedProgram}
            options={[
              { value: '', label: t('allExercises') },
              ...exercises.map((ex) => ({
                value: ex.id,
                label: ex.name,
              })),
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('weeks')}
            </label>
            <select
              value={weeks}
              onChange={(e) => setWeeks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="4">{t('weeks4')}</option>
              <option value="8">{t('weeks8')}</option>
              <option value="12">{t('weeks12')}</option>
              <option value="16">{t('weeks16')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('metric')}
            </label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="sessions">{t('sessions')}</option>
              {selectedExercise && (
                <>
                  <option value="volume">{t('volume')}</option>
                  <option value="weight">{t('maxWeight')}</option>
                  <option value="reps">{t('totalReps')}</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('chartType')}
            </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="line">{t('lineChart')}</option>
              <option value="bar">{t('barChart')}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Charts */}
      {loading ? (
        <Card>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">{t('loadingProgress')}</p>
          </div>
        </Card>
      ) : progressData?.weeklyData?.length > 0 ? (
        <>
          <Card title={t('progressOverTime')}>
            <ProgressChart
              data={progressData.weeklyData}
              exerciseId={selectedExercise || undefined}
              type={chartType}
              metric={metric}
            />
          </Card>

          {currentWeek && (
            <WeekComparison
              currentWeek={currentWeek}
              previousWeek={previousWeek}
              exerciseId={selectedExercise || undefined}
            />
          )}
        </>
      ) : (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">{t('noData')}</p>
          </div>
        </Card>
      )}

      {/* Personal Records */}
      {progressData?.personalRecords?.length > 0 && (
        <Card title={t('personalRecords')}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {progressData.personalRecords.slice(0, 9).map((pr: any) => (
              <div key={pr.exerciseId} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{pr.exerciseName}</p>
                <p className="text-lg font-bold text-primary-600">{pr.maxWeight} kg</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Adherence */}
      {progressData?.adherenceRate !== undefined && (
        <Card title={t('adherence')}>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-primary-600">{progressData.adherenceRate}%</div>
            <div>
              <p className="text-sm text-gray-600">{t('adherenceDesc')}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
