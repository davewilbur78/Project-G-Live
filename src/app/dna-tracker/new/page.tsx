'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const INPUT_STYLE = {
  width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6,
  border: '1px solid var(--color-border)', background: 'var(--color-surface)',
  color: 'var(--color-text)', fontSize: '0.9rem', boxSizing: 'border-box' as const,
}
const LABEL_STYLE = {
  display: 'block', fontSize: '0.82rem', fontWeight: 600,
  color: 'var(--color-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
}
const FIELD = { marginBottom: '1.25rem' }

export default function NewDnaMatchPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    match_name: '',
    platform: '23andme',
    shared_cm: '',
    shared_segments: '',
    largest_segment_cm: '',
    kit_number: '',
    match_email: '',
    status: 'unresolved',
    hypothesized_relationship: '',
    ancestral_line: '',
    documentary_evidence: '',
    endogamy_context: '',
    in_common_with: '',
    notes: '',
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit() {
    if (!form.match_name.trim()) { setError('Match name is required.'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/dna-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_name: form.match_name.trim(),
          platform: form.platform,
          shared_cm: form.shared_cm ? parseFloat(form.shared_cm) : null,
          shared_segments: form.shared_segments ? parseInt(form.shared_segments) : null,
          largest_segment_cm: form.largest_segment_cm ? parseFloat(form.largest_segment_cm) : null,
          kit_number: form.kit_number.trim() || null,
          match_email: form.match_email.trim() || null,
          status: form.status,
          hypothesized_relationship: form.hypothesized_relationship.trim() || null,
          ancestral_line: form.ancestral_line.trim() || null,
          documentary_evidence: form.documentary_evidence.trim() || null,
          endogamy_context: form.endogamy_context.trim() || null,
          in_common_with: form.in_common_with.trim() || null,
          notes: form.notes.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save.'); return }
      router.push(`/dna-tracker/${data.id}`)
    } catch {
      setError('Network error.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
        <Link href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Dashboard</Link>{' '}&rsaquo;{' '}
        <Link href="/dna-tracker" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>DNA Evidence Tracker</Link>{' '}&rsaquo; New Match
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 600, margin: '0 0 0.4rem', color: 'var(--color-text)' }}>Add DNA Match</h1>
      <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>Record a DNA match and link it to your documentary evidence.</p>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '0.65rem 1rem', marginBottom: '1.75rem', fontSize: '0.82rem', color: 'var(--color-muted)' }}>
        <strong style={{ color: 'var(--color-text)' }}>GPS note:</strong> DNA evidence is corroborating indirect evidence under GPS -- never standalone proof. Document the supporting documentary evidence for every hypothesis.
      </div>

      {error && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-red)', borderRadius: 8, padding: '0.75rem 1rem', color: 'var(--color-red)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
        <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
          <label style={LABEL_STYLE}>Match Name <span style={{ color: 'var(--color-red)' }}>*</span></label>
          <input style={INPUT_STYLE} value={form.match_name} onChange={(e) => set('match_name', e.target.value)} placeholder="e.g. John D. or DNA Match #1234" />
        </div>

        <div style={FIELD}>
          <label style={LABEL_STYLE}>Platform <span style={{ color: 'var(--color-red)' }}>*</span></label>
          <select style={INPUT_STYLE} value={form.platform} onChange={(e) => set('platform', e.target.value)}>
            <option value="23andme">23andMe</option>
            <option value="ancestry">AncestryDNA</option>
            <option value="ftdna">FTDNA</option>
            <option value="myheritage">MyHeritage</option>
            <option value="gedmatch">GEDmatch</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={FIELD}>
          <label style={LABEL_STYLE}>Status</label>
          <select style={INPUT_STYLE} value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="unresolved">Unresolved</option>
            <option value="working_hypothesis">Working Hypothesis</option>
            <option value="identified">Identified</option>
          </select>
        </div>

        <div style={FIELD}>
          <label style={LABEL_STYLE}>Shared cM</label>
          <input style={INPUT_STYLE} type="number" step="0.01" min="0" value={form.shared_cm} onChange={(e) => set('shared_cm', e.target.value)} placeholder="e.g. 142.5" />
        </div>

        <div style={FIELD}>
          <label style={LABEL_STYLE}>Shared Segments</label>
          <input style={INPUT_STYLE} type="number" min="0" value={form.shared_segments} onChange={(e) => set('shared_segments', e.target.value)} placeholder="e.g. 6" />
        </div>

        <div style={FIELD}>
          <label style={LABEL_STYLE}>Largest Segment (cM)</label>
          <input style={INPUT_STYLE} type="number" step="0.01" min="0" value={form.largest_segment_cm} onChange={(e) => set('largest_segment_cm', e.target.value)} placeholder="e.g. 38.2" />
        </div>

        <div style={FIELD}>
          <label style={LABEL_STYLE}>Kit Number</label>
          <input style={INPUT_STYLE} value={form.kit_number} onChange={(e) => set('kit_number', e.target.value)} placeholder="Platform kit ID" />
        </div>

        <div style={FIELD}>
          <label style={LABEL_STYLE}>Hypothesized Relationship</label>
          <input style={INPUT_STYLE} value={form.hypothesized_relationship} onChange={(e) => set('hypothesized_relationship', e.target.value)} placeholder="e.g. 2nd cousin once removed" />
        </div>

        <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
          <label style={LABEL_STYLE}>Ancestral Line Being Investigated</label>
          <input style={INPUT_STYLE} value={form.ancestral_line} onChange={(e) => set('ancestral_line', e.target.value)} placeholder="e.g. Klein -- Zaslav maternal line" />
        </div>

        <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
          <label style={LABEL_STYLE}>Match Email (if known)</label>
          <input style={INPUT_STYLE} type="email" value={form.match_email} onChange={(e) => set('match_email', e.target.value)} placeholder="match@example.com" />
        </div>

        <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
          <label style={LABEL_STYLE}>Documentary Evidence Supporting This Hypothesis</label>
          <textarea style={{ ...INPUT_STYLE, minHeight: 90, resize: 'vertical' }} value={form.documentary_evidence} onChange={(e) => set('documentary_evidence', e.target.value)} placeholder="Describe the documentary evidence that supports the hypothesized relationship..." />
        </div>

        <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
          <label style={LABEL_STYLE}>Endogamy Context</label>
          <textarea style={{ ...INPUT_STYLE, minHeight: 70, resize: 'vertical' }} value={form.endogamy_context} onChange={(e) => set('endogamy_context', e.target.value)} placeholder="Note elevated cM values due to Ashkenazi endogamy or other endogamous population context..." />
        </div>

        <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
          <label style={LABEL_STYLE}>In Common With (ICW matches)</label>
          <textarea style={{ ...INPUT_STYLE, minHeight: 60, resize: 'vertical' }} value={form.in_common_with} onChange={(e) => set('in_common_with', e.target.value)} placeholder="List key shared matches and what they indicate about the line..." />
        </div>

        <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
          <label style={LABEL_STYLE}>Notes</label>
          <textarea style={{ ...INPUT_STYLE, minHeight: 70, resize: 'vertical' }} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Additional notes..." />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{ background: 'var(--color-accent)', color: '#fff', border: 'none', padding: '0.65rem 1.5rem', borderRadius: 6, fontWeight: 600, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving...' : 'Save Match'}
        </button>
        <Link href="/dna-tracker" style={{ padding: '0.65rem 1.2rem', borderRadius: 6, border: '1px solid var(--color-border)', color: 'var(--color-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Cancel</Link>
      </div>
    </div>
  )
}
