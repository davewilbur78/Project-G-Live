'use client'

import { useState, useEffect, useCallback } from 'react'
import type { EvidenceChainLink, EvidenceWeight } from '@/types'

interface Props { caseStudyId: string; onAdvance: () => void }

const WEIGHTS: EvidenceWeight[] = ['Very Strong', 'Strong', 'Moderate', 'Corroborating']
const WEIGHT_COLOR: Record<EvidenceWeight, string> = {
  'Very Strong':   'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  'Strong':        'text-green-400 bg-green-400/10 border-green-400/30',
  'Moderate':      'text-amber-400 bg-amber-400/10 border-amber-400/30',
  'Corroborating': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
}
const WEIGHT_DESC: Record<EvidenceWeight, string> = {
  'Very Strong':   'Directly proves the claim. Reliable original source.',
  'Strong':        'Strongly supports the claim with minor reservations.',
  'Moderate':      'Supports the claim but with significant limitations.',
  'Corroborating': 'Adds context or support. Not independently sufficient.',
}
const EMPTY = { claim: '', weight: 'Strong' as EvidenceWeight, sources_narrative: '' }

export function Stage3EvidenceChain({ caseStudyId, onAdvance }: Props) {
  const [links,     setLinks]     = useState<EvidenceChainLink[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState(EMPTY)
  const [saving,    setSaving]    = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/case-study/${caseStudyId}/evidence`)
    const d   = await res.json()
    if (!res.ok) { setError(d.error); setLoading(false); return }
    setLinks(d.links ?? []); setLoading(false)
  }, [caseStudyId])

  useEffect(() => { load() }, [load])

  async function save() {
    if (!form.claim.trim()) return
    setSaving(true)
    if (editingId) {
      const res = await fetch(`/api/case-study/${caseStudyId}/evidence/${editingId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      if (res.ok) { const d = await res.json(); setLinks(prev => prev.map(l => l.id === editingId ? d.link : l)) }
      setEditingId(null)
    } else {
      const res = await fetch(`/api/case-study/${caseStudyId}/evidence`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      if (res.ok) { const d = await res.json(); setLinks(prev => [...prev, d.link]) }
    }
    setForm(EMPTY); setShowForm(false); setSaving(false)
  }

  async function remove(id: string) {
    if (!confirm('Remove this evidence link?')) return
    await fetch(`/api/case-study/${caseStudyId}/evidence/${id}`, { method: 'DELETE' })
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  function startEdit(link: EvidenceChainLink) {
    setForm({ claim: link.claim, weight: link.weight, sources_narrative: link.sources_narrative ?? '' })
    setEditingId(link.id); setShowForm(true)
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-1">GPS Stage 3 of 6</p>
        <h2 className="font-display text-2xl text-[var(--color-text)] mb-2">Evidence Chain</h2>
        <p className="text-sm text-[var(--color-text-muted)]">Build the logical chain connecting evidence to conclusion. Each link is one specific claim. Assess weight honestly.</p>
      </div>

      {error && <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400">{error}</div>}

      {!loading && (
        <>
          {links.length === 0 && !showForm && (
            <div className="text-center py-16 border border-dashed border-[var(--color-border)] rounded">
              <p className="text-sm text-[var(--color-text-muted)] mb-6">No evidence links yet.</p>
              <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90">+ Add First Link</button>
            </div>
          )}

          {links.length > 0 && (
            <div className="space-y-3">
              {links.map((link, idx) => (
                <div key={link.id} className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs text-[var(--color-text-muted)] pt-1 w-5 shrink-0 text-right">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-semibold text-sm text-[var(--color-text)]">{link.claim}</p>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => startEdit(link)} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)]">Edit</button>
                          <button onClick={() => remove(link.id)} className="text-xs text-[var(--color-text-muted)] hover:text-red-400">Remove</button>
                        </div>
                      </div>
                      <span className={`inline-block text-xs px-2 py-0.5 border rounded font-mono mb-2 ${WEIGHT_COLOR[link.weight]}`}>{link.weight}</span>
                      {link.sources_narrative && <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mt-1">{link.sources_narrative}</p>}
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => { setForm(EMPTY); setEditingId(null); setShowForm(true) }}
                className="w-full py-2 border border-dashed border-[var(--color-border)] rounded text-xs text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors">+ Add Link</button>
            </div>
          )}

          {showForm && (
            <div className="border border-[var(--color-border)] rounded p-5 bg-[var(--color-surface)] space-y-4">
              <h3 className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest">{editingId ? 'Edit Link' : 'New Evidence Link'}</h3>
              <div>
                <label className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-2">Claim</label>
                <textarea rows={2} placeholder="State the specific claim this evidence supports." value={form.claim} onChange={e => setForm(f => ({ ...f, claim: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] resize-none" />
              </div>
              <div>
                <label className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-2">Weight</label>
                <div className="space-y-2">
                  {WEIGHTS.map(w => (
                    <label key={w} className="flex items-start gap-3 cursor-pointer">
                      <input type="radio" name="weight" value={w} checked={form.weight === w} onChange={() => setForm(f => ({ ...f, weight: w }))} className="mt-0.5" />
                      <div>
                        <span className={`text-xs font-mono px-2 py-0.5 border rounded ${WEIGHT_COLOR[w]}`}>{w}</span>
                        <span className="text-xs text-[var(--color-text-muted)] ml-2">{WEIGHT_DESC[w]}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-2">Source Narrative (optional)</label>
                <textarea rows={3} placeholder="How do specific sources connect to this claim?" value={form.sources_narrative} onChange={e => setForm(f => ({ ...f, sources_narrative: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={save} disabled={saving || !form.claim.trim()} className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 disabled:opacity-50">{saving ? 'Saving...' : editingId ? 'Update' : 'Add Link'}</button>
                <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY) }} className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Cancel</button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="p-4 border border-[var(--color-border)]/50 rounded bg-[var(--color-surface)]/50">
        <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2">GPS Requirement</p>
        <p className="text-sm text-[var(--color-text-muted)]">Every link must be supported by at least one source from Stage 2. Gaps must be acknowledged in the proof argument. Do not assert claims the evidence cannot support.</p>
      </div>

      {!loading && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--color-text-muted)] font-mono">{links.length} link{links.length !== 1 ? 's' : ''}</span>
          <button onClick={onAdvance} disabled={links.length === 0} className="px-6 py-2.5 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 disabled:opacity-40">
            Continue to Search Checklist
          </button>
        </div>
      )}
    </div>
  )
}
