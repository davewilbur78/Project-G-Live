'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CaseStudySource, Source, TriageStatus } from '@/types'

interface Props { caseStudyId: string; onAdvance: () => void }

const TRIAGE_COLOR: Record<TriageStatus, string> = {
  GREEN:  'text-green-400 bg-green-400/10 border-green-400/30',
  YELLOW: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  RED:    'text-red-400 bg-red-400/10 border-red-400/30',
}
const TRIAGE_LABEL: Record<TriageStatus, string> = {
  GREEN:  'Fully cited and usable',
  YELLOW: 'Cited but content not yet transcribed',
  RED:    'Missing, unlocated, or absence explained',
}

export function Stage2SourceInventory({ caseStudyId, onAdvance }: Props) {
  const [caseSrc,      setCaseSrc]      = useState<CaseStudySource[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [showAdd,      setShowAdd]      = useState(false)
  const [globalSrc,    setGlobalSrc]    = useState<Source[]>([])
  const [globalLoad,   setGlobalLoad]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [selected,     setSelected]     = useState<Source | null>(null)
  const [triage,       setTriage]       = useState<TriageStatus>('GREEN')
  const [nameRec,      setNameRec]      = useState('')
  const [notes,        setNotes]        = useState('')
  const [adding,       setAdding]       = useState(false)

  const load = useCallback(async () => {
    const res = await fetch(`/api/case-study/${caseStudyId}/sources`)
    const d   = await res.json()
    if (!res.ok) { setError(d.error); setLoading(false); return }
    setCaseSrc(d.sources ?? []); setLoading(false)
  }, [caseStudyId])

  useEffect(() => { load() }, [load])

  async function openAdd() {
    setShowAdd(true); setGlobalLoad(true)
    const res = await fetch('/api/citation-builder')
    const d   = await res.json()
    setGlobalSrc(d.sources ?? []); setGlobalLoad(false)
  }

  async function addSource() {
    if (!selected) return
    setAdding(true)
    const res = await fetch(`/api/case-study/${caseStudyId}/sources`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_id: selected.id, triage_status: triage, name_recorded: nameRec || null, notes: notes || null, display_order: caseSrc.length }),
    })
    if (res.ok) { await load(); setShowAdd(false); setSelected(null); setNameRec(''); setNotes(''); setTriage('GREEN') }
    setAdding(false)
  }

  async function updateTriage(id: string, t: TriageStatus) {
    await fetch(`/api/case-study/${caseStudyId}/sources/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ triage_status: t }),
    })
    setCaseSrc(prev => prev.map(s => s.id === id ? { ...s, triage_status: t } : s))
  }

  async function remove(id: string) {
    if (!confirm('Remove this source from the case study?')) return
    await fetch(`/api/case-study/${caseStudyId}/sources/${id}`, { method: 'DELETE' })
    setCaseSrc(prev => prev.filter(s => s.id !== id))
  }

  const addedIds = new Set(caseSrc.map(cs => cs.source_id))
  const filtered = globalSrc
    .filter(s => !addedIds.has(s.id))
    .filter(s => !search || s.label.toLowerCase().includes(search.toLowerCase()) || s.ee_full_citation.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-1">GPS Stage 2 of 6</p>
        <h2 className="font-display text-2xl text-[var(--color-text)] mb-2">Source Inventory and Triage</h2>
        <p className="text-sm text-[var(--color-text-muted)]">Catalog every source relevant to this case study. Triage each one. Every source that will be cited in the proof argument must appear here, including negative-evidence sources.</p>
      </div>

      {error && <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400">{error}</div>}
      {loading && <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>}

      {!loading && (
        <>
          {caseSrc.length === 0 && !showAdd && (
            <div className="text-center py-16 border border-dashed border-[var(--color-border)] rounded">
              <p className="text-sm text-[var(--color-text-muted)] mb-6">No sources added yet. Pull from your Citation Builder library.</p>
              <button onClick={openAdd} className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90">+ Add Source from Library</button>
            </div>
          )}

          {caseSrc.length > 0 && (
            <div className="space-y-3">
              {caseSrc.map((cs, idx) => (
                <div key={cs.id} className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs text-[var(--color-text-muted)] pt-1 w-5 shrink-0 text-right">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-semibold text-sm text-[var(--color-text)]">{cs.source?.label}</p>
                        <button onClick={() => remove(cs.id)} className="text-xs text-[var(--color-text-muted)] hover:text-red-400 shrink-0">Remove</button>
                      </div>
                      {cs.source && (
                        <div className="flex gap-3 flex-wrap mb-2">
                          <span className="font-mono text-xs text-[var(--color-text-muted)]">{cs.source.source_type}</span>
                          <span className="font-mono text-xs text-[var(--color-text-muted)]">{cs.source.evidence_type}</span>
                          <span className="font-mono text-xs text-[var(--color-text-muted)]">{cs.source.info_type} info</span>
                        </div>
                      )}
                      {cs.name_recorded && <p className="text-xs text-[var(--color-text-muted)] mb-2">Recorded as: {cs.name_recorded}</p>}
                      <div className="flex gap-2 flex-wrap items-center mt-3">
                        {(['GREEN', 'YELLOW', 'RED'] as TriageStatus[]).map(t => (
                          <button key={t} onClick={() => updateTriage(cs.id, t)}
                            className={`text-xs px-2 py-0.5 border rounded font-mono transition-colors ${
                              cs.triage_status === t ? TRIAGE_COLOR[t] : 'text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
                            }`}>{t}</button>
                        ))}
                        <span className="text-xs text-[var(--color-text-muted)] font-mono">{TRIAGE_LABEL[cs.triage_status]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={openAdd} className="w-full py-2 border border-dashed border-[var(--color-border)] rounded text-xs text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors">+ Add Another Source</button>
            </div>
          )}

          {showAdd && (
            <div className="border border-[var(--color-border)] rounded p-5 bg-[var(--color-surface)] space-y-4">
              <h3 className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest">Add Source from Library</h3>
              <input type="text" placeholder="Search sources..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]" />
              {globalLoad && <p className="text-xs text-[var(--color-text-muted)] py-4">Loading library...</p>}
              {!globalLoad && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filtered.length === 0 && <p className="text-xs text-[var(--color-text-muted)] py-4 text-center">{search ? 'No matches.' : 'All sources added or library is empty.'}</p>}
                  {filtered.map(s => (
                    <button key={s.id} onClick={() => setSelected(s)}
                      className={`w-full text-left p-3 rounded border text-sm transition-colors ${
                        selected?.id === s.id ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5' : 'border-[var(--color-border)] hover:border-[var(--color-gold)]/50'
                      }`}>
                      <p className="font-semibold text-[var(--color-text)] text-xs">{s.label}</p>
                      <p className="font-mono text-xs text-[var(--color-text-muted)] mt-0.5">{s.source_type} / {s.evidence_type} / {s.info_type}</p>
                    </button>
                  ))}
                </div>
              )}
              {selected && (
                <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
                  <div>
                    <label className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-2">Triage Status</label>
                    <div className="flex gap-2 flex-wrap">
                      {(['GREEN', 'YELLOW', 'RED'] as TriageStatus[]).map(t => (
                        <button key={t} onClick={() => setTriage(t)}
                          className={`text-xs px-3 py-1 border rounded font-mono ${
                            triage === t ? TRIAGE_COLOR[t] : 'text-[var(--color-text-muted)] border-[var(--color-border)]'
                          }`}>{t}</button>
                      ))}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{TRIAGE_LABEL[triage]}</p>
                  </div>
                  <input type="text" placeholder="Name recorded in this source (optional)" value={nameRec} onChange={e => setNameRec(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]" />
                  <input type="text" placeholder="Case-specific notes (optional)" value={notes} onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]" />
                  <div className="flex gap-2">
                    <button onClick={addSource} disabled={adding} className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 disabled:opacity-50">{adding ? 'Adding...' : 'Add to Case Study'}</button>
                    <button onClick={() => { setShowAdd(false); setSelected(null) }} className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="p-4 border border-[var(--color-border)]/50 rounded bg-[var(--color-surface)]/50">
        <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2">GPS Requirement</p>
        <p className="text-sm text-[var(--color-text-muted)]">Red-triaged sources (unlocated or missing) must be acknowledged in the proof argument. They cannot be omitted.</p>
      </div>

      {!loading && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--color-text-muted)] font-mono">{caseSrc.length} source{caseSrc.length !== 1 ? 's' : ''}</span>
          <button onClick={onAdvance} disabled={caseSrc.length === 0} className="px-6 py-2.5 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
            Continue to Evidence Chain
          </button>
        </div>
      )}
    </div>
  )
}
