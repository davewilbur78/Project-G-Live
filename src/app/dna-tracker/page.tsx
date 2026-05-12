'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type DnaMatch = {
  id: string
  match_name: string
  platform: string
  shared_cm: number | null
  shared_segments: number | null
  status: string
  hypothesized_relationship: string | null
  ancestral_line: string | null
  persons: { given_name: string; surname: string } | null
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
  '23andme': '23andMe',
  ancestry: 'Ancestry',
  ftdna: 'FTDNA',
  myheritage: 'MyHeritage',
  gedmatch: 'GEDmatch',
  other: 'Other',
}

export default function DnaTrackerPage() {
  const [matches, setMatches] = useState<DnaMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    setLoading(true)
    const url = statusFilter === 'all' ? '/api/dna-matches' : `/api/dna-matches?status=${statusFilter}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMatches(data)
        else setError(data.error || 'Failed to load.')
      })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false))
  }, [statusFilter])

  const identifiedCount = matches.filter((m) => m.status === 'identified').length
  const hypothesisCount = matches.filter((m) => m.status === 'working_hypothesis').length
  const unresolvedCount = matches.filter((m) => m.status === 'unresolved').length

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
        <Link href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Dashboard</Link>{' '}&rsaquo; DNA Evidence Tracker
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>DNA Evidence Tracker</h1>
          <p style={{ color: 'var(--color-muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>DNA matches linked to documentary evidence. Designed for Ashkenazi endogamy.</p>
        </div>
        <Link href="/dna-tracker/new" style={{ background: 'var(--color-accent)', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: 6, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap' }}>+ Add Match</Link>
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '0.65rem 1rem', marginBottom: '1.75rem', fontSize: '0.82rem', color: 'var(--color-muted)' }}>
        <strong style={{ color: 'var(--color-text)' }}>GPS note:</strong> DNA evidence is corroborating indirect evidence -- never standalone proof. Every match hypothesis requires supporting documentary evidence.
      </div>

      {!loading && !error && (
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Matches', value: matches.length },
            { label: 'Identified', value: identifiedCount },
            { label: 'Working Hypothesis', value: hypothesisCount },
            { label: 'Unresolved', value: unresolvedCount },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '0.75rem 1.25rem', minWidth: 110 }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'identified', 'working_hypothesis', 'unresolved'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '0.4rem 0.9rem', borderRadius: 20,
              border: '1px solid var(--color-border)',
              background: statusFilter === s ? 'var(--color-accent)' : 'var(--color-surface)',
              color: statusFilter === s ? '#fff' : 'var(--color-text)',
              cursor: 'pointer', fontSize: '0.82rem',
              fontWeight: statusFilter === s ? 600 : 400,
            }}
          >
            {s === 'all' ? 'All' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: 'var(--color-muted)', padding: '2rem 0' }}>Loading...</div>}
      {error && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-red)', borderRadius: 8, padding: '1rem 1.25rem', color: 'var(--color-red)' }}>{error}</div>
      )}
      {!loading && !error && matches.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-muted)', border: '1px dashed var(--color-border)', borderRadius: 8 }}>
          No DNA matches yet.{' '}
          <Link href="/dna-tracker/new" style={{ color: 'var(--color-accent)' }}>Add your first match.</Link>
        </div>
      )}
      {!loading && !error && matches.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {matches.map((match) => (
            <Link key={match.id} href={`/dna-tracker/${match.id}`} style={{ textDecoration: 'none' }}>
              <div
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-accent)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)')}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)' }}>{match.match_name}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: 12, background: 'var(--color-accent)22', color: 'var(--color-accent)', border: '1px solid var(--color-accent)44' }}>
                      {PLATFORM_LABELS[match.platform] || match.platform}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {match.shared_cm != null && <span>{match.shared_cm} cM</span>}
                    {match.shared_segments != null && <><span style={{ opacity: 0.4 }}>·</span><span>{match.shared_segments} seg.</span></>}
                    {match.ancestral_line && <><span style={{ opacity: 0.4 }}>·</span><span>{match.ancestral_line}</span></>}
                    {match.hypothesized_relationship && <><span style={{ opacity: 0.4 }}>·</span><span>{match.hypothesized_relationship}</span></>}
                    {match.persons && <><span style={{ opacity: 0.4 }}>·</span><span>Linked: {match.persons.given_name} {match.persons.surname}</span></>}
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 12, background: STATUS_COLORS[match.status] + '22', color: STATUS_COLORS[match.status], border: `1px solid ${STATUS_COLORS[match.status]}44` }}>
                    {STATUS_LABELS[match.status] || match.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
