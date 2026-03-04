'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Sidebar } from './Sidebar'

interface MobileNavProps {
  role: 'TRAINER' | 'TRAINEE' | 'ADMIN'
  userName: string
  paymentsDisabled?: boolean
}

export function MobileNav({ role, userName, paymentsDisabled }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const dashboardHref = role === 'ADMIN' ? '/admin/dashboard' : role === 'TRAINER' ? '/trainer/dashboard' : '/trainee/dashboard'

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
        <Link href={dashboardHref}>
          <Image src="/axio-logo.png" alt="Axio" width={100} height={28} className="h-7 w-auto" />
        </Link>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <Sidebar
          role={role}
          userName={userName}
          paymentsDisabled={paymentsDisabled}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </>
  )
}
