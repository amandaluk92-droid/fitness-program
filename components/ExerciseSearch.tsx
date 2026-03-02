'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/shared/Button'
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react'

export interface ExerciseResult {
  id: string
  name: string
  gifUrl: string
  target: string
  bodyPart: string
  equipment: string
  secondaryMuscles: string[]
  instructions: string[]
}

interface ExerciseSearchProps {
  onSelect?: (exercise: ExerciseResult) => void
  showSelectButton?: boolean
}

export function ExerciseSearch({ onSelect, showSelectButton = false }: ExerciseSearchProps) {
  const t = useTranslations('exerciseSearch')
  const [query, setQuery] = useState('')
  const [bodyPart, setBodyPart] = useState('')
  const [equipment, setEquipment] = useState('')
  const [results, setResults] = useState<ExerciseResult[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const limit = 12

  const bodyParts = [
    'back', 'cardio', 'chest', 'lower arms', 'lower legs',
    'neck', 'shoulders', 'upper arms', 'upper legs', 'waist',
  ]

  const equipmentOptions = [
    'barbell', 'body weight', 'cable', 'dumbbell', 'ez barbell',
    'kettlebell', 'leverage machine', 'medicine ball', 'resistance band',
    'smith machine', 'stability ball',
  ]

  const searchExercises = useCallback(async (searchQuery: string, searchBodyPart: string, searchEquipment: string, searchOffset: number) => {
    if (!searchQuery && !searchBodyPart && !searchEquipment) {
      setResults([])
      setTotal(0)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (searchBodyPart) params.set('bodyPart', searchBodyPart)
      if (searchEquipment) params.set('equipment', searchEquipment)
      params.set('offset', searchOffset.toString())
      params.set('limit', limit.toString())

      const response = await fetch(`/api/exercises/search?${params.toString()}`)

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || t('searchFailed'))
        setResults([])
        setTotal(0)
        return
      }

      const data = await response.json()
      setResults(data.exercises || [])
      setTotal(data.total || 0)
    } catch {
      setError(t('searchFailed'))
      setResults([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [t])

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setOffset(0)
      searchExercises(query, bodyPart, equipment, 0)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, bodyPart, equipment, searchExercises])

  // Search when offset changes (pagination)
  useEffect(() => {
    if (offset > 0) {
      searchExercises(query, bodyPart, equipment, offset)
    }
  }, [offset]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearFilters = () => {
    setQuery('')
    setBodyPart('')
    setEquipment('')
    setResults([])
    setTotal(0)
    setOffset(0)
  }

  const hasMoreResults = offset + limit < total

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {(query || bodyPart || equipment) && (
          <button
            onClick={handleClearFilters}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('bodyPart')}</label>
          <select
            value={bodyPart}
            onChange={(e) => setBodyPart(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="">{t('allBodyParts')}</option>
            {bodyParts.map((bp) => (
              <option key={bp} value={bp}>{bp}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('equipment')}</label>
          <select
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="">{t('allEquipment')}</option>
            {equipmentOptions.map((eq) => (
              <option key={eq} value={eq}>{eq}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8 text-gray-500 text-sm">
          {t('searching')}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {!isLoading && results.length > 0 && (
        <>
          <p className="text-sm text-gray-500">
            {t('resultsCount', { showing: results.length, total })}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((exercise) => (
              <div
                key={exercise.id}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
              >
                {/* GIF Preview */}
                {exercise.gifUrl && (
                  <div className="relative w-full h-48 bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={exercise.gifUrl}
                      alt={exercise.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="p-3">
                  <h4 className="font-semibold text-gray-900 text-sm capitalize">
                    {exercise.name}
                  </h4>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {exercise.target && (
                      <span className="inline-block px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full">
                        {exercise.target}
                      </span>
                    )}
                    {exercise.bodyPart && (
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {exercise.bodyPart}
                      </span>
                    )}
                    {exercise.equipment && (
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {exercise.equipment}
                      </span>
                    )}
                  </div>

                  {/* Expandable Instructions */}
                  {exercise.instructions.length > 0 && (
                    <div className="mt-2">
                      <button
                        onClick={() => setExpandedId(expandedId === exercise.id ? null : exercise.id)}
                        className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                      >
                        {expandedId === exercise.id ? (
                          <>
                            <ChevronUp className="h-3 w-3" />
                            {t('hideInstructions')}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" />
                            {t('showInstructions')}
                          </>
                        )}
                      </button>

                      {expandedId === exercise.id && (
                        <ol className="mt-2 space-y-1 text-xs text-gray-600 list-decimal list-inside">
                          {exercise.instructions.map((instruction, idx) => (
                            <li key={idx}>{instruction}</li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}

                  {/* Select Button */}
                  {showSelectButton && onSelect && (
                    <Button
                      type="button"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => onSelect(exercise)}
                    >
                      {t('select')}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMoreResults && (
            <div className="text-center pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOffset(offset + limit)}
                disabled={isLoading}
              >
                {t('loadMore')}
              </Button>
            </div>
          )}
        </>
      )}

      {/* No Results */}
      {!isLoading && !error && results.length === 0 && (query || bodyPart || equipment) && (
        <div className="text-center py-8 text-gray-500 text-sm">
          {t('noResults')}
        </div>
      )}

      {/* Initial State */}
      {!isLoading && !error && results.length === 0 && !query && !bodyPart && !equipment && (
        <div className="text-center py-8 text-gray-400 text-sm">
          {t('searchHint')}
        </div>
      )}
    </div>
  )
}
