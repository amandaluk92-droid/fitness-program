'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { signOut } from 'next-auth/react'

export function DeleteAccountDialog() {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') return
    setIsDeleting(true)
    setError('')

    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || t('common.error'))
        setIsDeleting(false)
        return
      }

      await signOut({ callbackUrl: '/login' })
    } catch {
      setError(t('common.error'))
      setIsDeleting(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        {t('settings.deleteAccount')}
      </button>
    )
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h3 className="text-lg font-semibold text-red-800">{t('settings.deleteAccountTitle')}</h3>
      <p className="mt-2 text-sm text-red-700">{t('settings.deleteAccountWarning')}</p>
      <p className="mt-2 text-sm text-red-700">
        {t('settings.deleteAccountConfirmPrompt')}
      </p>

      <input
        type="text"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        placeholder="DELETE"
        className="mt-2 w-full rounded-md border border-red-300 px-3 py-2 text-sm"
        aria-label={t('settings.deleteAccountConfirmPrompt')}
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleDelete}
          disabled={confirmation !== 'DELETE' || isDeleting}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? t('settings.deleting') : t('settings.confirmDelete')}
        </button>
        <button
          onClick={() => {
            setIsOpen(false)
            setConfirmation('')
            setError('')
          }}
          className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  )
}
