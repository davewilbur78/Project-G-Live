'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import type { Document, DocumentFact, SourceType, InfoType, EvidenceType } from '@/types'

interface Props { params: Promise<{ id: string }> }

const SOURCE_TYPE_OPTS: SourceType[]  = ['Original', 'Derivative', 'Authored']
const INFO_TYPE_OPTS:   InfoType[]    = ['Primary', 'Secondary', 'Undetermined', 'N/A']
const EVIDENCE_TYPE_OPTS: EvidenceType[] = ['Direct', 'Indirect', 'Negative']

const EVIDENCE_BADGE: Record<EvidenceType, string> = {
  Direct:   'text-green-700 bg-green-50 border-green-200',
  Indirect: 'text-amber-700 bg-amber-50 border-amber-200',
  Negative: 'text-slate-600 bg-slate-50 border-slate-200',
}

const INFO_BADGE: Record<InfoType, string> = {
  Primary:       'text-blue-700 bg-blue-50 border-blue-200',
  Secondary:     'text-purple-700 bg-purple-50 border-purple-200',
  Undetermined:  'text-slate-500 bg-slate-50 border-slate-200',
  'N/A':         'text-slate-400 bg-slate-50 border-slate-100',
}

// ---- empty fact form
const EMPTY_FACT = {
  claim_text:    '',
  source_type:   'Original' as SourceType,
  info_type:     'Primary'  as InfoType,
  evidence_type: 'Direct'   as EvidenceType,
  notes:         '',
}

export default function DocumentWorksheetPage({ params }: Props) {
  const { id } = use(params)
  const [doc,          setDoc]          = useState<Document | null>(null)
  const [facts,        setFacts]        = useState<DocumentFact[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  // Transcription editing
  const [editingText,  setEditingText]  = useState(false)
  const [transcription, setTranscription] = useState('')
  const [savingText,   setSavingText]   = useState(false)

  // AI fact extraction
  const [extracting,   setExtracting]   = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)

  // Manual fact form
  const [showFactForm, setShowFactForm] = useState(false)
  const [factForm,     setFactForm]     = useState(EMPTY_FACT)
  const [savingFact,   setSavingFact]   = useState(false)
  const [factError,    setFactError]    = useState<string | null>(null)

  // Inline fact editing
  const [editingFactId, setEditingFactId] = useState<string | null>(null)
  const [editFactForm,  setEditFactForm]  = useState(EMPTY_FACT)

  // ---- load document + facts
  const load = useCallback(async () => {
    const [docRes, factsRes] = await Promise.all([
      fetch(`/api/document-analysis/${id}`),
      fetch(`/api/document-analysis/${id}/facts`),
    ])
    const docData   = await docRes.json()
    const factsData = await factsRes.json()
    if (!docRes.ok || docData.error) { setError(docData.error ?? 'Not found'); setLoading(false); return }
    setDoc(docData.document)
    setTranscription(docData.document.transcription ?? '')
    setFacts(factsData.facts ?? [])
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  // ---- save transcription
  async function saveTranscription() {
    setSavingText(true)
    const res  = await fetch(`/api/document-analysis/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcription }),
    })
    const data = await res.json()
    if (res.ok) { setDoc(data.document); setEditingText(false) }
    setSavingText(false)
  }

  // ---- extract facts with AI
  async function extractFacts() {
    setExtracting(true); setExtractError(null)
    const res  = await fetch(`/api/document-analysis/${id}/extract-facts`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      setExtractError(data.error ?? 'Extraction failed.')
    } else {
      setFacts(prev => {
        const manual = prev.filter(f => !f.ai_generated)
        return [...manual, ...(data.facts ?? [])].sort((a, b) => a.display_order - b.display_order)
      })
    }
    setExtracting(false)
  }

  // ---- add manual fact
  async function addFact() {
    if (!factForm.claim_text.trim()) { setFactError('Claim text is required.'); return }
    setSavingFact(true); setFactError(null)
    const res  = await fetch(`/api/document-analysis/${id}/facts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(factForm),
    })
    const data = await res.json()
    if (!res.ok) { setFactError(data.error ?? 'Save failed.'); setSavingFact(false); return }
    setFacts(prev => [...prev, data.fact])
    setFactForm(EMPTY_FACT)
    setShowFactForm(false)
    setSavingFact(false)
  }

  // ---- save inline fact edit
  async function saveFactEdit(factId: string) {
    const res  = await fetch(`/api/document-analysis/${id}/facts/${factId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editFactForm),
    })
    const data = await res.json()
    if (res.ok) {
      setFacts(prev => prev.map(f => f.id === factId ? data.fact : f))
      setEditingFactId(null)
    }
  }

  // ---- delete fact
  async function deleteFact(factId: string) {
    if (!confirm('Delete this fact?')) return
    await fetch(`/api/document-analysis/${id}/facts/${factId}`, { method: 'DELETE' })
    setFacts(prev => prev.filter(f => f.id !== factId))
  }

  // ---- render guards
  if (loading) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <p className="text-sm text-[var(--color-text-muted)]">Loading worksheet...</p>
    </div>
  )

  if (error || !doc) return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/document-analysis" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-6">
          &larr; Document Worksheets
        </Link>
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400">{error ?? 'Worksheet not found.'}</div>
      </div>
    </div>
  )

  // ---- main render
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <Link href="/document-analysis" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-3">
            &larr; Document Worksheets
          </Link>
          <h1 className="font-display text-3xl text-[var(--color-gold)] mb-2">{doc.label}</h1>

          {/* Linked source panel */}
          {doc.source ? (
            <div className="mt-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
              <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Linked Source</p>
              <p className="font-semibold text-sm mb-1">{doc.source.label}</p>
              <div className="flex gap-3 flex-wrap text-xs font-mono mb-2">
                <span className="text-green-700">{doc.source.source_type}</span>
                <span className="text-[var(--color-text-muted)]">{doc.source.info_type} information</span>
                <span className="text-[var(--color-text-muted)]">{doc.source.evidence_type} evidence</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] font-mono leading-relaxed">
                {doc.source.ee_full_citation}
              </p>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text-muted)]">
              No source linked.{' '}
              <Link href="/citation-builder/new" className="text-[var(--color-gold)] hover:underline">
                Add a source to Citation Builder
              </Link>{' '}
              then edit this worksheet to link it. Fact extraction works best with a linked source.
            </div>
          )}
        </div>

        {/* ---- SECTION 1: Transcription ---- */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl">Transcription</h2>
            {!editingText && (
              <button
                onClick={() => setEditingText(true)}
                className="text-xs text-[var(--color-gold)] hover:underline"
              >
                {doc.transcription ? 'Edit' : 'Add transcription'}
              </button>
            )}
          </div>

          {editingText ? (
            <div>
              <textarea
                rows={14}
                value={transcription}
                onChange={e => setTranscription(e.target.value)}
                placeholder="Paste or type the full text of the document here. For handwritten documents, transcribe as accurately as possible, using [illegible] for words you cannot read."
                className="w-full px-3 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm font-mono leading-relaxed focus:outline-none focus:border-[var(--color-gold)] resize-none"
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={saveTranscription}
                  disabled={savingText}
                  className="px-5 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {savingText ? 'Saving...' : 'Save Transcription'}
                </button>
                <button
                  onClick={() => { setEditingText(false); setTranscription(doc.transcription ?? '') }}
                  className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : doc.transcription ? (
            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
              <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap">{doc.transcription}</p>
            </div>
          ) : (
            <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] border-dashed rounded text-center">
              <p className="text-sm text-[var(--color-text-muted)] mb-2">No transcription yet.</p>
              <button
                onClick={() => setEditingText(true)}
                className="text-sm text-[var(--color-gold)] hover:underline"
              >
                Add transcription text
              </button>
            </div>
          )}
        </section>

        {/* ---- SECTION 2: Fact Extraction ---- */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display text-xl mb-0.5">Extracted Facts</h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Each claim classified under the Three-Layer Evidence Model.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {doc.transcription && (
                <button
                  onClick={extractFacts}
                  disabled={extracting}
                  className="px-4 py-2 text-sm border border-[var(--color-gold)] text-[var(--color-gold)] rounded hover:bg-[var(--color-gold-subtle)] transition-colors disabled:opacity-50"
                >
                  {extracting ? 'Extracting...' : facts.length > 0 ? 'Re-extract with AI' : 'Extract with AI'}
                </button>
              )}
              <button
                onClick={() => { setShowFactForm(true); setFactError(null); setFactForm(EMPTY_FACT) }}
                className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity"
              >
                + Add Manually
              </button>
            </div>
          </div>

          {extractError && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-4">
              {extractError}
            </div>
          )}

          {/* Manual add form */}
          {showFactForm && (
            <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-gold)] rounded mb-4">
              <p className="text-sm font-semibold mb-4">New Fact</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                    Claim <span className="text-[var(--color-gold)]">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={factForm.claim_text}
                    onChange={e => setFactForm(f => ({ ...f, claim_text: e.target.value }))}
                    placeholder="State the discrete factual claim in your own words."
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)] resize-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Source Type</label>
                    <select
                      value={factForm.source_type}
                      onChange={e => setFactForm(f => ({ ...f, source_type: e.target.value as SourceType }))}
                      className="w-full px-2 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)]"
                    >
                      {SOURCE_TYPE_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Information</label>
                    <select
                      value={factForm.info_type}
                      onChange={e => setFactForm(f => ({ ...f, info_type: e.target.value as InfoType }))}
                      className="w-full px-2 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)]"
                    >
                      {INFO_TYPE_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Evidence</label>
                    <select
                      value={factForm.evidence_type}
                      onChange={e => setFactForm(f => ({ ...f, evidence_type: e.target.value as EvidenceType }))}
                      className="w-full px-2 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)]"
                    >
                      {EVIDENCE_TYPE_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    value={factForm.notes}
                    onChange={e => setFactForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Brief explanation of your classification"
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)]"
                  />
                </div>
                {factError && <p className="text-xs text-red-400">{factError}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={addFact}
                    disabled={savingFact}
                    className="px-5 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 disabled:opacity-50"
                  >
                    {savingFact ? 'Saving...' : 'Add Fact'}
                  </button>
                  <button
                    onClick={() => { setShowFactForm(false); setFactError(null) }}
                    className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fact list */}
          {facts.length === 0 && !showFactForm && (
            <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] border-dashed rounded text-center">
              <p className="text-sm text-[var(--color-text-muted)]">
                {doc.transcription
                  ? 'Click "Extract with AI" to classify the claims in this document, or add facts manually.'
                  : 'Add a transcription first, then extract or manually enter facts.'}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {facts.map((fact, i) => (
              <div
                key={fact.id}
                className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded"
              >
                {editingFactId === fact.id ? (
                  <div className="space-y-3">
                    <textarea
                      rows={2}
                      value={editFactForm.claim_text}
                      onChange={e => setEditFactForm(f => ({ ...f, claim_text: e.target.value }))}
                      className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)] resize-none"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <select
                        value={editFactForm.source_type}
                        onChange={e => setEditFactForm(f => ({ ...f, source_type: e.target.value as SourceType }))}
                        className="px-2 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)]"
                      >
                        {SOURCE_TYPE_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <select
                        value={editFactForm.info_type}
                        onChange={e => setEditFactForm(f => ({ ...f, info_type: e.target.value as InfoType }))}
                        className="px-2 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)]"
                      >
                        {INFO_TYPE_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <select
                        value={editFactForm.evidence_type}
                        onChange={e => setEditFactForm(f => ({ ...f, evidence_type: e.target.value as EvidenceType }))}
                        className="px-2 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)]"
                      >
                        {EVIDENCE_TYPE_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={editFactForm.notes}
                      onChange={e => setEditFactForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Notes (optional)"
                      className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)]"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => saveFactEdit(fact.id)}
                        className="px-4 py-1.5 bg-[var(--color-gold)] text-[var(--color-bg)] text-xs font-semibold rounded hover:opacity-90"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingFactId(null)}
                        className="px-3 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="font-mono text-xs text-[var(--color-text-muted)] mt-0.5 flex-shrink-0 w-5 text-right">
                          {i + 1}
                        </span>
                        <p className="text-sm leading-relaxed">{fact.claim_text}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingFactId(fact.id)
                            setEditFactForm({
                              claim_text:    fact.claim_text,
                              source_type:   fact.source_type,
                              info_type:     fact.info_type,
                              evidence_type: fact.evidence_type,
                              notes:         fact.notes ?? '',
                            })
                          }}
                          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteFact(fact.id)}
                          className="text-xs text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap ml-8">
                      <span className="text-xs px-2 py-0.5 border rounded font-mono text-green-700 bg-green-50 border-green-200">
                        {fact.source_type}
                      </span>
                      <span className={`text-xs px-2 py-0.5 border rounded font-mono ${INFO_BADGE[fact.info_type]}`}>
                        {fact.info_type}
                      </span>
                      <span className={`text-xs px-2 py-0.5 border rounded font-mono ${EVIDENCE_BADGE[fact.evidence_type]}`}>
                        {fact.evidence_type}
                      </span>
                      {fact.ai_generated && (
                        <span className="text-xs px-2 py-0.5 border rounded font-mono text-[var(--color-text-muted)] border-[var(--color-border)]">
                          AI
                        </span>
                      )}
                    </div>

                    {fact.notes && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-2 ml-8 italic">{fact.notes}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {facts.length > 0 && (
            <p className="text-xs text-[var(--color-text-muted)] mt-4 font-mono">
              {facts.length} fact{facts.length !== 1 ? 's' : ''} &mdash;{' '}
              {facts.filter(f => f.ai_generated).length} AI-generated,{' '}
              {facts.filter(f => !f.ai_generated).length} manual
            </p>
          )}
        </section>

      </div>
    </div>
  )
}
