'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Person } from '@/types'

export default function PersonsPage() {
  const router  = useRouter()
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/persons')
      .then(r => r.json())
      .then(d => { setPersons(d.persons ?? []); setLoading(false) })
      .catch(() => { setError('Could not load persons.'); setLoading(false) })
  }, [])

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="flex items-start justify-between mb-8">
          <div>
            <Link href="/" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-3">
              &larr; Dashboard
            </Link>
            <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">Persons</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Every person in the research database. Person records are shared across all modules.
            </p>
          </div>
          <Link
            href="/persons/new"
            className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity mt-8"
          >
            + Add Person
          </Link>
        </div>

        {loading && <p className="text-sm text-[var(--color-text-muted)] py-8">Loading...</p>}

        {!loading && error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400">{error}</div>
        )}

        {!loading && !error && persons.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-[var(--color-text-muted)] mb-3">No persons yet.</p>
            <p className="text-sm text-[var(--color-text-muted)] mb-8">
              Add a person and they will appear in every module picker across the platform.
            </p>
            <Link
              href="/persons/new"
              className="px-6 py-3 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity"
            >
              Add First Person
            </Link>
          </div>
        )}

        <div className="space-y-2">
          {persons.map(p => (
            // div + onClick avoids nested <a> tags (hydration error)
            <div
              key={p.id}
              onClick={() => router.push(`/persons/${p.id}`)}
              className="flex items-center gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded hover:border-[var(--color-gold)] transition-colors cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text)]">{p.display_name}</p>
                {(p.birth_date || p.birth_place) && (
                  <p className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">
                    {[p.birth_date, p.birth_place].filter(Boolean).join(' -- ')}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link
                  href={`/timeline?person_id=${p.id}`}
                  onClick={e => e.stopPropagation()}
                  className="text-xs font-mono px-2 py-1 border border-[var(--color-border)] rounded text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors"
                >
                  Timeline
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
