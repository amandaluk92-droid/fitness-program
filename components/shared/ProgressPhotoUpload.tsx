'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Camera, X, Loader2, Check } from 'lucide-react'
import { compressImage } from '@/lib/image-compression'

interface ProgressPhotoUploadProps {
  onComplete: () => void
}

type PoseType = 'FRONT' | 'SIDE' | 'BACK'
type SlotState = {
  file: File | null
  preview: string | null
  status: 'idle' | 'uploading' | 'success' | 'error'
  error?: string
}

const POSES: PoseType[] = ['FRONT', 'SIDE', 'BACK']

export function ProgressPhotoUpload({ onComplete }: ProgressPhotoUploadProps) {
  const t = useTranslations('progressPhotos')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [slots, setSlots] = useState<Record<PoseType, SlotState>>({
    FRONT: { file: null, preview: null, status: 'idle' },
    SIDE: { file: null, preview: null, status: 'idle' },
    BACK: { file: null, preview: null, status: 'idle' },
  })
  const [submitting, setSubmitting] = useState(false)
  const fileInputRefs = useRef<Record<PoseType, HTMLInputElement | null>>({
    FRONT: null,
    SIDE: null,
    BACK: null,
  })

  const poseLabels: Record<PoseType, string> = {
    FRONT: t('front'),
    SIDE: t('side'),
    BACK: t('back'),
  }

  const handleFileSelect = async (pose: PoseType, file: File) => {
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    if (!ALLOWED_TYPES.includes(file.type)) {
      setSlots((prev) => ({
        ...prev,
        [pose]: { ...prev[pose], status: 'error', error: t('invalidFileType') },
      }))
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setSlots((prev) => ({
        ...prev,
        [pose]: { ...prev[pose], status: 'error', error: t('fileTooLarge') },
      }))
      return
    }

    try {
      const compressed = await compressImage(file)
      const preview = URL.createObjectURL(compressed)
      setSlots((prev) => ({
        ...prev,
        [pose]: { file: compressed, preview, status: 'idle' },
      }))
    } catch {
      setSlots((prev) => ({
        ...prev,
        [pose]: { ...prev[pose], status: 'error', error: t('uploadError') },
      }))
    }
  }

  const clearSlot = (pose: PoseType) => {
    if (slots[pose].preview) {
      URL.revokeObjectURL(slots[pose].preview!)
    }
    setSlots((prev) => ({
      ...prev,
      [pose]: { file: null, preview: null, status: 'idle' },
    }))
    if (fileInputRefs.current[pose]) {
      fileInputRefs.current[pose]!.value = ''
    }
  }

  const handleSubmit = async () => {
    const filledSlots = POSES.filter((pose) => slots[pose].file)
    if (filledSlots.length === 0) return

    setSubmitting(true)

    for (const pose of filledSlots) {
      setSlots((prev) => ({
        ...prev,
        [pose]: { ...prev[pose], status: 'uploading' },
      }))

      try {
        const formData = new FormData()
        formData.append('file', slots[pose].file!)
        formData.append('date', date)
        formData.append('pose', pose)
        if (notes) formData.append('notes', notes)

        const res = await fetch('/api/progress-photos', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Upload failed')
        }

        setSlots((prev) => ({
          ...prev,
          [pose]: { ...prev[pose], status: 'success' },
        }))
      } catch (err) {
        setSlots((prev) => ({
          ...prev,
          [pose]: {
            ...prev[pose],
            status: 'error',
            error: err instanceof Error ? err.message : t('uploadError'),
          },
        }))
      }
    }

    setSubmitting(false)

    const allSuccess = filledSlots.every((pose) => slots[pose].status === 'success')
    if (allSuccess) {
      setTimeout(() => {
        onComplete()
      }, 1000)
    }
  }

  const hasFiles = POSES.some((pose) => slots[pose].file)

  return (
    <div className="space-y-4">
      {/* Date picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('date')}
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Upload slots */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {POSES.map((pose) => (
          <div key={pose} className="flex flex-col items-center">
            <span className="text-sm font-medium text-gray-700 mb-2">
              {poseLabels[pose]}
            </span>

            {slots[pose].preview ? (
              <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={slots[pose].preview!}
                  alt={poseLabels[pose]}
                  className="w-full h-full object-cover"
                />
                {slots[pose].status === 'idle' && (
                  <button
                    onClick={() => clearSlot(pose)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                )}
                {slots[pose].status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
                {slots[pose].status === 'success' && (
                  <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileInputRefs.current[pose]?.click()}
                className="w-full aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary-400 hover:bg-primary-50 transition-colors"
              >
                <Camera className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">{poseLabels[pose]}</span>
              </button>
            )}

            <input
              ref={(el) => { fileInputRefs.current[pose] = el }}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(pose, file)
              }}
            />

            {slots[pose].status === 'error' && (
              <p className="text-xs text-red-600 mt-1">{slots[pose].error}</p>
            )}
          </div>
        ))}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('notes')}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('notesPlaceholder')}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!hasFiles || submitting}
        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? t('uploading') : t('uploadPhotos')}
      </button>
    </div>
  )
}
