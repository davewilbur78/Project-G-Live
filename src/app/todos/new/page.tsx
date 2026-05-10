'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Person } from '@/types'

export default function NewTodoPage() {
  const router = useRouter()

  const [persons,        setPersons]        = useState<Person[]>([])
  const [title,          setTitle]          = useState('')
  const [notes,          setNotes]          = useState('')
  const [priority,       setPriority]       = useState<'high' | 'medium' | 'low'>('medium')
  const [personId,       setPersonId]       = useState('')
  const [sourceTypeHint, setSourceTypeHint] = useState('')
  const [dueDate,        setDueDate]        = useState('')
  const [saving,         setSaving]         = useState(false)
  const [error,          setError]          = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/persons')
      .then(r => r.json())
      .then(d => setPersons(d.persons ?? []))
      .catch(() => {})
  }, [])

  async function handleSubmit() {
    setError(null)
    if (!title.trim()) { setError('Title is required.'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/todos', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          title:            title.trim(),
          notes:            notes.trim()          || null,
          priority,
          person_id:        personId              || null,
          source_type_hint: sourceTypeHint.trim() || null,
          due_date:         dueDate               || null,
          origin_module:    'manual',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create item')
      router.push(`/todos/${data.todo.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-2xl mx-auto px-6 py-10">

        <Link href="/todos" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-6">
          &larr; Research To-Do Tracker
        </Link>

        <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">New Research Item</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          Write down every open lead. If it is not written, it will be dropped.
        </p>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">

          <div>
            <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-2">
              Research Item <span className="text-red-400">*</span>
            </label>
            <textarea
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Search 1910 census for Jacob Singer in Philadelphia"
              rows={3}
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] placeholder:text-[var(--color-text-muted)] resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-4 py-2 text-xs font-mono border rounded capitalize transition-colors ${
                    priority === p
                      ? p === 'high'   ? 'bg-red-50 border-red-300 text-red-700'
                      : p === 'medium' ? 'bg-amber-50 border-amber-300 text-amber-700'
                                       : 'bg-[var(--color-surface)] border-[var(--color-gold)] text-[var(--color-gold)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {persons.length > 0 && (
            <div>
              <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-2">
                Research Subject
              </label>
              <select
                value={personId}
                onChange={e => setPersonId(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
              >
                <option value="">-- No specific subject --</option>
                {persons.map(p => (
                  <option key={p.id} value={p.id}>{p.display_name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-2">
              Source Type Hint
            </label>
            <input
              type="text"
              value={sourceTypeHint}
              onChange={e => setSourceTypeHint(e.target.value)}
              placeholder="e.g. Census, Passenger manifest, Vital record"
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] placeholder:text-[var(--color-text-muted)]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional context, what you already know, why this matters..."
              rows={4}
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] placeholder:text-[var(--color-text-muted)] resize-y"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-3 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Add to Research Agenda'}
          </button>

        </div>
      </div>
    </div>
  )
}
