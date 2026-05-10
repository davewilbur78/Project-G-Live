'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { ResearchSession } from '@/types'

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  draft:    { label: 'Draft',    className: 'text-[var(--color-text-muted)] bg-[var(--color-surface)] border-[var(--color-border)]' },
  complete: { label: 'Complete', className: 'text-green-700 bg-green-50 border-green-200' },
}

export default function ResearchLogListPage() {
  const [sessions, setSessions] = useState<ResearchSession[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/research-log')
      .then(r => r.json())
      .then(d => { setSessions(d.sessions ?? []); setLoading(false) })
      .catch(() => { setError('Could not load sessions. Check Supabase connection.'); setLoading(false) })
  }, [])

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="flex items-start justify-between mb-8">
          <div>
            <Link href="/" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-3">
              &larr; Dashboard
            </Link>
            <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">Research Log</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Auditable record of every research session -- what was searched, found, and not found.
            </p>
          </div>
          <Link
            href="/research-log/new"
            className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity mt-8"
          >
            + New Session
          </Link>
        </div>

        {loading && <p className="text-sm text-[var(--color-text-muted)] py-8">Loading sessions...</p>}

        {!loading && error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">
            {error}
            <p className="text-xs mt-1 text-red-300/70">
              Run <code className="font-mono">sql/004-add-research-log.sql</code> in Supabase and confirm{' '}
              <code className="font-mono">.env.local</code> values.
            </p>
          </div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-[var(--color-text-muted)] mb-3">No sessions yet.</p>
            <p className="text-sm text-[var(--color-text-muted)] mb-8">
              Every research session goes here. Log what you searched, what you found,
              and -- crucially -- what yielded nothing. Negative evidence is GPS evidence.
            </p>
            <Link
              href="/research-log/new"
              className="px-6 py-3 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity"
            >
              Log First Session
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {sessions.map(session => {
            const s = STATUS_STYLE[session.status] ?? STATUS_STYLE.draft
            return (
              <Link
                key={session.id}
                href={`/research-log/${session.id}`}
                className="block p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded hover:border-[var(--color-gold)] transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-gold)] transition-colors mb-1.5">
                      {session.title}
                    </p>
                    {session.person && (
                      <p className="text-xs text-[var(--color-text-muted)] mb-1.5">
                        Subject: {session.person.display_name}
                      </p>
                    )}
                    <p className="text-xs text-[var(--color-text-muted)] font-mono mb-2 line-clamp-2">
                      Goal: {session.goal}
                    </p>
                    <span className={`inline-block text-xs px-2 py-0.5 border rounded font-mono ${s.className}`}>
                      {s.label}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)] font-mono shrink-0 mt-1">
                    {new Date(session.session_date + 'T00:00:00').toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {!loading && sessions.length > 0 && (
          <p className="text-xs text-[var(--color-text-muted)] mt-8 text-center font-mono">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </p>
        )}

      </div>
    </div>
  )
}
