'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewCaseStudyPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)
  const [form,   setForm]   = useState({ subject_display: '', subject_vitals: '', research_question: '', notes: '' })

  function set(field: string, value: string) { setForm(f => ({ ...f, [field]: value })) }

  async function submit() {
    if (!form.research_question.trim()) { setError('Research question is required.'); return }
    if (!form.subject_display.trim())   { setError('Subject name is required.'); return }
    setError(null); setSaving(true)
    try {
      const res  = await fetch('/api/case-study', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create case study.'); setSaving(false); return }
      router.push(`/case-study/${data.case_study.id}`)
    } catch { setError('Network error. Could not reach the server.'); setSaving(false) }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/case-study" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-6">← Case Studies</Link>
        <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">New Case Study</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-10">Define the research subject and the specific claim you are setting out to prove.</p>

        {error && <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">{error}</div>}

        <div className="space-y-6">
          <div>
            <label className="block font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Subject Name(s)</label>
            <input type="text" placeholder="e.g., Jacob Singer / Yankel Springer"
              value={form.subject_display} onChange={e => set('subject_display', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]" />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Include all name variants if identity is the claim being proved.</p>
          </div>

          <div>
            <label className="block font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Subject Vitals (optional)</label>
            <input type="text" placeholder="e.g., b. c. 1873 Zaslaw, Volhynia; d. 1944 New York"
              value={form.subject_vitals} onChange={e => set('subject_vitals', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]" />
          </div>

          <div>
            <label className="block font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Research Question</label>
            <textarea rows={4} placeholder="State the specific identity, parentage, or relationship claim you are proving. Be precise. This becomes the governing question for all six GPS stages."
              value={form.research_question} onChange={e => set('research_question', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] resize-none" />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">GPS Stage 1. The research question governs the entire case study.</p>
          </div>

          <div>
            <label className="block font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2">Researcher Notes (optional)</label>
            <textarea rows={3} placeholder="Internal notes. Not part of the proof argument."
              value={form.notes} onChange={e => set('notes', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] resize-none" />
          </div>

          <button onClick={submit} disabled={saving}
            className="w-full py-3 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? 'Creating...' : 'Create Case Study'}
          </button>
        </div>
      </div>
    </div>
  )
}
