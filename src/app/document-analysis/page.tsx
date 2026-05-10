'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Document } from '@/types'

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  pending:  { label: 'No transcription', className: 'text-[var(--color-text-muted)] bg-[var(--color-surface)] border-[var(--color-border)]' },
  complete: { label: 'Analysis complete', className: 'text-green-700 bg-green-50 border-green-200' },
  error:    { label: 'Error', className: 'text-red-600 bg-red-50 border-red-200' },
}

export default function DocumentAnalysisListPage() {
  const [docs,    setDocs]    = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/document-analysis')
      .then(r => r.json())
      .then(d => { setDocs(d.documents ?? []); setLoading(false) })
      .catch(() => { setError('Could not load documents. Check Supabase connection.'); setLoading(false) })
  }, [])

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="flex items-start justify-between mb-8">
          <div>
            <Link href="/" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-3">
              &larr; Dashboard
            </Link>
            <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">Document Analysis Worksheet</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Three-Layer Evidence Model applied to every document. Transcribe, extract, classify.
            </p>
          </div>
          <Link
            href="/document-analysis/new"
            className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity mt-8"
          >
            + New Worksheet
          </Link>
        </div>

        {loading && <p className="text-sm text-[var(--color-text-muted)] py-8">Loading worksheets...</p>}

        {!loading && error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">
            {error}
            <p className="text-xs mt-1 text-red-300/70">
              Run <code className="font-mono">sql/003-add-documents.sql</code> in Supabase and confirm{' '}
              <code className="font-mono">.env.local</code> values.
            </p>
          </div>
        )}

        {!loading && !error && docs.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-[var(--color-text-muted)] mb-3">No worksheets yet.</p>
            <p className="text-sm text-[var(--color-text-muted)] mb-8">
              Every document you analyze starts here. Paste the transcription, extract the facts,
              classify each claim under the Three-Layer Evidence Model.
            </p>
            <Link
              href="/document-analysis/new"
              className="px-6 py-3 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity"
            >
              Analyze First Document
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {docs.map(doc => {
            const s = STATUS_STYLE[doc.transcription_status] ?? STATUS_STYLE.pending
            return (
              <Link
                key={doc.id}
                href={`/document-analysis/${doc.id}`}
                className="block p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded hover:border-[var(--color-gold)] transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-gold)] transition-colors mb-1.5">
                      {doc.label}
                    </p>
                    {doc.source && (
                      <p className="text-xs text-[var(--color-text-muted)] font-mono mb-2 line-clamp-1">
                        Source: {doc.source.label}
                      </p>
                    )}
                    <span className={`inline-block text-xs px-2 py-0.5 border rounded font-mono ${s.className}`}>
                      {s.label}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)] font-mono shrink-0 mt-1">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {!loading && docs.length > 0 && (
          <p className="text-xs text-[var(--color-text-muted)] mt-8 text-center font-mono">
            {docs.length} worksheet{docs.length !== 1 ? 's' : ''}
          </p>
        )}

      </div>
    </div>
  )
}
