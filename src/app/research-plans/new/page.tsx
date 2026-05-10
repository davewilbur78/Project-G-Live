'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Person { id: string; display_name: string }

export default function NewResearchPlanPage() {
  const router = useRouter()
  const [persons, setPersons] = useState<Person[]>([])
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [form, setForm] = useState({
    person_id:         '',
    title:             '',
    research_question: '',
    time_period:       '',
    geography:         '',
    community:         '',
    notes:             '',
  })

  useEffect(() => {
    fetch('/api/persons')
      .then(r => r.json())
      .then(d => setPersons(d.persons ?? []))
      .catch(() => {/* non-fatal */})
  }, [])

  const handlePersonChange = (personId: string) => {
    const person = persons.find(p => p.id === personId)
    setForm(f => ({
      ...f,
      person_id: personId,
      // Auto-fill title only if title is still empty
      title: person && !f.title.trim() ? `Research Plan: ${person.display_name}` : f.title,
    }))
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async () => {
    setError(null)
    if (!form.title.trim())             { setError('Title is required');             return }
    if (!form.research_question.trim()) { setError('Research question is required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/research-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, person_id: form.person_id || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create plan')
      router.push(`/research-plans/${data.plan.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plan')
      setSaving(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 text-sm border border-[var(--rule)] rounded bg-white text-[var(--ink)] focus:outline-none focus:border-[var(--gold-mid)]'
  const labelClass = 'block text-xs font-mono tracking-widest text-[var(--ink-faint)] uppercase mb-1'
  const hintClass  = 'text-xs text-[var(--ink-faint)] italic mb-1'

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-2">
        <Link href="/research-plans" className="font-mono text-xs tracking-widest text-[var(--ink-faint)] hover:text-[var(--gold-mid)] uppercase transition-colors">
          &larr; Research Plans
        </Link>
        <span className="text-[var(--ink-faint)] text-xs">/</span>
        <Link href="/" className="font-mono text-xs tracking-widest text-[var(--ink-faint)] hover:text-[var(--gold-mid)] uppercase transition-colors">
          Dashboard
        </Link>
      </div>

      <div className="border-b-2 border-[var(--ink)] pb-6 mb-8">
        <h1 className="font-display text-3xl font-bold text-[var(--ink)]">New Research Plan</h1>
        <p className="text-[var(--ink-soft)] italic mt-1">
          Define your research scope. Use the Generate Strategy button after saving to produce a prioritized source list.
        </p>
      </div>

      <div className="space-y-5">
        {/* Person */}
        <div>
          <label className={labelClass}>Research Subject</label>
          <select value={form.person_id} onChange={e => handlePersonChange(e.target.value)} className={inputClass}>
            <option value="">-- Select person (optional) --</option>
            {persons.map(p => <option key={p.id} value={p.id}>{p.display_name}</option>)}
          </select>
          {persons.length === 0 && (
            <p className={hintClass}>No persons on file yet. You can add one via <Link href="/citation-builder" className="underline">Citation Builder</Link> or create this plan without one.</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className={labelClass}>Plan Title <span className="text-red-500">*</span></label>
          <input type="text" value={form.title} onChange={set('title')}
            placeholder="e.g. Research Plan: Jacob Singer / Yankel Springer"
            className={inputClass} />
        </div>

        {/* Research question */}
        <div>
          <label className={labelClass}>Research Question <span className="text-red-500">*</span></label>
          <p className={hintClass}>State the specific question this plan is designed to answer. GPS compliance requires a precise question.</p>
          <textarea rows={4} value={form.research_question} onChange={set('research_question')}
            placeholder="e.g. What is the identity of the parents of Jacob Singer (b. ca. 1880, Russian Empire) who immigrated to New York City ca. 1907?"
            className={`${inputClass} resize-y`} />
        </div>

        {/* Context section */}
        <div className="border border-[var(--rule)] rounded p-4 space-y-4">
          <p className="text-xs font-mono tracking-widest text-[var(--ink-faint)] uppercase">
            Context for AI Strategy Generation
          </p>

          <div>
            <label className={labelClass}>Time Period</label>
            <p className={hintClass}>Approximate dates of the subject&apos;s life or the research period.</p>
            <input type="text" value={form.time_period} onChange={set('time_period')}
              placeholder="e.g. 1880-1935 (born Volhynia, died New York)"
              className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Geography</label>
            <p className={hintClass}>Where the subject lived. Include origin and destination for immigrants.</p>
            <input type="text" value={form.geography} onChange={set('geography')}
              placeholder="e.g. Russian Empire (Volhynia Gubernia, Zaslav district), later New York City (Lower East Side)"
              className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Community</label>
            <p className={hintClass}>Ethnic, religious, or occupational community -- shapes which record collections are relevant.</p>
            <input type="text" value={form.community} onChange={set('community')}
              placeholder="e.g. Ashkenazi Jewish (Zaslav district, Volhynia)"
              className={inputClass} />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={labelClass}>Notes</label>
          <textarea rows={3} value={form.notes} onChange={set('notes')}
            placeholder="Any additional context, constraints, or research notes..."
            className={`${inputClass} resize-y`} />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3 mt-8">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-2 text-sm font-semibold rounded bg-[var(--ink)] text-[var(--parchment)] hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
          {saving ? 'Creating...' : 'Create Plan'}
        </button>
        <Link href="/research-plans" className="px-4 py-2 text-sm text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors">
          Cancel
        </Link>
      </div>
    </div>
  )
}
