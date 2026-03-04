'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/shared/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  total: number
  page: number
  limit: number
}

export function Pagination({ total, page, limit }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(total / limit)

  if (totalPages <= 1) return null

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
      <p className="text-sm text-gray-600">
        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="flex items-center px-3 text-sm text-gray-700">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
