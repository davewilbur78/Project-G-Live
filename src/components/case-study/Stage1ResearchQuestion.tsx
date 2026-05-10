'use client'

import { useState } from 'react'
import type { CaseStudy } from '@/types'

interface Props {
  caseStudy: CaseStudy
  onUpdate:  (updated: CaseStudy) => void
  onAdvance: () => void
}

export function Stage1ResearchQuestion({ caseStudy, onUpdate, onAdvance }: Props) {
  const [editing,  setEditing]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [question, setQuestion] = useState(caseStudy.research_question)
  const [vitals,   setVitals]   = useState(caseStudy.subject_vitals ?? '')

  async function save() {
    if (!question.trim()) { setError('Research question cannot be empty.'); return }
    setSaving(true); setError(null)
    const res  = await fetch(`/api/case-study/${caseStudy.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ research_question: question.trim(), subject_vitals: vitals.trim() || null }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSaving(false); return }
    onUpdate(data.case_study)
    setEditing(false); setSaving(false)
  }

  function cancel() {
    setEditing(false)
    setQuestion(caseStudy.research_question)
    setVitals(caseStudy.subject_vitals ?? '')
    setError(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-1">GPS Stage 1 of 6</p>
        <h2 className="font-display text-2xl text-[var(--color-text)] mb-2">Research Question</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          The specific identity, parentage, or relationship claim this case study sets out to prove.
          Every subsequent stage answers this question.
        </p>
      </div>

      {error && <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400">{error}</div>}

      <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded space-y-5">
        <div>
          <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Subject</p>
          <p className="text-lg font-semibold text-[var(--color-text)]">{caseStudy.subject_display}</p>
          {caseStudy.subject_vitals && (
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{caseStudy.subject_vitals}</p>
          )}
        </div>
        <div className="border-t border-[var(--color-border)] pt-5">
          <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Research Question</p>
          {editing ? (
            <div className="space-y-3">
              <textarea rows={4} value={question} onChange={e => setQuestion(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)] resize-none" />
              <input type="text" placeholder="Subject vitals (optional)" value={vitals} onChange={e => setVitals(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]" />
              <div className="flex gap-2">
                <button onClick={save} disabled={saving} className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={cancel} className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[var(--color-text)] leading-relaxed">{caseStudy.research_question}</p>
              <button onClick={() => setEditing(true)} className="mt-3 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] font-mono">Edit</button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border border-[var(--color-border)]/50 rounded bg-[var(--color-surface)]/50">
        <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2">GPS Requirement</p>
        <p className="text-sm text-[var(--color-text-muted)]">
          Name the persons, the relationship, and the time period. Be specific enough that evidence
          can either prove or disprove the claim. Vague questions produce vague arguments.
        </p>
      </div>

      <div className="flex justify-end">
        <button onClick={onAdvance} className="px-6 py-2.5 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90">
          Continue to Source Inventory
        </button>
      </div>
    </div>
  )
}
