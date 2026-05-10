'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Person } from '@/types'

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params)
  const router  = useRouter()

  const [person,        setPerson]        = useState<Person | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string | null>(null)
  const [editing,       setEditing]       = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [givenName,   setGivenName]   = useState('')
  const [surname,     setSurname]     = useState('')
  const [birthDate,   setBirthDate]   = useState('')
  const [birthPlace,  setBirthPlace]  = useState('')
  const [deathDate,   setDeathDate]   = useState('')
  const [deathPlace,  setDeathPlace]  = useState('')
  const [notes,       setNotes]       = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/persons/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const p: Person = data.person
      setPerson(p)
      setDisplayName(p.display_name)
      setGivenName(p.given_name   ?? '')
      setSurname(p.surname        ?? '')
      setBirthDate(p.birth_date   ?? '')
      setBirthPlace(p.birth_place ?? '')
      setDeathDate(p.death_date   ?? '')
      setDeathPlace(p.death_place ?? '')
      setNotes(p.notes            ?? '')
    } catch {
      setError('Could not load person.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    if (!displayName.trim()) { setError('Display name is required.'); return }
    setSaving(true)
    setError(null)
    try {
      const res  = await fetch(`/api/persons/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          given_name:   givenName   || null,
          surname:      surname     || null,
          birth_date:   birthDate   || null,
          birth_place:  birthPlace  || null,
          death_date:   deathDate   || null,
          death_place:  deathPlace  || null,
          notes:        notes       || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await load()
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    try {
      await fetch(`/api/persons/${id}`, { method: 'DELETE' })
      router.push('/persons')
    } catch {
      setError('Delete failed.')
    }
  }

  const inputCls = 'w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]'
  const labelCls = 'block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1'

  if (loading) return <div className="p-10 text-sm text-[var(--color-text-muted)]">Loading...</div>
  if (!person) return <div className="p-10 text-sm text-red-400">{error ?? 'Not found.'}</div>

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-2xl mx-auto px-6 py-10">

        <Link href="/persons" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-3">
          &larr; Persons
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">{person.display_name}</h1>
            {(person.birth_date || person.birth_place) && (
              <p className="text-sm text-[var(--color-text-muted)] font-mono">
                b. {[person.birth_date, person.birth_place].filter(Boolean).join(', ')}
              </p>
            )}
            {(person.death_date || person.death_place) && (
              <p className="text-sm text-[var(--color-text-muted)] font-mono">
                d. {[person.death_date, person.death_place].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          {!editing && (
            <button
              onClick={() => { setEditing(true); setConfirmDelete(false); setError(null) }}
              className="px-4 py-2 border border-[var(--color-border)] text-sm font-mono text-[var(--color-text-muted)] rounded hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">{error}</div>
        )}

        {/* Quick links */}
        {!editing && (
          <div className="flex gap-3 mb-8">
            <Link
              href={`/timeline?person_id=${id}`}
              className="px-4 py-2 border border-[var(--color-border)] text-sm font-mono text-[var(--color-text-muted)] rounded hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors"
            >
              View Timeline
            </Link>
            <Link
              href={`/timeline/new?person_id=${id}`}
              className="px-4 py-2 border border-[var(--color-border)] text-sm font-mono text-[var(--color-text-muted)] rounded hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors"
            >
              + New Event
            </Link>
          </div>
        )}

        {/* Read-only view */}
        {!editing && (
          <div className="space-y-4">
            {person.given_name && (
              <div>
                <p className={labelCls}>Given Name</p>
                <p className="text-sm">{person.given_name}</p>
              </div>
            )}
            {person.surname && (
              <div>
                <p className={labelCls}>Surname</p>
                <p className="text-sm">{person.surname}</p>
              </div>
            )}
            {person.notes && (
              <div>
                <p className={labelCls}>Notes</p>
                <p className="text-sm text-[var(--color-text-muted)]">{person.notes}</p>
              </div>
            )}

            <div className="pt-6 border-t border-[var(--color-border)]">
              <button
                onClick={handleDelete}
                className="text-xs font-mono text-red-500 hover:text-red-400 transition-colors"
              >
                {confirmDelete ? 'Click again to confirm delete' : 'Delete person'}
              </button>
              {confirmDelete && (
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="ml-4 text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {/* Edit form */}
        {editing && (
          <div className="space-y-5">
            <div>
              <label className={labelCls}>Display Name *</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Given Name</label>
                <input type="text" value={givenName} onChange={e => setGivenName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Surname</label>
                <input type="text" value={surname} onChange={e => setSurname(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Birth Date</label>
                <input type="text" value={birthDate} onChange={e => setBirthDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Birth Place</label>
                <input type="text" value={birthPlace} onChange={e => setBirthPlace(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Death Date</label>
                <input type="text" value={deathDate} onChange={e => setDeathDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Death Place</label>
                <input type="text" value={deathPlace} onChange={e => setDeathPlace(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => { setEditing(false); setError(null) }}
                className="px-6 py-2.5 border border-[var(--color-border)] text-sm font-mono text-[var(--color-text-muted)] rounded hover:border-[var(--color-gold)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
