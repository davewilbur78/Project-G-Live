'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ProofParagraph, FootnoteDefinition } from '@/types'

interface Props { caseStudyId: string }

export function Stage6ProofArgument({ caseStudyId }: Props) {
  const [paragraphs, setParagraphs] = useState<ProofParagraph[]>([])
  const [footnotes,  setFootnotes]  = useState<FootnoteDefinition[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [view,       setView]       = useState<'edit' | 'preview'>('edit')
  const [showPara,   setShowPara]   = useState(false)
  const [paraText,   setParaText]   = useState('')
  const [savingPara, setSavingPara] = useState(false)
  const [editParaId, setEditParaId] = useState<string | null>(null)
  const [showFn,     setShowFn]     = useState(false)
  const [fnNum,      setFnNum]      = useState('')
  const [fnCite,     setFnCite]     = useState('')
  const [savingFn,   setSavingFn]   = useState(false)

  const load = useCallback(async () => {
    const res = await fetch(`/api/case-study/${caseStudyId}/proof`)
    const d   = await res.json()
    if (!res.ok) { setError(d.error); setLoading(false); return }
    setParagraphs(d.paragraphs ?? []); setFootnotes(d.footnotes ?? []); setLoading(false)
  }, [caseStudyId])

  useEffect(() => { load() }, [load])

  async function savePara() {
    if (!paraText.trim()) return
    setSavingPara(true)
    if (editParaId) {
      const res = await fetch(`/api/case-study/${caseStudyId}/proof/${editParaId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: paraText }),
      })
      if (res.ok) { const d = await res.json(); setParagraphs(prev => prev.map(p => p.id === editParaId ? d.paragraph : p)) }
      setEditParaId(null)
    } else {
      const res = await fetch(`/api/case-study/${caseStudyId}/proof`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: paraText }),
      })
      if (res.ok) { const d = await res.json(); setParagraphs(prev => [...prev, d.paragraph]) }
    }
    setParaText(''); setShowPara(false); setSavingPara(false)
  }

  async function deletePara(id: string) {
    if (!confirm('Delete this paragraph?')) return
    await fetch(`/api/case-study/${caseStudyId}/proof/${id}`, { method: 'DELETE' })
    setParagraphs(prev => prev.filter(p => p.id !== id))
  }

  async function saveFn() {
    const num = parseInt(fnNum || String(nextFnNum))
    if (!fnCite.trim() || isNaN(num)) return
    setSavingFn(true)
    const res = await fetch(`/api/case-study/${caseStudyId}/proof`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'footnote', footnote_number: num, citation_text: fnCite }),
    })
    if (res.ok) { const d = await res.json(); setFootnotes(prev => [...prev, d.footnote].sort((a, b) => a.footnote_number - b.footnote_number)) }
    setFnNum(''); setFnCite(''); setShowFn(false); setSavingFn(false)
  }

  // Render paragraph with [FN1] -> superscript
  function renderContent(content: string) {
    return content.split(/(\[FN\d+\])/g).map((part, i) => {
      const m = part.match(/\[FN(\d+)\]/)
      return m
        ? <sup key={i} className="text-[var(--color-gold)] text-xs font-mono" title={`Footnote ${m[1]}`}>{m[1]}</sup>
        : <span key={i}>{part}</span>
    })
  }

  const nextFnNum = footnotes.length > 0 ? Math.max(...footnotes.map(f => f.footnote_number)) + 1 : 1

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-1">GPS Stage 6 of 6</p>
          <h2 className="font-display text-2xl text-[var(--color-text)] mb-2">Proof Argument</h2>
          <p className="text-sm text-[var(--color-text-muted)]">Write the GPS-compliant narrative. Every factual claim must carry an inline footnote. Use [FN1], [FN2], etc. in your text. No naked claims.</p>
        </div>
        <div className="flex gap-2 shrink-0 mt-1">
          {(['edit', 'preview'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-mono rounded capitalize ${
                view === v ? 'bg-[var(--color-gold)] text-[var(--color-bg)]' : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}>{v}</button>
          ))}
        </div>
      </div>

      {error && <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400">{error}</div>}

      {!loading && view === 'edit' && (
        <>
          {/* Paragraphs */}
          <div>
            <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-4">Proof Paragraphs</p>
            {paragraphs.length === 0 && !showPara && (
              <div className="text-center py-12 border border-dashed border-[var(--color-border)] rounded mb-3">
                <p className="text-sm text-[var(--color-text-muted)] mb-2">No paragraphs yet.</p>
                <p className="text-xs text-[var(--color-text-muted)] mb-6">Use [FN1], [FN2], etc. to mark footnote positions. Every claim needs a marker.</p>
                <button onClick={() => setShowPara(true)} className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90">+ Write First Paragraph</button>
              </div>
            )}
            <div className="space-y-3">
              {paragraphs.map((p, idx) => (
                <div key={p.id} className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs text-[var(--color-text-muted)] pt-1 w-5 shrink-0 text-right">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--color-text)] font-mono leading-relaxed whitespace-pre-wrap mb-2">{p.content}</p>
                      <div className="flex gap-3">
                        <button onClick={() => { setParaText(p.content); setEditParaId(p.id); setShowPara(true) }} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)]">Edit</button>
                        <button onClick={() => deletePara(p.id)} className="text-xs text-[var(--color-text-muted)] hover:text-red-400">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {showPara && (
              <div className="border border-[var(--color-border)] rounded p-5 bg-[var(--color-surface)] space-y-4 mt-3">
                <h3 className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest">{editParaId ? 'Edit Paragraph' : 'New Paragraph'}</h3>
                <textarea rows={6} placeholder="Write the proof argument paragraph. Use [FN1] markers. Every factual claim must have a marker." value={paraText} onChange={e => setParaText(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] resize-none font-mono" />
                <div className="flex gap-2">
                  <button onClick={savePara} disabled={savingPara || !paraText.trim()} className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 disabled:opacity-50">{savingPara ? 'Saving...' : editParaId ? 'Update' : 'Add Paragraph'}</button>
                  <button onClick={() => { setShowPara(false); setEditParaId(null); setParaText('') }} className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Cancel</button>
                </div>
              </div>
            )}
            {paragraphs.length > 0 && !showPara && (
              <button onClick={() => { setParaText(''); setEditParaId(null); setShowPara(true) }}
                className="w-full py-2 mt-3 border border-dashed border-[var(--color-border)] rounded text-xs text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors">+ Add Paragraph</button>
            )}
          </div>

          {/* Footnotes */}
          <div>
            <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-4">Footnote Definitions</p>
            <div className="space-y-2">
              {footnotes.map(fn => (
                <div key={fn.id} className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded flex items-start gap-3">
                  <span className="font-mono text-xs text-[var(--color-gold)] shrink-0 w-6 text-right">{fn.footnote_number}.</span>
                  <p className="text-xs text-[var(--color-text)] font-mono leading-relaxed">{fn.citation_text}</p>
                </div>
              ))}
            </div>
            {showFn && (
              <div className="border border-[var(--color-border)] rounded p-5 bg-[var(--color-surface)] space-y-4 mt-3">
                <h3 className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest">New Footnote</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-2">Number</label>
                    <input type="number" value={fnNum || nextFnNum} onChange={e => setFnNum(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)]" />
                  </div>
                  <div className="col-span-3">
                    <label className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest block mb-2">EE Citation</label>
                    <input type="text" placeholder="Full Evidence Explained citation" value={fnCite} onChange={e => setFnCite(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveFn} disabled={savingFn || !fnCite.trim()} className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 disabled:opacity-50">{savingFn ? 'Saving...' : 'Add Footnote'}</button>
                  <button onClick={() => { setShowFn(false); setFnNum(''); setFnCite('') }} className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Cancel</button>
                </div>
              </div>
            )}
            {!showFn && (
              <button onClick={() => setShowFn(true)} className="w-full py-2 mt-3 border border-dashed border-[var(--color-border)] rounded text-xs text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors">+ Add Footnote</button>
            )}
          </div>
        </>
      )}

      {/* Preview mode */}
      {!loading && view === 'preview' && (
        <div className="space-y-6">
          {paragraphs.length === 0
            ? <p className="text-[var(--color-text-muted)] text-sm italic">No proof argument written yet.</p>
            : paragraphs.map(p => (
                <p key={p.id} className="text-[var(--color-text)] leading-loose">{renderContent(p.content)}</p>
              ))
          }
          {footnotes.length > 0 && (
            <div className="border-t border-[var(--color-border)] pt-6">
              <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-4">Footnotes</p>
              <ol className="space-y-2">
                {footnotes.map(fn => (
                  <li key={fn.id} className="flex items-start gap-2">
                    <span className="font-mono text-xs text-[var(--color-gold)] shrink-0 w-5 text-right">{fn.footnote_number}.</span>
                    <p className="text-xs text-[var(--color-text-muted)] font-mono leading-relaxed">{fn.citation_text}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      <div className="p-4 border border-[var(--color-border)]/50 rounded bg-[var(--color-surface)]/50">
        <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2">GPS Requirement</p>
        <p className="text-sm text-[var(--color-text-muted)]">Every factual claim must carry an inline footnote. Unresolved conflicts and unlocated sources must be disclosed. The argument must address all five GPS elements.</p>
      </div>
    </div>
  )
}
