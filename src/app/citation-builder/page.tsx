'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Source, SourceType, EvidenceType } from '@/types'

const SOURCE_TYPE_BADGE: Record<SourceType, string> = {
  Original:   'text-green-400 bg-green-400/10 border-green-400/30',
  Derivative: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Authored:   'text-blue-400 bg-blue-400/10 border-blue-400/30',
}

const EVIDENCE_COLOR: Record<EvidenceType, string> = {
  Direct:   'text-emerald-400',
  Indirect: 'text-amber-400',
  Negative: 'text-slate-400',
}

export default function CitationBuilderPage() {
  const [sources, setSources]     = useState<Source[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [search, setSearch]       = useState('')
  const [filterType, setFilterType] = useState<SourceType | 'all'>('all')

  useEffect(() => {
    fetch('/api/citation-builder')
      .then(r => r.json())
      .then(data => { setSources(data.sources ?? []); setLoading(false) })
      .catch(() => { setError('Could not load sources. Check Supabase connection.'); setLoading(false) })
  }, [])

  const filtered = sources.filter(s => {
    const matchSearch =
      s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.ee_full_citation.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || s.source_type === filterType
    return matchSearch && matchType
  })

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <Link
              href="/"
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-3"
            >
              ← Dashboard
            </Link>
            <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">
              Source Library
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Every source. Every citation. EE format throughout.
            </p>
          </div>
          <Link
            href="/citation-builder/new"
            className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity mt-8"
          >
            + New Source
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search sources or citations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]"
          />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as SourceType | 'all')}
            className="px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)]"
          >
            <option value="all">All source types</option>
            <option value="Original">Original</option>
            <option value="Derivative">Derivative</option>
            <option value="Authored">Authored</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-sm text-[var(--color-text-muted)] py-8">Loading sources...</p>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">
            {error}
            <p className="text-xs mt-1 text-red-300/70">
              Run <code className="font-mono">sql/001-create-tables.sql</code> in
              Supabase and confirm your <code className="font-mono">.env.local</code> values.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-[var(--color-text-muted)] mb-3">
              {search || filterType !== 'all' ? 'No matching sources.' : 'No sources yet.'}
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mb-8">
              Every factual claim requires a citation. Add your first source.
            </p>
            {!search && filterType === 'all' && (
              <Link
                href="/citation-builder/new"
                className="px-6 py-3 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity"
              >
                Add First Source
              </Link>
            )}
          </div>
        )}

        {/* Source list */}
        <div className="space-y-3">
          {filtered.map(source => (
            <Link
              key={source.id}
              href={`/citation-builder/${source.id}`}
              className="block p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded hover:border-[var(--color-gold)]/50 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 border rounded font-mono ${
                        SOURCE_TYPE_BADGE[source.source_type]
                      }`}
                    >
                      {source.source_type}
                    </span>
                    <span className={`text-xs font-mono ${EVIDENCE_COLOR[source.evidence_type]}`}>
                      {source.evidence_type}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] font-mono">
                      {source.info_type} info
                    </span>
                  </div>
                  <p className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-gold)] transition-colors mb-1">
                    {source.label}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] font-mono leading-relaxed line-clamp-2">
                    {source.ee_full_citation}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && filtered.length > 0 && (
          <p className="text-xs text-[var(--color-text-muted)] mt-8 text-center">
            {filtered.length} source{filtered.length !== 1 ? 's' : ''}
          </p>
        )}

      </div>
    </div>
  )
}
