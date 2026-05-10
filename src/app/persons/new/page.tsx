'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewPersonPage() {
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [givenName,   setGivenName]   = useState('')
  const [surname,     setSurname]     = useState('')
  const [birthDate,   setBirthDate]   = useState('')
  const [birthPlace,  setBirthPlace]  = useState('')
  const [deathDate,   setDeathDate]   = useState('')
  const [deathPlace,  setDeathPlace]  = useState('')
  const [notes,       setNotes]       = useState('')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!displayName.trim()) { setError('Display name is required.'); return }
    setSaving(true)
    setError(null)
    try {
      const res  = await fetch('/api/persons', {
        method:  'POST',
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
      router.push(`/persons/${data.person.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]'
  const labelCls = 'block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1'

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-2xl mx-auto px-6 py-10">

        <Link href="/persons" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-3">
          &larr; Persons
        </Link>
        <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">Add Person</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          Person records are shared across all modules -- Timeline, Research Log, Case Study, and all pickers.
        </p>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">{error}</div>
        )}

        <div className="space-y-5">

          <div>
            <label className={labelCls}>Display Name *</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. Jack Singer"
              className={inputCls}
              autoFocus
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">How this person appears in every picker and list.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Given Name</label>
              <input type="text" value={givenName} onChange={e => setGivenName(e.target.value)} placeholder="e.g. Jacob" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Surname</label>
              <input type="text" value={surname} onChange={e => setSurname(e.target.value)} placeholder="e.g. Singer" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Birth Date</label>
              <input type="text" value={birthDate} onChange={e => setBirthDate(e.target.value)} placeholder="e.g. abt 1880" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Birth Place</label>
              <input type="text" value={birthPlace} onChange={e => setBirthPlace(e.target.value)} placeholder="e.g. Russia" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Death Date</label>
              <input type="text" value={deathDate} onChange={e => setDeathDate(e.target.value)} placeholder="e.g. 2 Feb 1981" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Death Place</label>
              <input type="text" value={deathPlace} onChange={e => setDeathPlace(e.target.value)} placeholder="e.g. Oakland, Bergen, New Jersey" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Research notes, alternate names, identifiers"
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Person'}
            </button>
            <Link
              href="/persons"
              className="px-6 py-2.5 border border-[var(--color-border)] text-sm font-mono text-[var(--color-text-muted)] rounded hover:border-[var(--color-gold)] transition-colors"
            >
              Cancel
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
