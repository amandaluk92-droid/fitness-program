'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/shared/Button'
import { Select } from '@/components/shared/Select'

interface Trainee {
  id: string
  name: string
  email: string
}

interface AssignTraineeFormProps {
  programId: string
  assignedTraineeIds: string[]
}

export function AssignTraineeForm({ programId, assignedTraineeIds }: AssignTraineeFormProps) {
  const router = useRouter()
  const t = useTranslations('trainer.assignTraineeForm')
  const [trainees, setTrainees] = useState<Trainee[]>([])
  const [traineeId, setTraineeId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetch('/api/connections')
      .then((res) => res.json())
      .then((data) => setTrainees(data.users || []))
      .catch(() => setTrainees([]))
  }, [])

  const availableTrainees = trainees.filter((t) => !assignedTraineeIds.includes(t.id))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!traineeId) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/programs/${programId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traineeId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t('failedToAssign'))
        return
      }
      setTraineeId('')
      router.refresh()
    } catch {
      setError(t('failedToAssign'))
    } finally {
      setIsLoading(false)
    }
  }

  if (availableTrainees.length === 0) return null

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[200px] flex-1">
        <Select
          label={t('assignLabel')}
          value={traineeId}
          onChange={(e) => setTraineeId(e.target.value)}
          options={[
            { value: '', label: t('selectTrainee') },
            ...availableTrainees.map((tr) => ({
              value: tr.id,
              label: `${tr.name} (${tr.email})`,
            })),
          ]}
        />
      </div>
      <Button type="submit" disabled={!traineeId || isLoading}>
        {isLoading ? t('assigning') : t('assign')}
      </Button>
      {error && (
        <p className="w-full text-sm text-red-600">{error}</p>
      )}
    </form>
  )
}
