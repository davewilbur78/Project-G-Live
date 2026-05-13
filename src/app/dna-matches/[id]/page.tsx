'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  persons: { id: string; given_name: string | null; surname: string | null } | null
}

type Person = { id: string; display_name: string }

const PLATFORM_LABELS: Record<string, string> = {
  '23andme': '23andMe', ancestry: 'AncestryDNA', ftdna: 'FamilyTreeDNA',
  myheritage: 'MyHeritage', gedmatch: 'GEDmatch', other: 'Other',
}
const STATUS_LABELS: Record<string, string> = {
  identified: 'Identified', working_hypothesis: 'Working Hypothesis', unresolved: 'Unresolved',
}
const STATUS_COLORS: Record<string, string> = {
  identified: 'var(--color-green)', working_hypothesis: 'var(--color-yellow)', unresolved: 'var(--color-muted)',
}
const PLATFORMS = [
  { value: '23andme', label: '23andMe' }, { value: 'ancestry', label: 'AncestryDNA' },
  { value: 'ftdna', label: 'FamilyTreeDNA' }, { value: 'myheritage', label: 'MyHeritage' },
  { value: 'gedmatch', label: 'GEDmatch' }, { value: 'other', label: 'Other' },
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
  display: 'block', fontSize: '0.75rem', fontWeight: 600,
  color: 'var(--color-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em',
}
const fieldStyle: React.CSSProperties = { marginBottom: '1.1rem' }

export default function DnaMatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [match, setMatch] = useState<DnaMatch | null>(null)
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteStep, setDeleteStep] = useState(0)
  const [form, setFormState] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([
      fetch(`/api/dna-matches/${id}`).then(r => r.json()),
      fetch('/api/persons').then(r => r.json()),
    ]).then(([matchData, personsData]) => {
      if (matchData.error) { setError(matchData.error); return }
      setMatch(matchData)
      setFormState({
        match_name: matchData.match_name || '',
        platform: matchData.platform || '23andme',
        shared_cm: matchData.shared_cm != null ? String(matchData.shared_cm) : '',
        shared_segments: matchData.shared_segments != null ? String(matchData.shared_segments) : '',
        largest_segment_cm: matchData.largest_segment_cm != null ? String(matchData.largest_segment_cm) : '',
        kit_number: matchData.kit_number || '',
        match_email: matchData.match_email || '',
        person_id: matchData.person_id || '',
        status: matchData.status || 'unresolved',
        hypothesized_relationship: matchData.hypothesized_relationship || '',
        ancestral_line: matchData.ancestral_line || '',
        documentary_evidence: matchData.documentary_evidence || '',
        endogamy_context: matchData.endogamy_context || '',
        in_common_with: matchData.in_common_with || '',
        notes: matchData.notes || '',
      })
      if (personsData.persons) setPersons(personsData.persons)
    }).catch(() => setError('Failed to load.')).finally(() => setLoading(false))
  }, [id])

  function set(field: string, value: string) {
    setFormState(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    const body: Record<string, unknown> = {
      match_name: form.match_name, platform: form.platform, status: form.status,
      person_id: form.person_id || null,
      kit_number: form.kit_number || null, match_email: form.match_email || null,
      hypothesized_relationship: form.hypothesized_relationship || null,
      ancestral_line: form.ancestral_line || null,
      documentary_evidence: form.documentary_evidence || null,
      endogamy_context: form.endogamy_context || null,
      in_common_with: form.in_common_with || null,
      notes: form.notes || null,
      shared_cm: form.shared_cm ? parseFloat(form.shared_cm) : null,
      shared_segments: form.shared_segments ? parseInt(form.shared_segments, 10) : null,
      largest_segment_cm: form.largest_segment_cm ? parseFloat(form.largest_segment_cm) : null,
    }
    const res = await fetch(`/api/dna-matches/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Save failed.'); setSaving(false); return }
    setMatch(data)
    setSaving(false)
    setEditing(false)
  }

  async function handleDelete() {
    const res = await fetch(`/api/dna-matches/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/dna-matches')
    else setError('Delete failed.')
  }

  if (loading) return <div style={{ padding: '2rem', color: 'var(--color-muted)' }}>Loading...</div>
  if (error && !match) return <div style={{ padding: '2rem', color: 'var(--color-red)' }}>{error}</div>
  if (!match) return null

  const statusColor = STATUS_COLORS[match.status] || 'var(--color-muted)'

  function ReadField({ label, value }: { label: string; value: string | number | null | undefined }) {
    if (value == null || value === '') return null
    return (
      <div style={fieldStyle}>
        <div style={labelStyle}>{label}</div>
        <div style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>{String(value)}</div>
      </div>
    )
  }

  function EditInput({ label, field, type = 'text', placeholder = '' }: { label: string; field: string; type?: string; placeholder?: string }) {
    return (
      <div style={fieldStyle}>
        <label style={labelStyle}>{label}</label>
        <input style={inputStyle} type={type} value={form[field] ?? ''} onChange={e => set(field, e.target.value)} placeholder={placeholder} />
      </div>
    )
  }

  function EditTextarea({ label, field, placeholder = '' }: { label: string; field: string; placeholder?: string }) {
    return (
      <div style={fieldStyle}>
        <label style={labelStyle}>{label}</label>
        <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form[field] ?? ''} onChange={e => set(field, e.target.value)} placeholder={placeholder} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
        <Link href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Dashboard</Link>
        {' '}&rsaquo;{' '}
        <Link href="/dna-matches" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>DNA Evidence Tracker</Link>
        {' '}&rsaquo; {match.match_name}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>
              {match.match_name}
            </h1>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, padding: '0.2rem 0.65rem', borderRadius: 12, background: statusColor + '22', color: statusColor, border: `1px solid ${statusColor}44` }}>
              {STATUS_LABELS[match.status] || match.status}
            </span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '0.35rem' }}>
            {PLATFORM_LABELS[match.platform] || match.platform}
            {match.shared_cm != null && ` · ${match.shared_cm} cM`}
            {match.shared_segments != null && ` · ${match.shared_segments} segments`}
          </div>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} style={{ padding: '0.5rem 1.1rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '0.88rem' }}>
            Edit
          </button>
        )}
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '0.7rem 1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: 'var(--color-muted)' }}>
        <strong style={{ color: 'var(--color-text)' }}>GPS Note:</strong> DNA evidence is corroborating indirect evidence under GPS. It must be supported by documentary evidence and cannot serve as standalone proof.
      </div>

      {error && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-red)', borderRadius: 8, padding: '0.85rem 1rem', marginBottom: '1.25rem', color: 'var(--color-red)', fontSize: '0.9rem' }}>{error}</div>
      )}

      {!editing ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem', color: 'var(--color-text)' }}>Match Data</h2>
            <ReadField label="Platform" value={PLATFORM_LABELS[match.platform] || match.platform} />
            <ReadField label="Shared cM" value={match.shared_cm} />
            <ReadField label="Shared Segments" value={match.shared_segments} />
            <ReadField label="Largest Segment" value={match.largest_segment_cm != null ? `${match.largest_segment_cm} cM` : null} />
            <ReadField label="Kit / Profile ID" value={match.kit_number} />
            <ReadField label="Contact Email" value={match.match_email} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem', color: 'var(--color-text)' }}>Research Context</h2>
            <ReadField label="Identified Person" value={match.persons ? [match.persons.given_name, match.persons.surname].filter(Boolean).join(' ') : null} />
            <ReadField label="Hypothesized Relationship" value={match.hypothesized_relationship} />
            <ReadField label="Ancestral Line" value={match.ancestral_line} />
            <ReadField label="In Common With" value={match.in_common_with} />
          </div>
          {match.documentary_evidence && (
            <div style={{ gridColumn: '1 / -1', ...fieldStyle }}>
              <div style={labelStyle}>Documentary Evidence Supporting Hypothesis</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{match.documentary_evidence}</div>
            </div>
          )}
          {match.endogamy_context && (
            <div style={{ gridColumn: '1 / -1', ...fieldStyle }}>
              <div style={labelStyle}>Endogamy Context</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{match.endogamy_context}</div>
            </div>
          )}
          {match.notes && (
            <div style={{ gridColumn: '1 / -1', ...fieldStyle }}>
              <div style={labelStyle}>Notes</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{match.notes}</div>
            </div>
          )}
          <div style={{ gridColumn: '1 / -1', fontSize: '0.78rem', color: 'var(--color-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            Added {new Date(match.created_at).toLocaleDateString()}
            {match.updated_at !== match.created_at && ` · Updated ${new Date(match.updated_at).toLocaleDateString()}`}
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '1.75rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, margin: '0 0 1.25rem' }}>Edit Match</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}><EditInput label="Match Name *" field="match_name" /></div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Platform</label>
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
            <EditInput label="Shared cM" field="shared_cm" type="number" placeholder="e.g. 234.5" />
            <EditInput label="Shared Segments" field="shared_segments" type="number" placeholder="e.g. 8" />
            <EditInput label="Largest Segment (cM)" field="largest_segment_cm" type="number" placeholder="e.g. 48.2" />
            <EditInput label="Kit / Profile ID" field="kit_number" />
            <div style={{ gridColumn: '1 / -1' }}><EditInput label="Contact Email" field="match_email" type="email" /></div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1.25rem 0' }} />
          <div style={fieldStyle}>
            <label style={labelStyle}>Identified Person</label>
            <select style={inputStyle} value={form.person_id} onChange={e => set('person_id', e.target.value)}>
              <option value="">-- Not linked --</option>
              {persons.map(p => <option key={p.id} value={p.id}>{p.display_name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <EditInput label="Hypothesized Relationship" field="hypothesized_relationship" placeholder="e.g. 2nd cousin once removed" />
            <EditInput label="Ancestral Line" field="ancestral_line" placeholder="e.g. Singer/Springer" />
          </div>
          <EditTextarea label="Documentary Evidence Supporting Hypothesis" field="documentary_evidence" placeholder="Describe the documentary evidence." />
          <EditTextarea label="Endogamy Context" field="endogamy_context" placeholder="Explain elevated cM values due to Ashkenazi endogamy if applicable." />
          <EditInput label="In Common With" field="in_common_with" placeholder="Key shared matches" />
          <EditTextarea label="Notes" field="notes" />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={() => setEditing(false)} style={{ padding: '0.5rem 1.1rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '0.88rem' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '0.5rem 1.2rem', borderRadius: 6, background: 'var(--color-accent)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.88rem', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {!editing && (
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          {deleteStep === 0 && (
            <button onClick={() => setDeleteStep(1)} style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid var(--color-red)', background: 'transparent', color: 'var(--color-red)', cursor: 'pointer', fontSize: '0.85rem' }}>
              Delete Match
            </button>
          )}
          {deleteStep === 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-red)' }}>Permanently delete this match record?</span>
              <button onClick={handleDelete} style={{ padding: '0.45rem 1rem', borderRadius: 6, background: 'var(--color-red)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Confirm Delete</button>
              <button onClick={() => setDeleteStep(0)} style={{ padding: '0.45rem 1rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
