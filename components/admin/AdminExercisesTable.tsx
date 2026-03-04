'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { Pencil, Trash2, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface Exercise {
  id: string
  name: string
  description?: string | null
  muscleGroup?: string | null
  createdAt: string
  _count: { sessionExercises: number; programExercises: number }
}

interface Props {
  exercises: Exercise[]
  total: number
  page: number
  limit: number
  search: string
}

export function AdminExercisesTable({ exercises, total, page, limit, search }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchInput, setSearchInput] = useState(search)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editMuscleGroup, setEditMuscleGroup] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newMuscleGroup, setNewMuscleGroup] = useState('')
  const totalPages = Math.ceil(total / limit)

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchInput) params.set('search', searchInput)
    else params.delete('search')
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', p.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const startEdit = (ex: Exercise) => {
    setEditingId(ex.id)
    setEditName(ex.name)
    setEditMuscleGroup(ex.muscleGroup || '')
  }

  const saveEdit = async () => {
    if (!editingId) return
    await fetch('/api/admin/exercises', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, name: editName, muscleGroup: editMuscleGroup || null }),
    })
    setEditingId(null)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this exercise?')) return
    await fetch(`/api/admin/exercises?id=${id}`, { method: 'DELETE' })
    router.refresh()
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    await fetch('/api/admin/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, muscleGroup: newMuscleGroup || undefined }),
    })
    setNewName('')
    setNewMuscleGroup('')
    setShowCreate(false)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex gap-2">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search exercises..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="outline" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {showCreate && (
        <div className="flex gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Exercise name" />
          <Input value={newMuscleGroup} onChange={(e) => setNewMuscleGroup(e.target.value)} placeholder="Muscle group" />
          <Button onClick={handleCreate}>Save</Button>
          <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Muscle Group</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used In</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {exercises.map((ex) => (
              <tr key={ex.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  {editingId === ex.id ? (
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  ) : (
                    <span className="font-medium text-gray-900">{ex.name}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {editingId === ex.id ? (
                    <Input value={editMuscleGroup} onChange={(e) => setEditMuscleGroup(e.target.value)} />
                  ) : (
                    ex.muscleGroup || '—'
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {ex._count.programExercises} programs, {ex._count.sessionExercises} sessions
                </td>
                <td className="px-4 py-3 text-sm">
                  {editingId === ex.id ? (
                    <div className="flex gap-1">
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(ex)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(ex.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
          <p className="text-sm text-gray-600">
            {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="flex items-center px-3 text-sm">{page}/{totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
