'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import type { Todo, Person } from '@/types'

const PRIORITY_STYLE = {
  high:   'text-red-700 bg-red-50 border-red-200',
  medium: 'text-amber-700 bg-amber-50 border-amber-200',
  low:    'text-[var(--color-text-muted)] bg-[var(--color-surface)] border-[var(--color-border)]',
}

const STATUS_OPTIONS = [
  { value: 'open',        label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'complete',    label: 'Complete' },
  { value: 'dropped',     label: 'Dropped' },
]

export default function TodoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [todo,     setTodo]     = useState<Todo | null>(null)
  const [persons,  setPersons]  = useState<Person[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [editing,  setEditing]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Edit form state
  const [title,          setTitle]          = useState('')
  const [notes,          setNotes]          = useState('')
  const [priority,       setPriority]       = useState('medium')
  const [status,         setStatus]         = useState('open')
  const [personId,       setPersonId]       = useState('')
  const [sourceTypeHint, setSourceTypeHint] = useState('')
  const [dueDate,        setDueDate]        = useState('')

  const load = useCallback(async () => {
    try {
      const [tRes, pRes] = await Promise.all([
        fetch(`/api/todos/${id}`),
        fetch('/api/persons'),
      ])
      const tData = await tRes.json()
      const pData = await pRes.json()
      if (!tRes.ok) throw new Error(tData.error ?? 'Not found')
      setTodo(tData.todo)
      setPersons(pData.persons ?? [])
      // Populate edit state
      setTitle(tData.todo.title ?? '')
      setNotes(tData.todo.notes ?? '')
      setPriority(tData.todo.priority ?? 'medium')
      setStatus(tData.todo.status ?? 'open')
      setPersonId(tData.todo.person_id ?? '')
      setSourceTypeHint(tData.todo.source_type_hint ?? '')
      setDueDate(tData.todo.due_date ?? '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleSave() {
    if (!title.trim()) { setError('Title is required.'); return }
    setSaving(true)
    setError(null)
    try {
      const res  = await fetch(`/api/todos/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          title:            title.trim(),
          notes:            notes.trim()          || null,
          priority,
          status,
          person_id:        personId              || null,
          source_type_hint: sourceTypeHint.trim() || null,
          due_date:         dueDate               || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTodo(data.todo)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this research item?')) return
    setDeleting(true)
    await fetch(`/api/todos/${id}`, { method: 'DELETE' })
    router.push('/todos')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
      </div>
    )
  }

  if (error && !todo) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <Link href="/todos" className="text-xs text-[var(--color-gold)] hover:underline">Back</Link>
        </div>
      </div>
    )
  }

  if (!todo) return null

  const p = PRIORITY_STYLE[todo.priority as keyof typeof PRIORITY_STYLE] ?? PRIORITY_STYLE.medium

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-2xl mx-auto px-6 py-10">

        <Link href="/todos" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-6">
          &larr; Research To-Do Tracker
        </Link>

        {!editing ? (
          <>
            <div className="flex items-start justify-between gap-4 mb-6">
              <h1 className="font-display text-2xl text-[var(--color-gold)] flex-1">{todo.title}</h1>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1.5 text-xs font-mono border border-[var(--color-border)] rounded hover:border-[var(--color-gold)] text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 text-xs font-mono border border-[var(--color-border)] rounded hover:border-red-400 text-[var(--color-text-muted)] hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`text-xs px-2 py-1 border rounded font-mono capitalize ${p}`}>
                {todo.priority} priority
              </span>
              <span className="text-xs px-2 py-1 border border-[var(--color-border)] rounded font-mono text-[var(--color-text-muted)] capitalize">
                {todo.status.replace('_', ' ')}
              </span>
              {todo.origin_module && todo.origin_module !== 'manual' && (
                <span className="text-xs px-2 py-1 border border-[var(--color-border)] rounded font-mono text-[var(--color-text-muted)]">
                  From: {todo.origin_module}
                </span>
              )}
            </div>

            <div className="space-y-5">
              {todo.person && (
                <div>
                  <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Subject</p>
                  <p className="text-sm">{todo.person.display_name}</p>
                </div>
              )}
              {todo.source_type_hint && (
                <div>
                  <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Source Type</p>
                  <p className="text-sm">{todo.source_type_hint}</p>
                </div>
              )}
              {todo.due_date && (
                <div>
                  <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Due</p>
                  <p className="text-sm">{new Date(todo.due_date + 'T00:00:00').toLocaleDateString()}</p>
                </div>
              )}
              {todo.notes && (
                <div>
                  <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{todo.notes}</p>
                </div>
              )}
              {todo.completed_at && (
                <div>
                  <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Completed</p>
                  <p className="text-sm font-mono">{new Date(todo.completed_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl text-[var(--color-gold)] mb-6">Edit Item</h1>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Item *</label>
                <textarea
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
                >
                  {STATUS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Priority</label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as const).map(pr => (
                    <button
                      key={pr}
                      onClick={() => setPriority(pr)}
                      className={`px-4 py-2 text-xs font-mono border rounded capitalize transition-colors ${
                        priority === pr
                          ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                          : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                      }`}
                    >
                      {pr}
                    </button>
                  ))}
                </div>
              </div>

              {persons.length > 0 && (
                <div>
                  <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Subject</label>
                  <select
                    value={personId}
                    onChange={e => setPersonId(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
                  >
                    <option value="">-- None --</option>
                    {persons.map(p => <option key={p.id} value={p.id}>{p.display_name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Source Type Hint</label>
                <input
                  type="text"
                  value={sourceTypeHint}
                  onChange={e => setSourceTypeHint(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] resize-y"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => { setEditing(false); setError(null) }}
                  className="px-4 py-2.5 text-sm border border-[var(--color-border)] rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
