'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { CaseStudy } from '@/types'

const STATUS_BADGE: Record<string, string> = {
  draft:       'text-slate-400 bg-slate-400/10 border-slate-400/30',
  in_progress: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  complete:    'text-green-400 bg-green-400/10 border-green-400/30',
}
const STATUS_LABEL: Record<string, string> = { draft: 'Draft', in_progress: 'In Progress', complete: 'Complete' }
const STAGE_LABEL: Record<number, string> = {
  1: 'Stage 1: Research Question',
  2: 'Stage 2: Source Inventory',
  3: 'Stage 3: Evidence Chain',
  4: 'Stage 4: Search Checklist',
  5: 'Stage 5: Conflict Analysis',
  6: 'Stage 6: Proof Argument',
}

export default function CaseStudyListPage() {
  const [studies, setStudies] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/case-study')
      .then(r => r.json())
      .then(d => { setStudies(d.case_studies ?? []); setLoading(false) })
      .catch(() => { setError('Could not load case studies. Check Supabase connection.'); setLoading(false) })
  }, [])

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="flex items-start justify-between mb-8">
          <div>
            <Link href="/" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-3">← Dashboard</Link>
            <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">Case Study Builder</h1>
            <p className="text-sm text-[var(--color-text-muted)]">GPS-compliant proof arguments. Six stages. No naked claims.</p>
          </div>
          <Link href="/case-study/new" className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity mt-8">
            + New Case Study
          </Link>
        </div>

        {loading && <p className="text-sm text-[var(--color-text-muted)] py-8">Loading case studies...</p>}

        {!loading && error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">
            {error}
            <p className="text-xs mt-1 text-red-300/70">
              Run <code className="font-mono">sql/001-create-tables.sql</code> and{' '}
              <code className="font-mono">sql/002-add-res-checklist.sql</code> in Supabase and confirm your{' '}
              <code className="font-mono">.env.local</code> values.
            </p>
          </div>
        )}

        {!loading && !error && studies.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-[var(--color-text-muted)] mb-3">No case studies yet.</p>
            <p className="text-sm text-[var(--color-text-muted)] mb-8">
              A case study is a GPS-compliant proof argument for a specific identity, parentage, or relationship claim.
            </p>
            <Link href="/case-study/new" className="px-6 py-3 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity">
              Start First Case Study
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {studies.map(study => (
            <Link key={study.id} href={`/case-study/${study.id}`}
              className="block p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded hover:border-[var(--color-gold)]/50 transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 border rounded font-mono ${STATUS_BADGE[study.status]}`}>{STATUS_LABEL[study.status]}</span>
                    <span className="text-xs text-[var(--color-text-muted)] font-mono">{STAGE_LABEL[study.gps_stage_reached] ?? 'Stage 1'}</span>
                  </div>
                  <p className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-gold)] transition-colors mb-1">{study.subject_display}</p>
                  <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">{study.research_question}</p>
                </div>
                <span className="text-xs text-[var(--color-text-muted)] font-mono shrink-0 mt-1">
                  {new Date(study.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
