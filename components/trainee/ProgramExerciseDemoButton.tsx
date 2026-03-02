'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'
import { ExerciseSearchModal } from '@/components/ExerciseSearchModal'

interface ProgramExerciseDemoButtonProps {
  exerciseName: string
}

export function ProgramExerciseDemoButton({ exerciseName }: ProgramExerciseDemoButtonProps) {
  const t = useTranslations('exerciseSearch')
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 whitespace-nowrap"
      >
        <Search className="h-3 w-3" />
        {t('viewDemo')}
      </button>

      <ExerciseSearchModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
