'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Source, Person, FactInDispute } from '@/types'

const FACT_OPTIONS: { value: FactInDispute; label: string }[] = [
  { value: 'birth_date',  label: 'Birth Date' },
  { value: 'birth_place', label: 'Birth Place' },
  { value: 'name',        label: 'Name / Name Spelling' },
  { value: 'age',         label: 'Age at Event' },
  { value: 'death_date',  label: 'Death Date' },
  { value: 'death_place', label: 'Death Place' },
  { value: 'residence',   label: 'Residence / Address' },
  { value: 'immigration', label: 'Immigration / Arrival Date' },
  { value: 'marriage',    label: 'Marriage Date or Place' },
  { value: 'occupation',  label: 'Occupation' },
  { value: 'other',       label: 'Other' },
]

const INPUT = 'w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]'
const LABEL = 'block text-xs font-mono text-[var(--color-text-muted)] mb-1'

export default function NewConflictPage() {
  const router = useRouter()

  const [sources, setSources] = useState<Source[]>([])
  const [persons, setPersons] = useState<Person[]>([])

  const [title,          setTitle]         = useState('')
  const [factInDispute,  setFactInDispute] = useState<FactInDispute>('birth_date')
  const [description,    setDescription]   = useState('')
  const [personId,       setPersonId]      = useState('')
  const [sourceAId,      setSourceAId]     = useState('')
  const [sourceAValue,   setSourceAValue]  = useState('')
  const [sourceBId,      setSourceBId]     = useState('')
  const [sourceBValue,   setSourceBValue]  = useState('')
  const [notes,          setNotes]         = useState('')

  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const [sRes, pRes] = await Promise.all([
        fetch('/api/citation-builder'),
        fetch('/api/persons'),
      ])
      const [sData, pData] = await Promise.all([sRes.json(), pRes.json()])
      setSources(sData.sources ?? [])
      setPersons(pData.persons ?? [])
    }
    loadData()
  }, [])

  // Auto-fill title when both sources and fact are set
  useEffect(() => {
    if (sourceAId && sourceBId && factInDispute && !title) {
      const sa = sources.find(s => s.id === sourceAId)
      const sb = sources.find(s => s.id === sourceBId)
      const factLabel = FACT_OPTIONS.find(f => f.value === factInDispute)?.label ?? factInDispute
      if (sa && sb) {
        setTitle(`${factLabel}: ${sa.label.slice(0, 30)} vs. ${sb.label.slice(0, 30)}`)
      }
    }
  }, [sourceAId, sourceBId, factInDispute, sources, title])

  async function handleSubmit() {
    if (!title.trim())       { setError('Title is required.');       return }
    if (!description.trim()) { setError('Description is required.'); return }
    setSaving(true)
    setError(null)
    try {
      const res  = await fetch('/api/conflict-resolver', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          title:           title.trim(),
          fact_in_dispute: factInDispute,
          description:     description.trim(),
          person_id:       personId    || null,
          source_a_id:     sourceAId   || null,
          source_a_value:  sourceAValue.trim() || null,
          source_b_id:     sourceBId   || null,
          source_b_value:  sourceBValue.trim() || null,
          notes:           notes.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/conflict-resolver/${data.conflict.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const sourceA = sources.find(s => s.id === sourceAId)
  const sourceB = sources.find(s => s.id === sourceBId)

  function GpsChip({ label, value, color }: { label: string; value: string; color: string }) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded ${color}`}>
        <span className="text-[0.6rem] opacity-60">{label}</span>
        {value}
      </span>
    )
  }

  const sourceTypeColor = (t: string) =>
    t === 'Original' ? 'bg-green-900/30 text-green-400' :
    t === 'Derivative' ? 'bg-amber-900/30 text-amber-400' :
    'bg-orange-900/30 text-orange-400'

  const infoTypeColor = (t: string) =>
    t === 'Primary' ? 'bg-green-900/30 text-green-400' :
    t === 'Secondary' ? 'bg-amber-900/30 text-amber-400' :
    'bg-[var(--color-surface)] text-[var(--color-text-muted)]'

  const evidTypeColor = (t: string) =>
    t === 'Direct' ? 'bg-green-900/30 text-green-400' :
    t === 'Indirect' ? 'bg-amber-900/30 text-amber-400' :
    'bg-red-900/30 text-red-400'

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        <Link href="/conflict-resolver" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-3">
          &larr; Conflict Resolver
        </Link>
        <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">Record a Conflict</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          Two sources disagree. Document the discrepancy and analyze it using GPS methodology.
        </p>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">{error}</div>
        )}

        <div className="space-y-6">

          {/* Fact type */}
          <div>
            <label className={LABEL}>Fact in Dispute *</label>
            <select
              value={factInDispute}
              onChange={e => setFactInDispute(e.target.value as FactInDispute)}
              className={INPUT}
            >
              {FACT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Source A */}
          <div className="space-y-3">
            <p className="text-xs font-mono text-[var(--color-gold)] uppercase tracking-widest">Source A</p>
            <div>
              <label className={LABEL}>Source</label>
              <select
                value={sourceAId}
                onChange={e => setSourceAId(e.target.value)}
                className={INPUT}
              >
                <option value="">-- Select a source --</option>
                {sources.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            {sourceA && (
              <div className="flex gap-1.5 flex-wrap">
                <GpsChip label="SRC" value={sourceA.source_type} color={sourceTypeColor(sourceA.source_type)} />
                <GpsChip label="INFO" value={sourceA.info_type}   color={infoTypeColor(sourceA.info_type)} />
                <GpsChip label="EVID" value={sourceA.evidence_type} color={evidTypeColor(sourceA.evidence_type)} />
              </div>
            )}
            <div>
              <label className={LABEL}>What does Source A say about this fact?</label>
              <input
                type="text"
                value={sourceAValue}
                onChange={e => setSourceAValue(e.target.value)}
                placeholder="e.g. Born 14 March 1882"
                className={INPUT}
              />
            </div>
          </div>

          {/* Source B */}
          <div className="space-y-3">
            <p className="text-xs font-mono text-[var(--color-gold)] uppercase tracking-widest">Source B</p>
            <div>
              <label className={LABEL}>Source</label>
              <select
                value={sourceBId}
                onChange={e => setSourceBId(e.target.value)}
                className={INPUT}
              >
                <option value="">-- Select a source --</option>
                {sources.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            {sourceB && (
              <div className="flex gap-1.5 flex-wrap">
                <GpsChip label="SRC" value={sourceB.source_type} color={sourceTypeColor(sourceB.source_type)} />
                <GpsChip label="INFO" value={sourceB.info_type}   color={infoTypeColor(sourceB.info_type)} />
                <GpsChip label="EVID" value={sourceB.evidence_type} color={evidTypeColor(sourceB.evidence_type)} />
              </div>
            )}
            <div>
              <label className={LABEL}>What does Source B say about this fact?</label>
              <input
                type="text"
                value={sourceBValue}
                onChange={e => setSourceBValue(e.target.value)}
                placeholder="e.g. Born 1880 (census age 22 in 1902)"
                className={INPUT}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={LABEL}>Conflict Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Auto-filled when both sources are selected"
              className={INPUT}
            />
          </div>

          {/* Description */}
          <div>
            <label className={LABEL}>Description of Discrepancy *</label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what the sources say and why this matters for the research question."
              className={INPUT}
            />
          </div>

          {/* Person */}
          <div>
            <label className={LABEL}>Subject (optional)</label>
            <select
              value={personId}
              onChange={e => setPersonId(e.target.value)}
              className={INPUT}
            >
              <option value="">-- No person linked --</option>
              {persons.map(p => (
                <option key={p.id} value={p.id}>{p.display_name}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className={LABEL}>Notes (optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional context."
              className={INPUT}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? 'Saving...' : 'Save Conflict'}
            </button>
            <Link
              href="/conflict-resolver"
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
            >
              Cancel
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
