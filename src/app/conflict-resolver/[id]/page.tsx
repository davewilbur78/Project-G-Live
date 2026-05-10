'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SourceConflict, FactInDispute, Source } from '@/types'

const FACT_LABELS: Record<FactInDispute, string> = {
  birth_date:  'Birth Date',
  birth_place: 'Birth Place',
  name:        'Name / Name Spelling',
  age:         'Age at Event',
  death_date:  'Death Date',
  death_place: 'Death Place',
  residence:   'Residence / Address',
  immigration: 'Immigration / Arrival',
  marriage:    'Marriage',
  occupation:  'Occupation',
  other:       'Other',
}

const RESOLUTION_BASIS_LABELS: Record<string, string> = {
  source_quality:  'Source Quality (one source is hierarchically superior)',
  preponderance:   'Preponderance (multiple factors favor one source)',
  corroboration:   'Corroboration (a third source supports one side)',
  inconclusive:    'Inconclusive (conflict cannot be resolved with current evidence)',
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  open:        { label: 'Open',        className: 'text-amber-700 bg-amber-50 border-amber-200' },
  in_progress: { label: 'In Progress', className: 'text-blue-700 bg-blue-50 border-blue-200' },
  resolved:    { label: 'Resolved',    className: 'text-green-700 bg-green-50 border-green-200' },
}

function GpsClassification({ source }: { source: Source }) {
  const chips = [
    { label: 'Source',   value: source.source_type,   color: source.source_type === 'Original' ? 'bg-green-900/30 text-green-400' : source.source_type === 'Derivative' ? 'bg-amber-900/30 text-amber-400' : 'bg-orange-900/30 text-orange-400' },
    { label: 'Info',     value: source.info_type,     color: source.info_type === 'Primary' ? 'bg-green-900/30 text-green-400' : source.info_type === 'Secondary' ? 'bg-amber-900/30 text-amber-400' : 'bg-[var(--color-bg)] text-[var(--color-text-muted)]' },
    { label: 'Evidence', value: source.evidence_type, color: source.evidence_type === 'Direct' ? 'bg-green-900/30 text-green-400' : source.evidence_type === 'Indirect' ? 'bg-amber-900/30 text-amber-400' : 'bg-red-900/30 text-red-400' },
  ]
  return (
    <div className="flex gap-1.5 flex-wrap">
      {chips.map(c => (
        <span key={c.label} className={`text-xs font-mono px-1.5 py-0.5 rounded ${c.color}`}>
          <span className="opacity-60 text-[0.6rem] mr-0.5">{c.label.toUpperCase()}</span>
          {c.value}
        </span>
      ))}
    </div>
  )
}

const TEXTAREA = 'w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] resize-none'
const LABEL   = 'block text-xs font-mono text-[var(--color-text-muted)] mb-1'
const INPUT   = 'w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]'

export default function ConflictDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [conflict,  setConflict]  = useState<SourceConflict | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(false)

  // Editable fields
  const [analysisText,    setAnalysisText]    = useState('')
  const [resolution,      setResolution]      = useState('')
  const [resolutionBasis, setResolutionBasis] = useState('')
  const [notes,           setNotes]           = useState('')
  const [status,          setStatus]          = useState('open')

  const load = useCallback(async () => {
    try {
      const res  = await fetch(`/api/conflict-resolver/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const c = data.conflict as SourceConflict
      setConflict(c)
      setAnalysisText(c.analysis_text   ?? '')
      setResolution(c.resolution        ?? '')
      setResolutionBasis(c.resolution_basis ?? '')
      setNotes(c.notes                  ?? '')
      setStatus(c.status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conflict.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleAnalyze() {
    setAnalyzing(true)
    setError(null)
    try {
      const res  = await fetch(`/api/conflict-resolver/${id}/analyze`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // Reload the full record to get joined sources back
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res  = await fetch(`/api/conflict-resolver/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          analysis_text:    analysisText || null,
          resolution:       resolution   || null,
          resolution_basis: resolutionBasis || null,
          status,
          notes:            notes || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setConflict(prev => prev ? { ...prev, ...data.conflict } : prev)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this conflict? This cannot be undone.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/conflict-resolver/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed.')
      router.push('/conflict-resolver')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.')
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
    </div>
  )

  if (error && !conflict) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <p className="text-sm text-red-400">{error}</p>
    </div>
  )

  if (!conflict) return null

  const factLabel = FACT_LABELS[conflict.fact_in_dispute as FactInDispute] ?? conflict.fact_in_dispute
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <Link href="/conflict-resolver" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-3">
          &larr; Conflict Resolver
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl text-[var(--color-gold)] mb-2">{conflict.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-xs px-2 py-0.5 border rounded font-mono ${statusCfg.className}`}>
                {statusCfg.label}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 border border-[var(--color-border)] rounded text-[var(--color-text-muted)]">
                {factLabel}
              </span>
              {conflict.person && (
                <span className="text-xs text-[var(--color-text-muted)] font-mono">
                  {conflict.person.display_name}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-red-400 hover:text-red-300 font-mono mt-1 ml-4 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        <p className="text-sm text-[var(--color-text-muted)] mb-8">{conflict.description}</p>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">{error}</div>
        )}

        {/* Source Comparison */}
        <div className="mb-8">
          <h2 className="font-display text-lg text-[var(--color-text)] mb-4">Source Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Source A */}
            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
              <p className="text-xs font-mono text-[var(--color-gold)] uppercase tracking-widest mb-2">Source A</p>
              {conflict.source_a ? (
                <>
                  <p className="text-sm font-semibold text-[var(--color-text)] mb-2">{conflict.source_a.label}</p>
                  <GpsClassification source={conflict.source_a} />
                  <p className="text-xs font-mono text-[var(--color-text-muted)] mt-2 leading-relaxed">
                    {conflict.source_a.ee_short_citation}
                  </p>
                  {conflict.source_a_value && (
                    <div className="mt-3 p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded">
                      <p className="text-xs font-mono text-[var(--color-text-muted)] mb-0.5">Says:</p>
                      <p className="text-sm text-[var(--color-text)]">{conflict.source_a_value}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)] italic">No source selected.</p>
              )}
            </div>

            {/* Source B */}
            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
              <p className="text-xs font-mono text-[var(--color-gold)] uppercase tracking-widest mb-2">Source B</p>
              {conflict.source_b ? (
                <>
                  <p className="text-sm font-semibold text-[var(--color-text)] mb-2">{conflict.source_b.label}</p>
                  <GpsClassification source={conflict.source_b} />
                  <p className="text-xs font-mono text-[var(--color-text-muted)] mt-2 leading-relaxed">
                    {conflict.source_b.ee_short_citation}
                  </p>
                  {conflict.source_b_value && (
                    <div className="mt-3 p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded">
                      <p className="text-xs font-mono text-[var(--color-text-muted)] mb-0.5">Says:</p>
                      <p className="text-sm text-[var(--color-text)]">{conflict.source_b_value}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)] italic">No source selected.</p>
              )}
            </div>

          </div>
        </div>

        {/* Analysis */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg text-[var(--color-text)]">GPS Analysis</h2>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-3 py-1.5 text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-gold)] text-[var(--color-gold)] rounded hover:bg-[var(--color-gold-subtle)] disabled:opacity-50 transition-colors"
            >
              {analyzing ? 'Analyzing...' : 'AI Analyze'}
            </button>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">
            Write your GPS-compliant analysis, or use AI Analyze to draft one based on the source classifications above.
            AI analysis writes directly to this field and can be edited afterward.
          </p>
          <textarea
            rows={8}
            value={analysisText}
            onChange={e => setAnalysisText(e.target.value)}
            placeholder="Evaluate each source on its GPS merits: source type, information type, and evidence type. Explain which source carries more evidentiary weight and why."
            className={TEXTAREA}
          />
        </div>

        {/* Resolution */}
        <div className="mb-8 space-y-4">
          <h2 className="font-display text-lg text-[var(--color-text)]">Resolution</h2>
          <div>
            <label className={LABEL}>Conclusion</label>
            <textarea
              rows={3}
              value={resolution}
              onChange={e => setResolution(e.target.value)}
              placeholder="The specific conclusion the evidence supports. If inconclusive, state that directly."
              className={TEXTAREA}
            />
          </div>
          <div>
            <label className={LABEL}>Resolution Basis</label>
            <select
              value={resolutionBasis}
              onChange={e => setResolutionBasis(e.target.value)}
              className={INPUT}
            >
              <option value="">-- Select basis --</option>
              {Object.entries(RESOLUTION_BASIS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status + Notes + Save */}
        <div className="mb-8 space-y-4">
          <div>
            <label className={LABEL}>Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className={INPUT}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional context, related sources to check, open threads."
              className={TEXTAREA}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
