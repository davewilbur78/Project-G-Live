'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Person } from '@/types'

export default function NewResearchSessionPage() {
  const router = useRouter()

  const [persons,     setPersons]     = useState<Person[]>([])
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [title,       setTitle]       = useState('')
  const [goal,        setGoal]        = useState('')
  const [personId,    setPersonId]    = useState('')
  const [notes,       setNotes]       = useState('')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  useEffect(() => {
    // Load persons for the subject dropdown -- optional, suppress errors gracefully
    fetch('/api/persons')
      .then(r => r.json())
      .then(d => setPersons(d.persons ?? []))
      .catch(() => {})
  }, [])

  async function handleSubmit() {
    setError(null)
    if (!title.trim())       { setError('Title is required.'); return }
    if (!goal.trim())        { setError('Research goal is required.'); return }
    if (!sessionDate.trim()) { setError('Session date is required.'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/research-log', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          session_date: sessionDate,
          title:        title.trim(),
          goal:         goal.trim(),
          person_id:    personId || null,
          notes:        notes.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create session')
      router.push(`/research-log/${data.session.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-2xl mx-auto px-6 py-10">

        <Link href="/research-log" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-6">
          &larr; Research Log
        </Link>

        <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">New Research Session</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          Log this research session. You can add sources and detailed notes after creating the record.
        </p>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">

          {/* Session date */}
          <div>
            <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-2">
              Session Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-2">
              Session Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. 1920 Census search for Jacob Singer in New York"
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] placeholder:text-[var(--color-text-muted)]"
            />
          </div>

          {/* Research goal */}
          <div>
            <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-2">
              Research Goal <span className="text-red-400">*</span>
            </label>
            <textarea
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="State the specific question this session is trying to answer."
              rows={3}
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] placeholder:text-[var(--color-text-muted)] resize-y"
            />
          </div>

          {/* Subject person */}
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

          {/* Freeform notes */}
          <div>
            <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest mb-2">
              Session Notes
            </label>
            <p className="text-xs text-[var(--color-text-muted)] mb-2">
              Optional. Paste a research conversation, bullet notes, or any freeform text.
              After saving, the AI can structure these into finds, negatives, and follow-up actions.
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Paste notes, a research conversation, or bullet points from this session..."
              rows={8}
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] placeholder:text-[var(--color-text-muted)] resize-y font-mono"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-3 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Creating session...' : 'Create Session'}
          </button>

        </div>
      </div>
    </div>
  )
}
