'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { TimelineEvent, Source } from '@/types'

const EVENT_TYPES = [
  { value: 'birth',            label: 'Birth' },
  { value: 'death',            label: 'Death' },
  { value: 'marriage',         label: 'Marriage' },
  { value: 'divorce',          label: 'Divorce' },
  { value: 'residence',        label: 'Residence' },
  { value: 'immigration',      label: 'Immigration' },
  { value: 'emigration',       label: 'Emigration' },
  { value: 'naturalization',   label: 'Naturalization' },
  { value: 'military_service', label: 'Military Service' },
  { value: 'occupation',       label: 'Occupation' },
  { value: 'land_record',      label: 'Land Record' },
  { value: 'census',           label: 'Census' },
  { value: 'baptism',          label: 'Baptism' },
  { value: 'burial',           label: 'Burial' },
  { value: 'education',        label: 'Education' },
  { value: 'other',            label: 'Other' },
]

const DATE_QUALIFIERS = [
  { value: 'exact',      label: 'Exact' },
  { value: 'about',      label: 'About' },
  { value: 'before',     label: 'Before' },
  { value: 'after',      label: 'After' },
  { value: 'between',    label: 'Between' },
  { value: 'calculated', label: 'Calculated' },
]

const EVENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map(t => [t.value, t.label])
)

const EVENT_TYPE_COLOR: Record<string, string> = {
  birth:            'text-green-700 bg-green-50 border-green-200',
  death:            'text-stone-700 bg-stone-100 border-stone-300',
  marriage:         'text-purple-700 bg-purple-50 border-purple-200',
  divorce:          'text-red-700 bg-red-50 border-red-200',
  residence:        'text-blue-700 bg-blue-50 border-blue-200',
  immigration:      'text-teal-700 bg-teal-50 border-teal-200',
  emigration:       'text-teal-700 bg-teal-50 border-teal-200',
  naturalization:   'text-indigo-700 bg-indigo-50 border-indigo-200',
  military_service: 'text-amber-700 bg-amber-50 border-amber-200',
  occupation:       'text-orange-700 bg-orange-50 border-orange-200',
  land_record:      'text-yellow-800 bg-yellow-50 border-yellow-200',
  census:           'text-cyan-700 bg-cyan-50 border-cyan-200',
  baptism:          'text-violet-700 bg-violet-50 border-violet-200',
  burial:           'text-stone-700 bg-stone-100 border-stone-300',
  education:        'text-sky-700 bg-sky-50 border-sky-200',
  other:            'text-gray-700 bg-gray-50 border-gray-200',
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-[var(--color-text)]">{value}</p>
    </div>
  )
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params)
  const router  = useRouter()

  const [event,    setEvent]    = useState<TimelineEvent | null>(null)
  const [sources,  setSources]  = useState<Source[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [editing,  setEditing]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [eventType,     setEventType]     = useState('')
  const [dateDisplay,   setDateDisplay]   = useState('')
  const [dateQualifier, setDateQualifier] = useState('exact')
  const [eventDate,     setEventDate]     = useState('')
  const [eventDateEnd,  setEventDateEnd]  = useState('')
  const [placeName,     setPlaceName]     = useState('')
  const [sourceId,      setSourceId]      = useState('')
  const [evidenceType,  setEvidenceType]  = useState('')
  const [description,   setDescription]   = useState('')
  const [notes,         setNotes]         = useState('')
  const [resFrom,       setResFrom]       = useState('')
  const [resTo,         setResTo]         = useState('')
  const [resCurrent,    setResCurrent]    = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(`/api/timeline/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const e: TimelineEvent = data.event
      setEvent(e)
      setEventType(e.event_type)
      setDateDisplay(e.date_display      ?? '')
      setDateQualifier(e.date_qualifier  ?? 'exact')
      setEventDate(e.event_date          ?? '')
      setEventDateEnd(e.event_date_end   ?? '')
      setPlaceName(e.place_name          ?? '')
      setSourceId(e.source_id            ?? '')
      setEvidenceType(e.evidence_type    ?? '')
      setDescription(e.description       ?? '')
      setNotes(e.notes                   ?? '')
      setResFrom(e.residence_date_from   ?? '')
      setResTo(e.residence_date_to       ?? '')
      setResCurrent(e.residence_current  ?? false)
    } catch {
      setError('Could not load event.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
    fetch('/api/citation-builder').then(r => r.json()).then(d => setSources(d.sources ?? []))
  }, [load])

  const handleSave = async () => {
    if (!evidenceType) { setError('GPS evidence type is required.'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/timeline/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type:          eventType,
          date_display:        dateDisplay    || null,
          date_qualifier:      dateQualifier,
          event_date:          eventDate      || null,
          event_date_end:      eventDateEnd   || null,
          place_name:          placeName      || null,
          source_id:           sourceId       || null,
          evidence_type:       evidenceType   || null,
          description:         description    || null,
          notes:               notes          || null,
          residence_date_from: resFrom        || null,
          residence_date_to:   resTo          || null,
          residence_current:   resCurrent,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await load()
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    try {
      const res = await fetch(`/api/timeline/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.push('/timeline')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.')
      setDeleting(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]'
  const labelCls = 'block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1'
  const mutedCls = 'block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1 opacity-50'

  if (loading) return <div className="min-h-screen bg-[var(--color-bg)] p-10"><p className="text-sm text-[var(--color-text-muted)]">Loading...</p></div>
  if (error && !event) return <div className="min-h-screen bg-[var(--color-bg)] p-10"><p className="text-sm text-red-400">{error}</p><Link href="/timeline" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] mt-4 block">&larr; Timeline</Link></div>
  if (!event) return null

  const typeLabel = EVENT_TYPE_LABELS[event.event_type] ?? event.event_type
  const typeColor = EVENT_TYPE_COLOR[event.event_type]  ?? EVENT_TYPE_COLOR.other
  const isRes     = event.event_type === 'residence'
  const a         = event.address

  const displayAddr = () => {
    if (!a) return null
    const parts = [a.street_address, a.city, a.state_province, a.country].filter(Boolean)
    return parts.length ? parts.join(', ') : a.raw_text
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        <Link
          href={event.person_id ? `/timeline?person_id=${event.person_id}` : '/timeline'}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-3"
        >
          &larr; Timeline
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 border rounded font-mono ${typeColor}`}>{typeLabel}</span>
              {event.evidence_type && (
                <span className="text-xs px-2 py-0.5 border border-[var(--color-border)] rounded font-mono text-[var(--color-text-muted)]">
                  {event.evidence_type}
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl text-[var(--color-gold)] mb-1">
              {isRes && displayAddr() ? displayAddr() : (event.date_display ?? event.description?.slice(0, 60) ?? typeLabel)}
            </h1>
            {event.person && <p className="text-sm text-[var(--color-text-muted)]">{event.person.display_name}</p>}
          </div>
          {!editing && (
            <button
              onClick={() => { setEditing(true); setConfirmDelete(false); setError(null) }}
              className="px-4 py-2 border border-[var(--color-border)] text-sm font-mono text-[var(--color-text-muted)] rounded hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">{error}</div>
        )}

        {/* Read-only view */}
        {!editing && (
          <div className="space-y-6">

            <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded space-y-3">
              <Field label="Date"           value={event.date_display} />
              <Field label="Date Qualifier" value={event.date_qualifier} />
              {event.event_date && <Field label="ISO (sort)" value={event.event_date} />}
            </div>

            {isRes && a ? (
              <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Address</p>
                  <span className="text-xs font-mono text-[var(--color-text-muted)]">{a.address_role}</span>
                </div>
                {a.raw_text && (
                  <div>
                    <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Raw Text (source)</p>
                    <p className="text-sm font-mono italic text-[var(--color-text)]">{a.raw_text}</p>
                  </div>
                )}
                <Field label="Street Address"  value={a.street_address} />
                <Field label="City"            value={a.city} />
                <Field label="County"          value={a.county} />
                <Field label="State / Province" value={a.state_province} />
                <Field label="Country"         value={a.country} />
                {a.notes && <Field label="Address Notes" value={a.notes} />}
                {event.residence_date_from && <Field label="Residence From" value={event.residence_date_from} />}
                {event.residence_date_to   && <Field label="Residence To"   value={event.residence_date_to} />}
                {event.residence_current && <p className="text-xs font-mono text-[var(--color-gold)]">Current / last known address</p>}
              </div>
            ) : (
              event.place_name && (
                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
                  <Field label="Place" value={event.place_name} />
                </div>
              )
            )}

            {event.source && (
              <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded space-y-2">
                <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Source</p>
                <p className="text-sm text-[var(--color-text)]">{event.source.label}</p>
                <p className="text-xs font-mono text-[var(--color-text-muted)]">{event.source.ee_short_citation}</p>
                {event.source.ee_full_citation && <p className="text-xs text-[var(--color-text-muted)]">{event.source.ee_full_citation}</p>}
              </div>
            )}

            {event.description && (
              <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
                <Field label="Description" value={event.description} />
              </div>
            )}
            {event.notes && (
              <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
                <Field label="Notes" value={event.notes} />
              </div>
            )}

            <div className="pt-4 border-t border-[var(--color-border)]">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-mono text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {confirmDelete ? 'Click again to confirm delete' : 'Delete event'}
              </button>
              {confirmDelete && (
                <button onClick={() => setConfirmDelete(false)} className="ml-4 text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {/* Edit form */}
        {editing && (
          <div className="space-y-6">

            <div>
              <label className={labelCls}>Event Type</label>
              <select value={eventType} onChange={e => setEventType(e.target.value)} className={inputCls}>
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date</label>
                  <input
                    type="text"
                    value={dateDisplay}
                    onChange={e => setDateDisplay(e.target.value)}
                    placeholder="01 Feb 1981"
                    className={inputCls}
                  />
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">e.g. 01 Feb 1981 &bull; abt 1880</p>
                </div>
                <div>
                  <label className={labelCls}>Date Qualifier</label>
                  <select value={dateQualifier} onChange={e => setDateQualifier(e.target.value)} className={inputCls}>
                    {DATE_QUALIFIERS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={mutedCls}>ISO date for sorting (YYYY-MM-DD)</label>
                  <input type="text" value={eventDate} onChange={e => setEventDate(e.target.value)} placeholder="1981-02-01" className={`${inputCls} opacity-60 text-xs`} />
                </div>
                {dateQualifier === 'between' && (
                  <div>
                    <label className={mutedCls}>End ISO date (YYYY-MM-DD)</label>
                    <input type="text" value={eventDateEnd} onChange={e => setEventDateEnd(e.target.value)} placeholder="1925-12-31" className={`${inputCls} opacity-60 text-xs`} />
                  </div>
                )}
              </div>
            </div>

            {eventType !== 'residence' && (
              <div>
                <label className={labelCls}>Place</label>
                <input type="text" value={placeName} onChange={e => setPlaceName(e.target.value)} className={inputCls} />
              </div>
            )}

            {eventType === 'residence' && (
              <div className="border border-[var(--color-border)] rounded p-4 space-y-3">
                <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Residence Duration</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>From</label>
                    <input type="text" value={resFrom} onChange={e => setResFrom(e.target.value)} placeholder="1920" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>To</label>
                    <input type="text" value={resTo} onChange={e => setResTo(e.target.value)} placeholder="1935" className={inputCls} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="editResCurrent" checked={resCurrent} onChange={e => setResCurrent(e.target.checked)} className="accent-[var(--color-gold)]" />
                  <label htmlFor="editResCurrent" className="text-sm text-[var(--color-text-muted)]">Current / last known address</label>
                </div>
              </div>
            )}

            <div>
              <label className={labelCls}>Source</label>
              <select value={sourceId} onChange={e => setSourceId(e.target.value)} className={inputCls}>
                <option value="">-- None --</option>
                {sources.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>GPS Evidence Type *</label>
              <div className="flex gap-2">
                {(['Direct', 'Indirect', 'Negative'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEvidenceType(t)}
                    className={`px-4 py-2 text-sm font-mono rounded border transition-colors ${
                      evidenceType === t
                        ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold-subtle)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
            </div>

            <div>
              <label className={labelCls}>Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setError(null) }}
                className="px-6 py-2.5 border border-[var(--color-border)] text-sm font-mono text-[var(--color-text-muted)] rounded hover:border-[var(--color-gold)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
