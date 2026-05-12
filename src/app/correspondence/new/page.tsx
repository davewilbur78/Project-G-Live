'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const RECIPIENT_TYPES = [
  { value: 'repository', label: 'Repository' }, { value: 'courthouse', label: 'Courthouse' },
  { value: 'archive', label: 'Archive' }, { value: 'researcher', label: 'Researcher' },
  { value: 'dna_match', label: 'DNA Match' }, { value: 'other', label: 'Other' },
]

const L: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.4rem' }
const I: React.CSSProperties = { width: '100%', padding: '0.6rem 0.8rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.95rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }
const CARD: React.CSSProperties = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '1.5rem', marginBottom: '1.25rem' }
const H2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, margin: '0 0 1.25rem 0', color: 'var(--color-text)' }

export default function NewCorrespondencePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    date_sent: new Date().toISOString().slice(0, 10),
    recipient_name: '', recipient_type: 'repository',
    subject: '', question_asked: '', date_responded: '',
    outcome: '', outcome_status: 'pending', follow_up_needed: false, notes: '',
  })
  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }))

  async function handleSubmit() {
    setError(null)
    if (!form.recipient_name.trim() || !form.subject.trim() || !form.question_asked.trim()) {
      setError('Recipient name, subject, and question asked are all required.')
      return
    }
    setSubmitting(true)
    try {
      const resp = await fetch('/api/correspondence', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, date_responded: form.date_responded || null, outcome: form.outcome || null, notes: form.notes || null }),
      })
      const data = await resp.json()
      if (!resp.ok) { setError(data.error || 'Failed to save.'); setSubmitting(false); return }
      router.push(`/correspondence/${data.id}`)
    } catch { setError('Network error.'); setSubmitting(false) }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
        <Link href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Dashboard</Link>{' '}&rsaquo;{' '}
        <Link href="/correspondence" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Correspondence Log</Link>{' '}&rsaquo; New Inquiry
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 600, margin: '0 0 0.4rem 0', color: 'var(--color-text)' }}>Log an Inquiry</h1>
      <p style={{ color: 'var(--color-muted)', fontSize: '0.88rem', marginBottom: '2rem' }}>Record all outgoing research correspondence for GPS compliance (reasonably exhaustive search).</p>

      <div style={CARD}>
        <h2 style={H2}>Recipient</h2>
        <div style={{ marginBottom: '1.5rem' }}><label style={L}>Date Sent</label><input type="date" value={form.date_sent} onChange={(e) => set('date_sent', e.target.value)} style={I} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><label style={L}>Recipient Name</label><input type="text" placeholder="e.g. NYC Municipal Archives" value={form.recipient_name} onChange={(e) => set('recipient_name', e.target.value)} style={I} /></div>
          <div><label style={L}>Recipient Type</label><select value={form.recipient_type} onChange={(e) => set('recipient_type', e.target.value)} style={I}>{RECIPIENT_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></div>
        </div>
      </div>

      <div style={CARD}>
        <h2 style={H2}>The Inquiry</h2>
        <div style={{ marginBottom: '1.5rem' }}><label style={L}>Subject</label><input type="text" placeholder="e.g. Death certificate for Hyman Singer, d. 1943 Brooklyn" value={form.subject} onChange={(e) => set('subject', e.target.value)} style={I} /></div>
        <div><label style={L}>Question Asked</label><textarea placeholder="Describe exactly what was requested or asked." value={form.question_asked} onChange={(e) => set('question_asked', e.target.value)} rows={4} style={{ ...I, resize: 'vertical' }} /></div>
      </div>

      <div style={CARD}>
        <h2 style={{ ...H2, marginBottom: '0.4rem' }}>Response <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--color-muted)' }}>(optional -- fill in when received)</span></h2>
        <p style={{ fontSize: '0.83rem', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>Leave blank now and update when a response arrives.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div><label style={L}>Date Responded</label><input type="date" value={form.date_responded} onChange={(e) => set('date_responded', e.target.value)} style={I} /></div>
          <div><label style={L}>Status</label><select value={form.outcome_status} onChange={(e) => set('outcome_status', e.target.value)} style={I}><option value="pending">Pending</option><option value="responded">Responded</option><option value="no_response">No Response</option><option value="closed">Closed</option></select></div>
        </div>
        <div style={{ marginBottom: '1.25rem' }}><label style={L}>Outcome</label><textarea placeholder="What was the result?" value={form.outcome} onChange={(e) => set('outcome', e.target.value)} rows={3} style={{ ...I, resize: 'vertical' }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <input type="checkbox" id="fu" checked={form.follow_up_needed} onChange={(e) => set('follow_up_needed', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
          <label htmlFor="fu" style={{ fontSize: '0.88rem', cursor: 'pointer' }}>Flag for follow-up</label>
        </div>
      </div>

      <div style={CARD}>
        <h2 style={H2}>Notes <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--color-muted)' }}>(optional)</span></h2>
        <textarea placeholder="Context, related case studies, prior attempts." value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} style={{ ...I, resize: 'vertical' }} />
      </div>

      {error && <div style={{ border: '1px solid var(--color-red)', borderRadius: 8, padding: '0.75rem 1rem', color: 'var(--color-red)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={handleSubmit} disabled={submitting} style={{ background: submitting ? 'var(--color-muted)' : 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '0.65rem 1.5rem', fontSize: '0.95rem', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}>{submitting ? 'Saving...' : 'Save Inquiry'}</button>
        <Link href="/correspondence" style={{ padding: '0.65rem 1.25rem', borderRadius: 6, border: '1px solid var(--color-border)', color: 'var(--color-text)', textDecoration: 'none', fontSize: '0.95rem' }}>Cancel</Link>
      </div>
    </div>
  )
}
