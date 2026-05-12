'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Entry = {
  id: string; date_sent: string; recipient_name: string; recipient_type: string
  subject: string; question_asked: string; date_responded: string | null
  outcome: string | null; outcome_status: string; follow_up_needed: boolean
  notes: string | null; created_at: string; updated_at: string
  repository_id: string | null; person_id: string | null; source_id: string | null
  repositories?: { id: string; name: string } | null
  persons?: { id: string; given_name: string; surname: string } | null
  sources?: { id: string; title: string } | null
}

const SL: Record<string, string> = { pending: 'Pending', responded: 'Responded', no_response: 'No Response', closed: 'Closed' }
const SC: Record<string, string> = { pending: 'var(--color-yellow)', responded: 'var(--color-green)', no_response: 'var(--color-red)', closed: 'var(--color-muted)' }
const TL: Record<string, string> = { repository: 'Repository', courthouse: 'Courthouse', archive: 'Archive', researcher: 'Researcher', dna_match: 'DNA Match', other: 'Other' }
const RT = Object.entries(TL)

const LS: React.CSSProperties = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.35rem' }
const IS: React.CSSProperties = { width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.93rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }
const CARD: React.CSSProperties = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '1.25rem 1.5rem', marginBottom: '1rem' }

export default function CorrespondenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [ef, setEf] = useState<Partial<Entry>>({})

  useEffect(() => {
    fetch(`/api/correspondence/${id}`).then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else { setEntry(d); setEf(d) } })
      .catch(() => setError('Network error.')).finally(() => setLoading(false))
  }, [id])

  const setF = (k: string, v: string | boolean | null) => setEf((p) => ({ ...p, [k]: v }))

  async function handleSave() {
    setSaving(true); setSaveError(null)
    try {
      const resp = await fetch(`/api/correspondence/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...ef, date_responded: ef.date_responded || null, outcome: ef.outcome || null, notes: ef.notes || null }) })
      const d = await resp.json()
      if (!resp.ok) { setSaveError(d.error || 'Failed.'); setSaving(false); return }
      setEntry(d); setEditing(false)
    } catch { setSaveError('Network error.') } finally { setSaving(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try { await fetch(`/api/correspondence/${id}`, { method: 'DELETE' }); router.push('/correspondence') }
    catch { setDeleting(false); setConfirmDelete(false) }
  }

  if (loading) return <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem', color: 'var(--color-muted)' }}>Loading...</div>
  if (error || !entry) return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ color: 'var(--color-red)' }}>{error || 'Not found.'}</div>
      <Link href="/correspondence" style={{ color: 'var(--color-accent)', marginTop: '1rem', display: 'inline-block' }}>Back to Correspondence Log</Link>
    </div>
  )

  const sc = SC[entry.outcome_status] || 'var(--color-muted)'

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
        <Link href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Dashboard</Link>{' '}&rsaquo;{' '}
        <Link href="/correspondence" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Correspondence Log</Link>{' '}&rsaquo; {entry.subject}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600, margin: '0 0 0.4rem 0', color: 'var(--color-text)' }}>{entry.subject}</h1>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, padding: '0.2rem 0.65rem', borderRadius: 12, background: sc + '22', color: sc, border: `1px solid ${sc}44` }}>{SL[entry.outcome_status] || entry.outcome_status}</span>
            {entry.follow_up_needed && <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 12, background: 'var(--color-yellow)22', color: 'var(--color-yellow)', border: '1px solid var(--color-yellow)44' }}>Follow-up needed</span>}
            <span style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>{TL[entry.recipient_type] || entry.recipient_type}</span>
          </div>
        </div>
        {!editing && <button onClick={() => { setEf({ ...entry }); setSaveError(null); setEditing(true) }} style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 6, padding: '0.5rem 1rem', cursor: 'pointer', color: 'var(--color-text)', fontSize: '0.88rem' }}>Edit</button>}
      </div>

      {!editing && (
        <>
          <div style={{ ...CARD, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {[{ label: 'Recipient', value: entry.recipient_name }, { label: 'Type', value: TL[entry.recipient_type] || entry.recipient_type }, { label: 'Date Sent', value: entry.date_sent }, { label: 'Date Responded', value: entry.date_responded || 'Not yet received' }].map(({ label, value }) => (
              <div key={label}><div style={LS}>{label}</div><div style={{ fontSize: '0.93rem', color: 'var(--color-text)' }}>{value}</div></div>
            ))}
          </div>
          <div style={CARD}><div style={LS}>Question Asked</div><p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>{entry.question_asked}</p></div>
          {entry.outcome && <div style={CARD}><div style={LS}>Outcome</div><p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>{entry.outcome}</p></div>}
          {entry.notes && <div style={CARD}><div style={LS}>Notes</div><p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>{entry.notes}</p></div>}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            {!confirmDelete
              ? <button onClick={() => setConfirmDelete(true)} style={{ background: 'transparent', border: '1px solid var(--color-red)', borderRadius: 6, padding: '0.45rem 1rem', color: 'var(--color-red)', cursor: 'pointer', fontSize: '0.85rem' }}>Delete Entry</button>
              : <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: 'var(--color-red)', fontSize: '0.88rem', fontWeight: 600 }}>Permanently delete this entry?</span>
                  <button onClick={handleDelete} disabled={deleting} style={{ background: 'var(--color-red)', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.85rem' }}>{deleting ? 'Deleting...' : 'Yes, delete'}</button>
                  <button onClick={() => setConfirmDelete(false)} style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 6, padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-text)' }}>Cancel</button>
                </div>
            }
          </div>
        </>
      )}

      {editing && (
        <div>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '1.5rem', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, margin: '0 0 1.25rem 0' }}>Recipient</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div><label style={LS}>Date Sent</label><input type="date" value={ef.date_sent || ''} onChange={(e) => setF('date_sent', e.target.value)} style={IS} /></div>
              <div><label style={LS}>Recipient Type</label><select value={ef.recipient_type || 'other'} onChange={(e) => setF('recipient_type', e.target.value)} style={IS}>{RT.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
            </div>
            <div><label style={LS}>Recipient Name</label><input type="text" value={ef.recipient_name || ''} onChange={(e) => setF('recipient_name', e.target.value)} style={IS} /></div>
          </div>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '1.5rem', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, margin: '0 0 1.25rem 0' }}>The Inquiry</h2>
            <div style={{ marginBottom: '1rem' }}><label style={LS}>Subject</label><input type="text" value={ef.subject || ''} onChange={(e) => setF('subject', e.target.value)} style={IS} /></div>
            <div><label style={LS}>Question Asked</label><textarea value={ef.question_asked || ''} onChange={(e) => setF('question_asked', e.target.value)} rows={4} style={{ ...IS, resize: 'vertical' }} /></div>
          </div>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '1.5rem', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, margin: '0 0 1.25rem 0' }}>Response</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div><label style={LS}>Date Responded</label><input type="date" value={ef.date_responded || ''} onChange={(e) => setF('date_responded', e.target.value || null)} style={IS} /></div>
              <div><label style={LS}>Status</label><select value={ef.outcome_status || 'pending'} onChange={(e) => setF('outcome_status', e.target.value)} style={IS}><option value="pending">Pending</option><option value="responded">Responded</option><option value="no_response">No Response</option><option value="closed">Closed</option></select></div>
            </div>
            <div style={{ marginBottom: '1rem' }}><label style={LS}>Outcome</label><textarea value={ef.outcome || ''} onChange={(e) => setF('outcome', e.target.value)} rows={3} style={{ ...IS, resize: 'vertical' }} /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <input type="checkbox" id="fue" checked={ef.follow_up_needed ?? false} onChange={(e) => setF('follow_up_needed', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <label htmlFor="fue" style={{ fontSize: '0.88rem', cursor: 'pointer' }}>Flag for follow-up</label>
            </div>
          </div>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, margin: '0 0 1.25rem 0' }}>Notes</h2>
            <textarea value={ef.notes || ''} onChange={(e) => setF('notes', e.target.value)} rows={3} style={{ ...IS, resize: 'vertical' }} />
          </div>
          {saveError && <div style={{ color: 'var(--color-red)', fontSize: '0.88rem', marginBottom: '1rem' }}>{saveError}</div>}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleSave} disabled={saving} style={{ background: saving ? 'var(--color-muted)' : 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem 1.4rem', fontSize: '0.93rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
            <button onClick={() => { setEditing(false); setSaveError(null) }} style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 6, padding: '0.6rem 1.1rem', cursor: 'pointer', color: 'var(--color-text)', fontSize: '0.93rem' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
