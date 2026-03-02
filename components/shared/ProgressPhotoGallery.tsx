'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Trash2, Image } from 'lucide-react'
import { ProgressPhotoLightbox } from './ProgressPhotoLightbox'

interface Photo {
  id: string
  photoUrl: string
  date: string
  pose: string
  notes?: string | null
}

interface ProgressPhotoGalleryProps {
  traineeId: string
  readOnly?: boolean
  refreshKey?: number
}

type DateGroup = {
  date: string
  photos: Photo[]
}

export function ProgressPhotoGallery({
  traineeId,
  readOnly = false,
  refreshKey = 0,
}: ProgressPhotoGalleryProps) {
  const t = useTranslations('progressPhotos')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareDateA, setCompareDateA] = useState('')
  const [compareDateB, setCompareDateB] = useState('')
  const [comparePose, setComparePose] = useState('FRONT')

  const fetchPhotos = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (traineeId) params.set('traineeId', traineeId)
      const res = await fetch(`/api/progress-photos?${params}`)
      const data = await res.json()
      if (res.ok) {
        setPhotos(data.photos || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [traineeId])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos, refreshKey])

  const handleDelete = async (photo: Photo) => {
    if (!confirm(t('deleteConfirm'))) return
    setDeletingId(photo.id)
    try {
      const res = await fetch(`/api/progress-photos/${photo.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null)
    }
  }

  const dateGroups: DateGroup[] = useMemo(() => {
    const groups: Record<string, Photo[]> = {}
    for (const photo of photos) {
      const dateKey = photo.date.split('T')[0]
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(photo)
    }
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, photos]) => ({ date, photos }))
  }, [photos])

  const uniqueDates = useMemo(() => dateGroups.map((g) => g.date), [dateGroups])

  const poseLabels: Record<string, string> = {
    FRONT: t('front'),
    SIDE: t('side'),
    BACK: t('back'),
  }

  const poseOrder = ['FRONT', 'SIDE', 'BACK']

  const comparePhotoA = useMemo(
    () => photos.find((p) => p.date.startsWith(compareDateA) && p.pose === comparePose),
    [photos, compareDateA, comparePose]
  )

  const comparePhotoB = useMemo(
    () => photos.find((p) => p.date.startsWith(compareDateB) && p.pose === comparePose),
    [photos, compareDateB, comparePose]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500">{t('loading')}</p>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-8">
        <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">
          {readOnly ? t('noPhotosTrainer') : t('noPhotos')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Comparison toggle */}
      {photos.length >= 2 && (
        <div className="flex justify-end">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {compareMode ? t('gallery') : t('comparison')}
          </button>
        </div>
      )}

      {/* Comparison mode */}
      {compareMode && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('compareBefore')}
              </label>
              <select
                value={compareDateA}
                onChange={(e) => setCompareDateA(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('selectDate')}</option>
                {uniqueDates.map((d) => (
                  <option key={d} value={d}>
                    {new Date(d).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('compareAfter')}
              </label>
              <select
                value={compareDateB}
                onChange={(e) => setCompareDateB(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('selectDate')}</option>
                {uniqueDates.map((d) => (
                  <option key={d} value={d}>
                    {new Date(d).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('selectPose')}
              </label>
              <select
                value={comparePose}
                onChange={(e) => setComparePose(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {poseOrder.map((p) => (
                  <option key={p} value={p}>
                    {poseLabels[p]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {compareDateA && compareDateB && (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {t('compareBefore')} — {new Date(compareDateA).toLocaleDateString()}
                </p>
                {comparePhotoA ? (
                  <img
                    src={comparePhotoA.photoUrl}
                    alt={t('compareBefore')}
                    className="w-full aspect-[3/4] object-cover rounded-lg cursor-pointer"
                    onClick={() => setLightboxPhoto(comparePhotoA)}
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-sm text-gray-500">{t('noPhotos')}</p>
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {t('compareAfter')} — {new Date(compareDateB).toLocaleDateString()}
                </p>
                {comparePhotoB ? (
                  <img
                    src={comparePhotoB.photoUrl}
                    alt={t('compareAfter')}
                    className="w-full aspect-[3/4] object-cover rounded-lg cursor-pointer"
                    onClick={() => setLightboxPhoto(comparePhotoB)}
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-sm text-gray-500">{t('noPhotos')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gallery mode */}
      {!compareMode &&
        dateGroups.map((group) => (
          <div key={group.date}>
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              {new Date(group.date).toLocaleDateString()}
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {poseOrder.map((pose) => {
                const photo = group.photos.find((p) => p.pose === pose)
                if (!photo) {
                  return (
                    <div
                      key={pose}
                      className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center"
                    >
                      <span className="text-xs text-gray-400">{poseLabels[pose]}</span>
                    </div>
                  )
                }
                return (
                  <div key={pose} className="relative group">
                    <img
                      src={photo.photoUrl}
                      alt={`${poseLabels[pose]} - ${group.date}`}
                      className="w-full aspect-[3/4] object-cover rounded-lg cursor-pointer"
                      onClick={() => setLightboxPhoto(photo)}
                    />
                    <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                      {poseLabels[pose]}
                    </span>
                    {!readOnly && (
                      <button
                        onClick={() => handleDelete(photo)}
                        disabled={deletingId === photo.id}
                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

      {/* Lightbox */}
      {lightboxPhoto && (
        <ProgressPhotoLightbox
          photo={lightboxPhoto}
          photos={photos}
          onClose={() => setLightboxPhoto(null)}
          onNavigate={setLightboxPhoto}
        />
      )}
    </div>
  )
}
