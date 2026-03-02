'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/shared/Button'
import { FileSpreadsheet, FileText } from 'lucide-react'

const EXPORT_BASE = '/api/admin/reports/subscription-financial/export'

async function downloadReport(format: 'xlsx' | 'pdf') {
  const url = `${EXPORT_BASE}?format=${format}`
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Download failed (${res.status})`)
  }
  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition')
  const match = disposition?.match(/filename="?([^";]+)"?/)
  const filename = match?.[1] ?? `subscription-financial-report.${format === 'xlsx' ? 'xlsx' : 'pdf'}`
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

export function ReportExportButtons() {
  const t = useTranslations('admin.reportExport')
  const [loading, setLoading] = useState<'xlsx' | 'pdf' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async (format: 'xlsx' | 'pdf') => {
    setError(null)
    setLoading(format)
    try {
      await downloadReport(format)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('downloadFailed'))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('xlsx')}
        disabled={loading !== null}
      >
        <FileSpreadsheet className="h-4 w-4 mr-2 inline" />
        {loading === 'xlsx' ? t('downloading') : t('downloadExcel')}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('pdf')}
        disabled={loading !== null}
      >
        <FileText className="h-4 w-4 mr-2 inline" />
        {loading === 'pdf' ? t('downloading') : t('downloadPdf')}
      </Button>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
