'use client'

import { useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Photo {
  id: string
  photoUrl: string
  date: string
  pose: string
  notes?: string | null
}

interface ProgressPhotoLightboxProps {
  photo: Photo
  photos: Photo[]
  onClose: () => void
  onNavigate: (photo: Photo) => void
}

export function ProgressPhotoLightbox({
  photo,
  photos,
  onClose,
  onNavigate,
}: ProgressPhotoLightboxProps) {
  const t = useTranslations('progressPhotos')

  const currentIndex = photos.findIndex((p) => p.id === photo.id)

  const goPrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(photos[currentIndex - 1])
  }, [currentIndex, photos, onNavigate])

  const goNext = useCallback(() => {
    if (currentIndex < photos.length - 1) onNavigate(photos[currentIndex + 1])
  }, [currentIndex, photos, onNavigate])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, goPrev, goNext])

  const poseLabel = {
    FRONT: t('front'),
    SIDE: t('side'),
    BACK: t('back'),
  }[photo.pose] || photo.pose

  const dateStr = new Date(photo.date).toLocaleDateString()

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev() }}
          className="absolute left-4 text-white/80 hover:text-white z-10"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
      )}

      {currentIndex < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext() }}
          className="absolute right-4 text-white/80 hover:text-white z-10"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      )}

      <div
        className="flex flex-col items-center max-w-4xl max-h-[90vh] px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.photoUrl}
          alt={`${poseLabel} - ${dateStr}`}
          className="max-h-[80vh] max-w-full object-contain rounded-lg"
        />
        <div className="mt-3 text-center text-white">
          <p className="text-lg font-medium">{dateStr} — {poseLabel}</p>
          {photo.notes && (
            <p className="text-sm text-white/70 mt-1">{photo.notes}</p>
          )}
        </div>
      </div>
    </div>
  )
}
