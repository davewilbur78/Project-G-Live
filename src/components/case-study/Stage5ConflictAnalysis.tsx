'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Conflict } from '@/types'

interface Props { caseStudyId: string; onAdvance: () => void }

const EMPTY = { title: '', name_in_a: '', name_in_b: '', analysis_text: '', is_resolved: false }

export function Stage5ConflictAnalysis({ caseStudyId, onAdvance }: Props) {
  const [conflicts,  setConflicts]  = useState<Conflict[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState(EMPTY)
  const [saving,     setSaving]     = useState(false)
  const [editingId,  setEditingId]  = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/case-study/${caseStudyId}/conflicts`)
    const d   = await res.json()
    if (!res.ok) { setError(d.error); setLoading(false); return }
    setConflicts(d.conflicts ?? []); setLoading(false)
  }, [caseStudyId])

  useEffect(() => { load() }, [load])

  async function save() {
    if (!form.title.trim()) return
    setSaving(true)
    if (editingId) {
      const res = await fetch(`/api/case-study/${caseStudyId}/conflicts/${editingId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      if (res.ok) { const d = await res.json(); setConflicts(prev => prev.map(c => c.id === editingId ? d.conflict : c)) }
      setEditingId(null)
    } else {
      const res = await fetch(`/api/case-study/${caseStudyId}/conflicts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, display_order: conflicts.length }),
      })
      if (res.ok) { const d = await res.json(); setConflicts(prev => [...prev, d.conflict]) }
    }
    setForm(EMPTY); setShowForm(false); setSaving(false)
  }

  async function remove(id: string) {
    if (!confirm('Remove this conflict?')) return
    await fetch(`/api/case-study/${caseStudyId}/conflicts/${id}`, { method: 'DELETE' })
    setConflicts(prev => prev.filter(c => c.id !== id))
  }

  async function toggleResolved(c: Conflict) {
    const res = await fetch(`/api/case-study/${caseStudyId}/conflicts/${c.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_resolved: !c.is_resolved }),
    })
    if (res.ok) setConflicts(prev => prev.map(x => x.id === c.id ? { ...x, is_resolved: !c.is_resolved } : x))
  }

  function startEdit(c: Conflict) {
    setForm({ title: c.title, name_in_a: c.name_in_a ?? '', name_in_b: c.name_in_b ?? '', analysis_text: c.analysis_text ?? '', is_resolved: c.is_resolved })
    setEditingId(c.id); setShowForm(true)
  }

  const unresolved = conflicts.filter(c => !c.is_resolved).length

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-1">GPS Stage 5 of 6</p>
        <h2 className="font-display text-2xl text-[var(--color-text)] mb-2">Conflict Analysis</h2>
        <p className="text-sm text-[var(--color-text-muted)]">Identify every conflict between sources. Document your resolution of each. Unresolved conflicts must be disclosed in the proof argument -- not omitted.</p>
      </div>

      {error && <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400">{error}</div>}

      {!loading && (
        <>
          {conflicts.length === 0 && !showForm && (
            <div className="p-5 border border-[var(--color-border)] rounded bg-[var(--color-surface)] space-y-4">
              <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest">No conflicts recorded</p>
              <p className="text-sm text-[var(--color-text-muted)]">If your sources genuinely do not conflict on any relevant point, proceed. If conflicts exist, document them before writing the proof argument.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90">+ Add Conflict</button>
                <button onClick={onAdvance} className="px-4 py-2 border border-[var(--color-gold)] text-[var(--color-gold)] text-sm font-semibold rounded hover:bg-[var(--color-gold)]/10">No Conflicts -- Continue</button>
              </div>
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="space-y-3">
              {conflicts.map(c => (
                <div key={c.id} className={`p-4 border rounded ${
                  c.is_resolved ? 'border-green-400/20 bg-green-400/5' : 'border-amber-400/20 bg-amber-400/5'
                }`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-mono text-xs px-2 py-0.5 border rounded ${
                        c.is_resolved ? 'text-green-400 border-green-400/30' : 'text-amber-400 border-amber-400/30'
                      }`}>{c.is_resolved ? 'Resolved' : 'Unresolved'}</span>
                      <p className="font-semibold text-sm text-[var(--color-text)]">{c.title}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEdit(c)} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)]">Edit</button>
                      <button onClick={() => remove(c.id)} className="text-xs text-[var(--color-text-muted)] hover:text-red-400">Remove</button>
                    </div>
                  </div>
                  {(c.name_in_a || c.name_in_b) && (
                    <div className="flex gap-4 mb-2">
                      {c.name_in_a && <p className="text-xs text-[var(--color-text-muted)]">Source A: <span className="text-[var(--color-text)]">{c.name_in_a}</span></p>}
                      {c.name_in_b && <p className="text-xs text-[var(--color-text-muted)]">Source B: <span className="text-[var(--color-text)]">{c.name_in_b}</span></p>}
                    </div>
                  )}
                  {c.analysis_text && <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-3">{c.analysis_text}</p>}
                  <button onClick={() => toggleResolved(c)} className="text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-gold)]">
                    Mark as {c.is_resolved ? 'unresolved' : 'resolved'}
                  </button>
                </div>
              ))}
              <button onClick={() => { setForm(EMPTY); setEditingId(null); setShowForm(true) }}
                className="w-full py-2 border border-dashed border-[var(--color-border)] rounded text-xs text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors">+ Add Conflict</button>
            </div>
          )}

          {showForm && (
            <div className="border border-[var(--color-border)] rounded p-5 bg-[var(--color-surface)] space-y-4">
              <h3 className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest">{editingId ? 'Edit Conflict' : 'New Conflict'}</h3>
              <div>
                <label className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-2">Title</label>
                <input type="text" placeholder="e.g., SPRINGER (1907 manifest) vs. SINGER (1919 naturalization)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-1">Name in Source A</label>
                  <input type="text" value={form.name_in_a} onChange={e => setForm(f => ({ ...f, name_in_a: e.target.value }))} className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)]" />
                </div>
                <div>
                  <label className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-1">Name in Source B</label>
                  <input type="text" value={form.name_in_b} onChange={e => setForm(f => ({ ...f, name_in_b: e.target.value }))} className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)]" />
                </div>
              </div>
              <div>
                <label className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-2">Researcher Analysis and Resolution</label>
                <textarea rows={4} placeholder="Explain the conflict and how you resolve it. If unresolved, state what is known and unknown." value={form.analysis_text} onChange={e => setForm(f => ({ ...f, analysis_text: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] resize-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_resolved} onChange={e => setForm(f => ({ ...f, is_resolved: e.target.checked })) } />
                <span className="text-sm text-[var(--color-text-muted)]">Mark as resolved</span>
              </label>
              <div className="flex gap-2">
                <button onClick={save} disabled={saving || !form.title.trim()} className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 disabled:opacity-50">{saving ? 'Saving...' : editingId ? 'Update' : 'Add Conflict'}</button>
                <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY) }} className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Cancel</button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="p-4 border border-[var(--color-border)]/50 rounded bg-[var(--color-surface)]/50">
        <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2">GPS Requirement</p>
        <p className="text-sm text-[var(--color-text-muted)]">All conflicts must be acknowledged. No conflict may be suppressed or omitted. If a conflict cannot be resolved, the argument must disclose it.</p>
      </div>

      {!loading && conflicts.length > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-xs font-mono text-[var(--color-text-muted)]">{unresolved} unresolved conflict{unresolved !== 1 ? 's' : ''}</span>
          <button onClick={onAdvance} className="px-6 py-2.5 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90">
            Continue to Proof Argument
          </button>
        </div>
      )}
    </div>
  )
}
