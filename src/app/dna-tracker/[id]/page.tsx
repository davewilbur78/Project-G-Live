'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'

type DnaMatch = {
  id: string
  match_name: string
  platform: string
  shared_cm: number | null
  shared_segments: number | null
  largest_segment_cm: number | null
  kit_number: string | null
  match_email: string | null
  person_id: string | null
  status: string
  hypothesized_relationship: string | null
  ancestral_line: string | null
  documentary_evidence: string | null
  endogamy_context: string | null
  in_common_with: string | null
  notes: string | null
  created_at: string
  updated_at: string
  persons: { id: string; given_name: string; surname: string } | null
}

const STATUS_LABELS: Record<string, string> = {
  identified: 'Identified',
  working_hypothesis: 'Working Hypothesis',
  unresolved: 'Unresolved',
}
const STATUS_COLORS: Record<string, string> = {
  identified: 'var(--color-green)',
  working_hypothesis: 'var(--color-yellow)',
  unresolved: 'var(--color-muted)',
}
const PLATFORM_LABELS: Record<string, string> = {
  '23andme': '23andMe', ancestry: 'AncestryDNA', ftdna: 'FTDNA',
  myheritage: 'MyHeritage', gedmatch: 'GEDmatch', other: 'Other',
}

const INPUT_STYLE = {
  width: '100%', padding: '0.5rem 0.7rem', borderRadius: 6,
  border: '1px solid var(--color-border)', background: 'var(--color-surface)',
  color: 'var(--color-text)', fontSize: '0.88rem', boxSizing: 'border-box' as const,
}
const LABEL_STYLE = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600,
  color: 'var(--color-muted)', marginBottom: '0.3rem',
  textTransform: 'uppercase' as const, letterSpacing: '0.04em',
}
const FIELD = { marginBottom: '1.1rem' }

function ReadOnlyField({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div style={FIELD}>
      <div style={LABEL_STYLE}>{label}</div>
      <div style={{ fontSize: '0.9rem', color: value ? 'var(--color-text)' : 'var(--color-muted)', fontStyle: value ? 'normal' : 'italic', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
        {value != null && value !== '' ? String(value) : 'Not recorded'}
      </div>
    </div>
  )
}

export default function DnaMatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [match, setMatch] = useState<DnaMatch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteStep, setDeleteStep] = useState(0)
  const [form, setForm] = useState<Partial<DnaMatch>>({})

  useEffect(() => {
    fetch(`/api/dna-matches/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else { setMatch(data); setForm(data) }
      })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false))
  }, [id])

  const set = (k: string, v: string | number | null) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.match_name?.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/dna-matches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_name: form.match_name?.trim(),
          platform: form.platform,
          shared_cm: form.shared_cm ?? null,
          shared_segments: form.shared_segments ?? null,
          largest_segment_cm: form.largest_segment_cm ?? null,
          kit_number: form.kit_number || null,
          match_email: form.match_email || null,
          status: form.status,
          hypothesized_relationship: form.hypothesized_relationship || null,
          ancestral_line: form.ancestral_line || null,
          documentary_evidence: form.documentary_evidence || null,
          endogamy_context: form.endogamy_context || null,
          in_common_with: form.in_common_with || null,
          notes: form.notes || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save.'); return }
      setMatch(data); setForm(data); setEditing(false)
    } catch {
      setError('Network error.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (deleteStep === 0) { setDeleteStep(1); return }
    const res = await fetch(`/api/dna-matches/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/dna-tracker')
    else setError('Delete failed.')
  }

  if (loading) return <div style={{ padding: '3rem', color: 'var(--color-muted)' }}>Loading...</div>
  if (error && !match) return <div style={{ padding: '3rem', color: 'var(--color-red)' }}>{error}</div>
  if (!match) return null

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
        <Link href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Dashboard</Link>{' '}&rsaquo;{' '}
        <Link href="/dna-tracker" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>DNA Evidence Tracker</Link>{' '}&rsaquo; {match.match_name}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>{match.match_name}</h1>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 12, background: STATUS_COLORS[match.status] + '22', color: STATUS_COLORS[match.status], border: `1px solid ${STATUS_COLORS[match.status]}44` }}>
              {STATUS_LABELS[match.status] || match.status}
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: 12, background: 'var(--color-accent)22', color: 'var(--color-accent)', border: '1px solid var(--color-accent)44' }}>
              {PLATFORM_LABELS[match.platform] || match.platform}
            </span>
          </div>
          {match.ancestral_line && <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.88rem' }}>Line: {match.ancestral_line}</p>}
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          {!editing && (
            <button onClick={() => setEditing(true)} style={{ padding: '0.5rem 1.1rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '0.88rem' }}>Edit</button>
          )}
          {editing && (
            <>
              <button onClick={handleSave} disabled={saving} style={{ padding: '0.5rem 1.1rem', borderRadius: 6, border: 'none', background: 'var(--color-accent)', color: '#fff', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={() => { setEditing(false); setForm(match) }} style={{ padding: '0.5rem 1.1rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '0.88rem' }}>Cancel</button>
            </>
          )}
          <button
            onClick={handleDelete}
            style={{ padding: '0.5rem 1.1rem', borderRadius: 6, border: `1px solid ${deleteStep === 1 ? 'var(--color-red)' : 'var(--color-border)'}`, background: deleteStep === 1 ? 'var(--color-red)' : 'var(--color-surface)', color: deleteStep === 1 ? '#fff' : 'var(--color-muted)', cursor: 'pointer', fontSize: '0.88rem' }}
          >
            {deleteStep === 0 ? 'Delete' : 'Confirm Delete'}
          </button>
          {deleteStep === 1 && <button onClick={() => setDeleteStep(0)} style={{ padding: '0.5rem 0.8rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '0.88rem' }}>Keep</button>}
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '0.65rem 1rem', marginBottom: '1.75rem', fontSize: '0.82rem', color: 'var(--color-muted)' }}>
        <strong style={{ color: 'var(--color-text)' }}>GPS note:</strong> DNA evidence is corroborating indirect evidence -- never standalone proof. Every match hypothesis requires supporting documentary evidence.
      </div>

      {error && <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-red)', borderRadius: 8, padding: '0.75rem 1rem', color: 'var(--color-red)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>{error}</div>}

      {!editing ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
          <ReadOnlyField label="Shared cM" value={match.shared_cm} />
          <ReadOnlyField label="Shared Segments" value={match.shared_segments} />
          <ReadOnlyField label="Largest Segment (cM)" value={match.largest_segment_cm} />
          <ReadOnlyField label="Hypothesized Relationship" value={match.hypothesized_relationship} />
          <ReadOnlyField label="Kit Number" value={match.kit_number} />
          <ReadOnlyField label="Match Email" value={match.match_email} />
          {match.persons && (
            <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
              <div style={LABEL_STYLE}>Linked Person</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>{match.persons.given_name} {match.persons.surname}</div>
            </div>
          )}
          <div style={{ ...FIELD, gridColumn: '1 / -1' }}><ReadOnlyField label="Documentary Evidence" value={match.documentary_evidence} /></div>
          <div style={{ ...FIELD, gridColumn: '1 / -1' }}><ReadOnlyField label="Endogamy Context" value={match.endogamy_context} /></div>
          <div style={{ ...FIELD, gridColumn: '1 / -1' }}><ReadOnlyField label="In Common With (ICW)" value={match.in_common_with} /></div>
          <div style={{ ...FIELD, gridColumn: '1 / -1' }}><ReadOnlyField label="Notes" value={match.notes} /></div>
          <div style={{ gridColumn: '1 / -1', fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.5rem' }}>
            Added {new Date(match.created_at).toLocaleDateString()}
            {match.updated_at !== match.created_at && <> &middot; Updated {new Date(match.updated_at).toLocaleDateString()}</>}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
          <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
            <label style={LABEL_STYLE}>Match Name</label>
            <input style={INPUT_STYLE} value={form.match_name || ''} onChange={(e) => set('match_name', e.target.value)} />
          </div>
          <div style={FIELD}>
            <label style={LABEL_STYLE}>Platform</label>
            <select style={INPUT_STYLE} value={form.platform || '23andme'} onChange={(e) => set('platform', e.target.value)}>
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
            <select style={INPUT_STYLE} value={form.status || 'unresolved'} onChange={(e) => set('status', e.target.value)}>
              <option value="unresolved">Unresolved</option>
              <option value="working_hypothesis">Working Hypothesis</option>
              <option value="identified">Identified</option>
            </select>
          </div>
          <div style={FIELD}>
            <label style={LABEL_STYLE}>Shared cM</label>
            <input style={INPUT_STYLE} type="number" step="0.01" value={form.shared_cm ?? ''} onChange={(e) => set('shared_cm', e.target.value ? parseFloat(e.target.value) : null)} />
          </div>
          <div style={FIELD}>
            <label style={LABEL_STYLE}>Shared Segments</label>
            <input style={INPUT_STYLE} type="number" value={form.shared_segments ?? ''} onChange={(e) => set('shared_segments', e.target.value ? parseInt(e.target.value) : null)} />
          </div>
          <div style={FIELD}>
            <label style={LABEL_STYLE}>Largest Segment (cM)</label>
            <input style={INPUT_STYLE} type="number" step="0.01" value={form.largest_segment_cm ?? ''} onChange={(e) => set('largest_segment_cm', e.target.value ? parseFloat(e.target.value) : null)} />
          </div>
          <div style={FIELD}>
            <label style={LABEL_STYLE}>Hypothesized Relationship</label>
            <input style={INPUT_STYLE} value={form.hypothesized_relationship || ''} onChange={(e) => set('hypothesized_relationship', e.target.value)} />
          </div>
          <div style={FIELD}>
            <label style={LABEL_STYLE}>Kit Number</label>
            <input style={INPUT_STYLE} value={form.kit_number || ''} onChange={(e) => set('kit_number', e.target.value)} />
          </div>
          <div style={FIELD}>
            <label style={LABEL_STYLE}>Match Email</label>
            <input style={INPUT_STYLE} type="email" value={form.match_email || ''} onChange={(e) => set('match_email', e.target.value)} />
          </div>
          <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
            <label style={LABEL_STYLE}>Ancestral Line</label>
            <input style={INPUT_STYLE} value={form.ancestral_line || ''} onChange={(e) => set('ancestral_line', e.target.value)} />
          </div>
          <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
            <label style={LABEL_STYLE}>Documentary Evidence</label>
            <textarea style={{ ...INPUT_STYLE, minHeight: 90, resize: 'vertical' }} value={form.documentary_evidence || ''} onChange={(e) => set('documentary_evidence', e.target.value)} />
          </div>
          <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
            <label style={LABEL_STYLE}>Endogamy Context</label>
            <textarea style={{ ...INPUT_STYLE, minHeight: 70, resize: 'vertical' }} value={form.endogamy_context || ''} onChange={(e) => set('endogamy_context', e.target.value)} />
          </div>
          <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
            <label style={LABEL_STYLE}>In Common With (ICW)</label>
            <textarea style={{ ...INPUT_STYLE, minHeight: 60, resize: 'vertical' }} value={form.in_common_with || ''} onChange={(e) => set('in_common_with', e.target.value)} />
          </div>
          <div style={{ ...FIELD, gridColumn: '1 / -1' }}>
            <label style={LABEL_STYLE}>Notes</label>
            <textarea style={{ ...INPUT_STYLE, minHeight: 70, resize: 'vertical' }} value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} />
          </div>
        </div>
      )}
    </div>
  )
}
