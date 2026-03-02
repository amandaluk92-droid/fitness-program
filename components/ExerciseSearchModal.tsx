'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import { ExerciseSearch, ExerciseResult } from './ExerciseSearch'

interface ExerciseSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect?: (exercise: ExerciseResult) => void
  showSelectButton?: boolean
}

export function ExerciseSearchModal({ isOpen, onClose, onSelect, showSelectButton = false }: ExerciseSearchModalProps) {
  const t = useTranslations('exerciseSearch')

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSelect = (exercise: ExerciseResult) => {
    onSelect?.(exercise)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('modalTitle')}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <ExerciseSearch
            onSelect={handleSelect}
            showSelectButton={showSelectButton}
          />
        </div>
      </div>
    </div>
  )
}
