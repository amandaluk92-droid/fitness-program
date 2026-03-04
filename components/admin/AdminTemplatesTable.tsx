'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { Pencil, Trash2 } from 'lucide-react'

interface Template {
  id: string
  name: string
  description?: string | null
  category: string
  isActive: boolean
  _count: { exercises: number; programs: number }
}

export function AdminTemplatesTable({ templates }: { templates: Template[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const startEdit = (t: Template) => {
    setEditingId(t.id)
    setEditName(t.name)
  }

  const saveEdit = async () => {
    if (!editingId) return
    await fetch('/api/admin/templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, name: editName }),
    })
    setEditingId(null)
    router.refresh()
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    await fetch('/api/admin/templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !currentActive }),
    })
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template? This cannot be undone.')) return
    await fetch(`/api/admin/templates?id=${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {templates.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">
                {editingId === t.id ? (
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                ) : (
                  <span className="font-medium text-gray-900">{t.name}</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{t.category}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => toggleActive(t.id, t.isActive)}
                  className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    t.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {t.isActive ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {t._count.exercises} exercises, {t._count.programs} programs
              </td>
              <td className="px-4 py-3 text-sm">
                {editingId === t.id ? (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={saveEdit}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(t)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {templates.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                No templates found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
