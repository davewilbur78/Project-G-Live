'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { SourceConflict, FactInDispute } from '@/types'

const FACT_LABELS: Record<FactInDispute, string> = {
  birth_date:  'Birth Date',
  birth_place: 'Birth Place',
  name:        'Name / Spelling',
  age:         'Age at Event',
  death_date:  'Death Date',
  death_place: 'Death Place',
  residence:   'Residence / Address',
  immigration: 'Immigration / Arrival',
  marriage:    'Marriage',
  occupation:  'Occupation',
  other:       'Other',
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  open:        { label: 'Open',        className: 'text-amber-700 bg-amber-50 border-amber-200' },
  in_progress: { label: 'In Progress', className: 'text-blue-700 bg-blue-50 border-blue-200' },
  resolved:    { label: 'Resolved',    className: 'text-green-700 bg-green-50 border-green-200' },
}

export default function ConflictListPage() {
  const [conflicts, setConflicts] = useState<SourceConflict[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [filter,    setFilter]    = useState<'unresolved' | 'resolved' | 'all'>('unresolved')

  const load = useCallback(async () => {
    try {
      const res  = await fetch('/api/conflict-resolver')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setConflicts(data.conflicts ?? [])
    } catch {
      setError('Could not load conflicts. Check Supabase connection or run sql/007-add-source-conflicts.sql.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const visible = conflicts.filter(c => {
    if (filter === 'unresolved') return c.status !== 'resolved'
    if (filter === 'resolved')   return c.status === 'resolved'
    return true
  })

  const openCount     = conflicts.filter(c => c.status === 'open').length
  const inProgCount   = conflicts.filter(c => c.status === 'in_progress').length
  const resolvedCount = conflicts.filter(c => c.status === 'resolved').length

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <Link href="/" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-3">
              &larr; Dashboard
            </Link>
            <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">Source Conflict Resolver</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              GPS-compliant analysis when two sources disagree on the same fact.
            </p>
          </div>
          <Link
            href="/conflict-resolver/new"
            className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity mt-8"
          >
            + New Conflict
          </Link>
        </div>

        {/* Stats bar */}
        {!loading && !error && conflicts.length > 0 && (
          <div className="flex gap-6 mb-6 font-mono text-xs text-[var(--color-text-muted)]">
            <span>{openCount} open</span>
            <span>{inProgCount} in progress</span>
            <span>{resolvedCount} resolved</span>
          </div>
        )}

        {/* Filter tabs */}
        {!loading && !error && conflicts.length > 0 && (
          <div className="flex gap-1 mb-6">
            {(['unresolved', 'resolved', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors ${
                  filter === f
                    ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold-subtle)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]'
                }`}
              >
                {f === 'unresolved' ? 'Active' : f === 'resolved' ? 'Resolved' : 'All'}
              </button>
            ))}
          </div>
        )}

        {loading && <p className="text-sm text-[var(--color-text-muted)] py-8">Loading conflicts...</p>}

        {!loading && error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">
            {error}
          </div>
        )}

        {!loading && !error && conflicts.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-[var(--color-text-muted)] mb-3">No conflicts recorded.</p>
            <p className="text-sm text-[var(--color-text-muted)] mb-8">
              When two sources disagree on the same fact, record it here and work through a GPS analysis.
            </p>
            <Link
              href="/conflict-resolver/new"
              className="px-6 py-3 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity"
            >
              Record First Conflict
            </Link>
          </div>
        )}

        {!loading && !error && visible.length === 0 && conflicts.length > 0 && (
          <p className="text-sm text-[var(--color-text-muted)] py-8 text-center">No items in this view.</p>
        )}

        <div className="space-y-3">
          {visible.map(c => {
            const s = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.open
            const factLabel = FACT_LABELS[c.fact_in_dispute as FactInDispute] ?? c.fact_in_dispute
            return (
              <Link
                key={c.id}
                href={`/conflict-resolver/${c.id}`}
                className="block p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded hover:border-[var(--color-gold)] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-[var(--color-text)]">{c.title}</span>
                      <span className={`text-xs px-2 py-0.5 border rounded font-mono ${s.className}`}>
                        {s.label}
                      </span>
                      <span className="text-xs px-2 py-0.5 border border-[var(--color-border)] rounded font-mono text-[var(--color-text-muted)]">
                        {factLabel}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-2 line-clamp-2">{c.description}</p>
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-text-muted)] flex-wrap">
                      {c.source_a && (
                        <span className="truncate max-w-[220px]" title={c.source_a.label}>
                          {c.source_a.label}
                        </span>
                      )}
                      <span className="text-[var(--color-gold)] font-bold">vs.</span>
                      {c.source_b && (
                        <span className="truncate max-w-[220px]" title={c.source_b.label}>
                          {c.source_b.label}
                        </span>
                      )}
                      {c.person && (
                        <span className="ml-auto text-[var(--color-text-muted)]">{c.person.display_name}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

      </div>
    </div>
  )
}
