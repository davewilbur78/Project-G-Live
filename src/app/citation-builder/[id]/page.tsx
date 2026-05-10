'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
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

export default function SourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [source, setSource]   = useState<Source | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [edits, setEdits]     = useState<Partial<Source>>({})
  const [saving, setSaving]   = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [copied, setCopied]   = useState<'full' | 'short' | null>(null)

  useEffect(() => {
    fetch(`/api/citation-builder/${id}`)
      .then(r => r.json())
      .then(data => { setSource(data.source); setLoading(false) })
      .catch(() => { setError('Could not load source.'); setLoading(false) })
  }, [id])

  const save = async () => {
    setSaving(true); setSaveError(null)
    try {
      const res = await fetch(`/api/citation-builder/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edits),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = await res.json()
      setSource(data.source)
      setEditMode(false)
      setEdits({})
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const copy = (text: string, which: 'full' | 'short') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(which)
      setTimeout(() => setCopied(null), 1800)
    })
  }

  // ---- loading / error states ----------------------------------------

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <p className="text-[var(--color-text-muted)] text-sm">Loading source...</p>
    </div>
  )

  if (error || !source) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-center px-6">
      <div>
        <p className="text-red-400 text-sm mb-4">{error ?? 'Source not found.'}</p>
        <Link href="/citation-builder" className="text-xs text-[var(--color-gold)] hover:underline">
          \u2190 Source Library
        </Link>
      </div>
    </div>
  )

  // ---- main render ---------------------------------------------------

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Back link */}
        <Link
          href="/citation-builder"
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-6"
        >
          \u2190 Source Library
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          {editMode ? (
            <input
              type="text"
              defaultValue={source.label}
              onChange={e => setEdits(ed => ({ ...ed, label: e.target.value }))}
              className="flex-1 font-display text-2xl bg-transparent border-b border-[var(--color-gold)] focus:outline-none pb-1"
            />
          ) : (
            <h1 className="font-display text-2xl text-[var(--color-gold)] flex-1">
              {source.label}
            </h1>
          )}
          <div className="flex gap-2">
            {editMode ? (
              <>
                <button
                  onClick={() => { setEditMode(false); setEdits({}) }}
                  className="text-xs px-3 py-1.5 border border-[var(--color-border)] rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="text-xs px-4 py-1.5 bg-[var(--color-gold)] text-[var(--color-bg)] rounded font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="text-xs px-3 py-1.5 border border-[var(--color-border)] rounded text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-text)] transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* GPS Classification badges */}
        <div className="flex gap-3 flex-wrap text-xs font-mono mb-8">
          <span className={`px-2.5 py-1 border rounded ${SOURCE_TYPE_BADGE[source.source_type]}`}>
            {source.source_type}
          </span>
          <span className={`px-2.5 py-1 ${EVIDENCE_COLOR[source.evidence_type]}`}>
            {source.evidence_type} evidence
          </span>
          <span className="text-[var(--color-text-muted)] px-2.5 py-1">
            {source.info_type} information
          </span>
        </div>

        {/* Citations */}
        <div className="space-y-6 mb-8">

          {/* Full citation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Full citation
              </p>
              <button
                onClick={() => copy(source.ee_full_citation, 'full')}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
              >
                {copied === 'full' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {editMode ? (
              <textarea
                rows={6}
                defaultValue={source.ee_full_citation}
                onChange={e => setEdits(ed => ({ ...ed, ee_full_citation: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm font-mono leading-relaxed focus:outline-none focus:border-[var(--color-gold)] resize-none"
              />
            ) : (
              <p className="text-sm font-mono leading-relaxed p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
                {source.ee_full_citation}
              </p>
            )}
          </div>

          {/* Short citation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Short reference note
              </p>
              <button
                onClick={() => copy(source.ee_short_citation, 'short')}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
              >
                {copied === 'short' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {editMode ? (
              <textarea
                rows={3}
                defaultValue={source.ee_short_citation}
                onChange={e => setEdits(ed => ({ ...ed, ee_short_citation: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm font-mono leading-relaxed focus:outline-none focus:border-[var(--color-gold)] resize-none"
              />
            ) : (
              <p className="text-sm font-mono leading-relaxed p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
                {source.ee_short_citation}
              </p>
            )}
          </div>
        </div>

        {/* Identifiers */}
        {[source.repository, source.collection, source.ark_identifier, source.nara_series, source.ancestry_url]
          .some(Boolean) && (
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
              Identifiers
            </p>
            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded space-y-2.5">
              {[
                { label: 'Repository',      val: source.repository },
                { label: 'Collection',      val: source.collection },
                { label: 'ARK identifier',  val: source.ark_identifier },
                { label: 'NARA series',     val: source.nara_series },
                { label: 'Ancestry URL',    val: source.ancestry_url },
              ].filter(f => f.val).map(f => (
                <div key={f.label} className="flex gap-4 text-sm">
                  <span className="text-[var(--color-text-muted)] text-xs min-w-[130px] flex-shrink-0">
                    {f.label}
                  </span>
                  <span className="text-[var(--color-text)] font-mono text-xs break-all">
                    {f.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save error */}
        {saveError && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">
            {saveError}
          </div>
        )}

        {/* Added date */}
        <p className="text-xs text-[var(--color-text-muted)]">
          Added {new Date(source.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>

      </div>
    </div>
  )
}
