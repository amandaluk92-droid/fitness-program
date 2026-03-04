'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/shared/Button'

export function SessionActions({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const t = useTranslations('trainee.sessions')
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(t('deleteConfirm'))) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      }
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={`/trainee/sessions/${sessionId}/edit`}>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>
      <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  )
}
