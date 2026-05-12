'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type CorrespondenceEntry = {
  id: string
  date_sent: string
  recipient_name: string
  recipient_type: string
  subject: string
  outcome_status: string
  follow_up_needed: boolean
  date_responded: string | null
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', responded: 'Responded', no_response: 'No Response', closed: 'Closed',
}
const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--color-yellow)', responded: 'var(--color-green)',
  no_response: 'var(--color-red)', closed: 'var(--color-muted)',
}
const TYPE_LABELS: Record<string, string> = {
  repository: 'Repository', courthouse: 'Courthouse', archive: 'Archive',
  researcher: 'Researcher', dna_match: 'DNA Match', other: 'Other',
}

export default function CorrespondencePage() {
  const [entries, setEntries] = useState<CorrespondenceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    setLoading(true)
    const url = statusFilter === 'all' ? '/api/correspondence' : `/api/correspondence?status=${statusFilter}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setEntries(data); else setError(data.error || 'Failed to load.') })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false))
  }, [statusFilter])

  const pendingCount = entries.filter((e) => e.outcome_status === 'pending').length
  const followUpCount = entries.filter((e) => e.follow_up_needed).length

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
        <Link href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Dashboard</Link>{' '}&rsaquo; Correspondence Log
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>Correspondence Log</h1>
          <p style={{ color: 'var(--color-muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>All outgoing research inquiries and responses -- GPS element 1 (reasonably exhaustive search).</p>
        </div>
        <Link href="/correspondence/new" style={{ background: 'var(--color-accent)', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: 6, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap' }}>+ New Inquiry</Link>
      </div>

      {!loading && !error && (
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          {[{ label: 'Total', value: entries.length }, { label: 'Pending', value: pendingCount }, { label: 'Need Follow-Up', value: followUpCount }].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '0.75rem 1.25rem', minWidth: 110 }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'responded', 'no_response', 'closed'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '0.4rem 0.9rem', borderRadius: 20, border: '1px solid var(--color-border)', background: statusFilter === s ? 'var(--color-accent)' : 'var(--color-surface)', color: statusFilter === s ? '#fff' : 'var(--color-text)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: statusFilter === s ? 600 : 400 }}>
            {s === 'all' ? 'All' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: 'var(--color-muted)', padding: '2rem 0' }}>Loading...</div>}
      {error && <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-red)', borderRadius: 8, padding: '1rem 1.25rem', color: 'var(--color-red)' }}>{error}</div>}
      {!loading && !error && entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-muted)', border: '1px dashed var(--color-border)', borderRadius: 8 }}>
          No correspondence entries yet. <Link href="/correspondence/new" style={{ color: 'var(--color-accent)' }}>Log your first inquiry.</Link>
        </div>
      )}
      {!loading && !error && entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {entries.map((entry) => (
            <Link key={entry.id} href={`/correspondence/${entry.id}`} style={{ textDecoration: 'none' }}>
              <div
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-accent)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)')}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.subject}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span>{entry.recipient_name}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{TYPE_LABELS[entry.recipient_type] || entry.recipient_type}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>Sent {entry.date_sent}</span>
                    {entry.date_responded && <><span style={{ opacity: 0.4 }}>·</span><span>Responded {entry.date_responded}</span></>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 12, background: STATUS_COLORS[entry.outcome_status] + '22', color: STATUS_COLORS[entry.outcome_status], border: `1px solid ${STATUS_COLORS[entry.outcome_status]}44` }}>
                    {STATUS_LABELS[entry.outcome_status] || entry.outcome_status}
                  </span>
                  {entry.follow_up_needed && <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: 12, background: 'var(--color-yellow)22', color: 'var(--color-yellow)', border: '1px solid var(--color-yellow)44' }}>Follow-up needed</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
