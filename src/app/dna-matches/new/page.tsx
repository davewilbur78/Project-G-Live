'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Person = { id: string; display_name: string }

const PLATFORMS = [
  { value: '23andme', label: '23andMe' },
  { value: 'ancestry', label: 'AncestryDNA' },
  { value: 'ftdna', label: 'FamilyTreeDNA' },
  { value: 'myheritage', label: 'MyHeritage' },
  { value: 'gedmatch', label: 'GEDmatch' },
  { value: 'other', label: 'Other' },
]

const STATUSES = [
  { value: 'unresolved', label: 'Unresolved' },
  { value: 'working_hypothesis', label: 'Working Hypothesis' },
  { value: 'identified', label: 'Identified' },
]

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6,
  border: '1px solid var(--color-border)', background: 'var(--color-bg)',
  color: 'var(--color-text)', fontSize: '0.9rem', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.82rem', fontWeight: 600,
  color: 'var(--color-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em',
}
const fieldStyle: React.CSSProperties = { marginBottom: '1.25rem' }

export default function NewDnaMatchPage() {
  const router = useRouter()
  const [persons, setPersons] = useState<Person[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setFormState] = useState({
    match_name: '',
    platform: '23andme',
    shared_cm: '',
    shared_segments: '',
    largest_segment_cm: '',
    kit_number: '',
    match_email: '',
    person_id: '',
    status: 'unresolved',
    hypothesized_relationship: '',
    ancestral_line: '',
    documentary_evidence: '',
    endogamy_context: '',
    in_common_with: '',
    notes: '',
  })

  useEffect(() => {
    fetch('/api/persons')
      .then(r => r.json())
      .then(d => { if (d.persons) setPersons(d.persons) })
      .catch(() => {})
  }, [])

  function set(field: string, value: string) {
    setFormState(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.match_name.trim()) { setError('Match name is required.'); return }
    setSaving(true)
    setError(null)
    const body: Record<string, unknown> = {
      match_name: form.match_name.trim(),
      platform: form.platform,
      status: form.status,
      person_id: form.person_id || null,
      hypothesized_relationship: form.hypothesized_relationship || null,
      ancestral_line: form.ancestral_line || null,
      documentary_evidence: form.documentary_evidence || null,
      endogamy_context: form.endogamy_context || null,
      in_common_with: form.in_common_with || null,
      kit_number: form.kit_number || null,
      match_email: form.match_email || null,
      notes: form.notes || null,
    }
    if (form.shared_cm) body.shared_cm = parseFloat(form.shared_cm)
    if (form.shared_segments) body.shared_segments = parseInt(form.shared_segments, 10)
    if (form.largest_segment_cm) body.largest_segment_cm = parseFloat(form.largest_segment_cm)

    const res = await fetch('/api/dna-matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Save failed.'); setSaving(false); return }
    router.push(`/dna-matches/${data.id}`)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
        <Link href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Dashboard</Link>
        {' '}&rsaquo;{' '}
        <Link href="/dna-matches" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>DNA Evidence Tracker</Link>
        {' '}&rsaquo; New Match
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 600, margin: '0 0 0.5rem', color: 'var(--color-text)' }}>
        Add DNA Match
      </h1>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '0.85rem 1.1rem', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
        <strong style={{ color: 'var(--color-text)' }}>GPS Note:</strong> DNA evidence is classified as corroborating indirect evidence under GPS. It must always be supported by documentary evidence. It is never sufficient as standalone proof.
      </div>

      {error && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-red)', borderRadius: 8, padding: '0.85rem 1.1rem', marginBottom: '1.5rem', color: 'var(--color-red)', fontSize: '0.9rem' }}>{error}</div>
      )}

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '1.75rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, margin: '0 0 1.25rem', color: 'var(--color-text)' }}>Match Details</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ gridColumn: '1 / -1', ...fieldStyle, margin: 0 }}>
            <label style={labelStyle}>Match Name *</label>
            <input style={inputStyle} value={form.match_name} onChange={e => set('match_name', e.target.value)} placeholder="Name or alias from the platform" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Platform *</label>
            <select style={inputStyle} value={form.platform} onChange={e => set('platform', e.target.value)}>
              {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Status</label>
            <select style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Shared cM</label>
            <input style={inputStyle} type="number" step="0.01" min="0" value={form.shared_cm} onChange={e => set('shared_cm', e.target.value)} placeholder="e.g. 234.5" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Shared Segments</label>
            <input style={inputStyle} type="number" min="0" value={form.shared_segments} onChange={e => set('shared_segments', e.target.value)} placeholder="e.g. 8" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Largest Segment (cM)</label>
            <input style={inputStyle} type="number" step="0.01" min="0" value={form.largest_segment_cm} onChange={e => set('largest_segment_cm', e.target.value)} placeholder="e.g. 48.2" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Kit / Profile ID</label>
            <input style={inputStyle} value={form.kit_number} onChange={e => set('kit_number', e.target.value)} placeholder="Platform kit or profile ID" />
          </div>
          <div style={{ gridColumn: '1 / -1', ...fieldStyle }}>
            <label style={labelStyle}>Contact Email</label>
            <input style={inputStyle} type="email" value={form.match_email} onChange={e => set('match_email', e.target.value)} placeholder="Contact email if known" />
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1.5rem 0' }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, margin: '0 0 1.25rem', color: 'var(--color-text)' }}>Research Context</h2>

        <div style={fieldStyle}>
          <label style={labelStyle}>Identified Person in Database</label>
          <select style={inputStyle} value={form.person_id} onChange={e => set('person_id', e.target.value)}>
            <option value="">-- Not linked --</option>
            {persons.map(p => <option key={p.id} value={p.id}>{p.display_name}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Hypothesized Relationship</label>
            <input style={inputStyle} value={form.hypothesized_relationship} onChange={e => set('hypothesized_relationship', e.target.value)} placeholder="e.g. 2nd cousin once removed" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Ancestral Line</label>
            <input style={inputStyle} value={form.ancestral_line} onChange={e => set('ancestral_line', e.target.value)} placeholder="e.g. Singer/Springer, Klein" />
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Documentary Evidence Supporting Hypothesis</label>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.documentary_evidence} onChange={e => set('documentary_evidence', e.target.value)} placeholder="Describe the documentary evidence that supports the hypothesized relationship." />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Endogamy Context</label>
          <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.endogamy_context} onChange={e => set('endogamy_context', e.target.value)} placeholder="Explain elevated cM values due to Ashkenazi endogamy if applicable." />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>In Common With</label>
          <input style={inputStyle} value={form.in_common_with} onChange={e => set('in_common_with', e.target.value)} placeholder="Key shared matches that triangulate the connection" />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Notes</label>
          <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional notes" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
        <Link href="/dna-matches" style={{ padding: '0.6rem 1.2rem', borderRadius: 6, border: '1px solid var(--color-border)', color: 'var(--color-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Cancel</Link>
        <button onClick={handleSubmit} disabled={saving} style={{ padding: '0.6rem 1.4rem', borderRadius: 6, background: 'var(--color-accent)', color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : 'Save Match'}
        </button>
      </div>
    </div>
  )
}
