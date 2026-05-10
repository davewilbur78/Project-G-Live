'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { Person, Source } from '@/types'

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

const ADDRESS_ROLES = [
  { value: 'residence',   label: 'Residence -- person lived here' },
  { value: 'employer',    label: 'Employer address' },
  { value: 'next_of_kin', label: 'Next of kin address' },
  { value: 'witness',     label: 'Witness address' },
  { value: 'informant',   label: 'Informant address' },
  { value: 'decedent',    label: 'Decedent address' },
  { value: 'applicant',   label: 'Applicant address' },
  { value: 'beneficiary', label: 'Beneficiary address' },
  { value: 'other',       label: 'Other' },
]

function NewEventForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const presetPerson = searchParams.get('person_id') ?? ''

  const [persons,     setPersons]     = useState<Person[]>([])
  const [sources,     setSources]     = useState<Source[]>([])
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [normalizing, setNormalizing] = useState(false)

  const [personId,      setPersonId]      = useState(presetPerson)
  const [eventType,     setEventType]     = useState('residence')
  const [dateDisplay,   setDateDisplay]   = useState('')
  const [dateQualifier, setDateQualifier] = useState('exact')
  const [eventDate,     setEventDate]     = useState('')   // YYYY-MM-DD, for sorting only
  const [eventDateEnd,  setEventDateEnd]  = useState('')   // YYYY-MM-DD, for between ranges
  const [placeName,     setPlaceName]     = useState('')
  const [sourceId,      setSourceId]      = useState('')
  const [evidenceType,  setEvidenceType]  = useState('')
  const [description,   setDescription]   = useState('')
  const [notes,         setNotes]         = useState('')

  // Residence duration -- free text, same style as genealogy dates
  const [resFrom,    setResFrom]    = useState('')
  const [resTo,      setResTo]      = useState('')
  const [resCurrent, setResCurrent] = useState(false)

  // Address
  const [addrRole,    setAddrRole]    = useState('residence')
  const [addrRaw,     setAddrRaw]     = useState('')
  const [addrStreet,  setAddrStreet]  = useState('')
  const [addrCity,    setAddrCity]    = useState('')
  const [addrCounty,  setAddrCounty]  = useState('')
  const [addrState,   setAddrState]   = useState('')
  const [addrCountry, setAddrCountry] = useState('')
  const [addrNotes,   setAddrNotes]   = useState('')

  const isResidence = eventType === 'residence'

  useEffect(() => {
    fetch('/api/persons').then(r => r.json()).then(d => setPersons(d.persons ?? []))
    fetch('/api/citation-builder').then(r => r.json()).then(d => setSources(d.sources ?? []))
  }, [])

  const handleNormalize = async () => {
    if (!addrRaw.trim()) return
    setNormalizing(true)
    try {
      const res  = await fetch('/api/timeline/normalize-address', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ raw_text: addrRaw }),
      })
      const data = await res.json()
      if (data.street_address) setAddrStreet(data.street_address)
      if (data.city)           setAddrCity(data.city)
      if (data.county)         setAddrCounty(data.county)
      if (data.state_province) setAddrState(data.state_province)
      if (data.country)        setAddrCountry(data.country)
    } catch {
      // silent -- user fills manually
    } finally {
      setNormalizing(false)
    }
  }

  const handleSubmit = async () => {
    if (!eventType)    { setError('Event type is required.');       return }
    if (!evidenceType) { setError('GPS evidence type is required.'); return }

    setSaving(true)
    setError(null)

    const hasAddress = isResidence && (addrRaw.trim() || addrStreet.trim() || addrCity.trim())

    const body: Record<string, unknown> = {
      person_id:      personId     || null,
      event_type:     eventType,
      event_date:     eventDate    || null,
      event_date_end: eventDateEnd || null,
      date_qualifier: dateQualifier,
      date_display:   dateDisplay  || null,
      place_name:     placeName    || null,
      source_id:      sourceId     || null,
      evidence_type:  evidenceType,
      description:    description  || null,
      notes:          notes        || null,
    }

    if (isResidence) {
      body.residence_date_from = resFrom   || null
      body.residence_date_to   = resTo     || null
      body.residence_current   = resCurrent
    }

    if (hasAddress) {
      body.address = {
        address_role:   addrRole,
        raw_text:       addrRaw     || null,
        street_address: addrStreet  || null,
        city:           addrCity    || null,
        county:         addrCounty  || null,
        state_province: addrState   || null,
        country:        addrCountry || null,
        notes:          addrNotes   || null,
      }
    }

    try {
      const res  = await fetch('/api/timeline', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/timeline/${data.event.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]'
  const labelCls = 'block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1'
  const mutedCls = 'block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1 opacity-50'

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        <Link href="/timeline" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-3">
          &larr; Timeline
        </Link>
        <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">New Timeline Event</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          Every event must have a GPS evidence type. Residence events include full address-as-evidence capture.
        </p>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">

          {/* Person */}
          <div>
            <label className={labelCls}>Person</label>
            <select value={personId} onChange={e => setPersonId(e.target.value)} className={inputCls}>
              <option value="">-- None --</option>
              {persons.map(p => <option key={p.id} value={p.id}>{p.display_name}</option>)}
            </select>
          </div>

          {/* Event type */}
          <div>
            <label className={labelCls}>Event Type *</label>
            <select value={eventType} onChange={e => setEventType(e.target.value)} className={inputCls}>
              {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Date -- display is primary, ISO is secondary for sorting */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Date *</label>
                <input
                  type="text"
                  value={dateDisplay}
                  onChange={e => setDateDisplay(e.target.value)}
                  placeholder="01 Feb 1981"
                  className={inputCls}
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1">e.g. 01 Feb 1981 &bull; abt 1880 &bull; bet 1920 and 1925</p>
              </div>
              <div>
                <label className={labelCls}>Date Qualifier</label>
                <select value={dateQualifier} onChange={e => setDateQualifier(e.target.value)} className={inputCls}>
                  {DATE_QUALIFIERS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                </select>
              </div>
            </div>

            {/* ISO date -- small, secondary, for sorting only */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={mutedCls}>ISO date for sorting (YYYY-MM-DD)</label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  placeholder="1981-02-01"
                  className={`${inputCls} opacity-60 text-xs`}
                />
              </div>
              {dateQualifier === 'between' && (
                <div>
                  <label className={mutedCls}>End ISO date (YYYY-MM-DD)</label>
                  <input
                    type="text"
                    value={eventDateEnd}
                    onChange={e => setEventDateEnd(e.target.value)}
                    placeholder="1925-12-31"
                    className={`${inputCls} opacity-60 text-xs`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Place -- non-residence events */}
          {!isResidence && (
            <div>
              <label className={labelCls}>Place</label>
              <input
                type="text"
                value={placeName}
                onChange={e => setPlaceName(e.target.value)}
                placeholder="Chicago, Cook County, Illinois, USA"
                className={inputCls}
              />
            </div>
          )}

          {/* Address section -- residence events */}
          {isResidence && (
            <div className="border border-[var(--color-border)] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg text-[var(--color-gold)]">Address</h3>
                <span className="text-xs font-mono text-[var(--color-text-muted)]">Address-as-Evidence</span>
              </div>

              <div>
                <label className={labelCls}>Address Role</label>
                <select value={addrRole} onChange={e => setAddrRole(e.target.value)} className={inputCls}>
                  {ADDRESS_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Raw text (copy from source exactly -- never altered)</label>
                <div className="flex gap-2 items-start">
                  <textarea
                    value={addrRaw}
                    onChange={e => setAddrRaw(e.target.value)}
                    rows={2}
                    placeholder="Paste exactly as written in the source"
                    className={`${inputCls} flex-1 resize-none`}
                  />
                  <button
                    type="button"
                    onClick={handleNormalize}
                    disabled={normalizing || !addrRaw.trim()}
                    className="px-3 py-2 text-xs font-mono border border-[var(--color-border)] rounded text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors disabled:opacity-40 whitespace-nowrap"
                  >
                    {normalizing ? 'Working...' : 'AI Normalize'}
                  </button>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Paste raw text, then click AI Normalize to fill the fields below.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Street Address</label>
                  <input type="text" value={addrStreet} onChange={e => setAddrStreet(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <input type="text" value={addrCity} onChange={e => setAddrCity(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>County</label>
                  <input type="text" value={addrCounty} onChange={e => setAddrCounty(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>State / Province</label>
                  <input type="text" value={addrState} onChange={e => setAddrState(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <input type="text" value={addrCountry} onChange={e => setAddrCountry(e.target.value)} className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Address Notes</label>
                <input
                  type="text"
                  value={addrNotes}
                  onChange={e => setAddrNotes(e.target.value)}
                  placeholder="Any notes about this address record"
                  className={inputCls}
                />
              </div>

              {/* Residence duration -- free text */}
              <div className="pt-3 border-t border-[var(--color-border)]">
                <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Residence Duration</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>From</label>
                    <input
                      type="text"
                      value={resFrom}
                      onChange={e => setResFrom(e.target.value)}
                      placeholder="1920"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>To</label>
                    <input
                      type="text"
                      value={resTo}
                      onChange={e => setResTo(e.target.value)}
                      placeholder="1935"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="checkbox"
                    id="resCurrent"
                    checked={resCurrent}
                    onChange={e => setResCurrent(e.target.checked)}
                    className="accent-[var(--color-gold)]"
                  />
                  <label htmlFor="resCurrent" className="text-sm text-[var(--color-text-muted)]">
                    Current / last known address
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Source */}
          <div>
            <label className={labelCls}>Source</label>
            <select value={sourceId} onChange={e => setSourceId(e.target.value)} className={inputCls}>
              <option value="">-- No source linked --</option>
              {sources.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {/* GPS Evidence type */}
          <div>
            <label className={labelCls}>GPS Evidence Type *</label>
            <div className="flex gap-2 mb-1">
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
            <p className="text-xs text-[var(--color-text-muted)]">
              Direct: explicitly states the fact. Indirect: implies it. Negative: absence of expected evidence.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="What this event tells you and why it matters to the research"
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Internal notes, research leads, follow-up questions"
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Event'}
            </button>
            <Link
              href="/timeline"
              className="px-6 py-2.5 border border-[var(--color-border)] text-sm font-mono text-[var(--color-text-muted)] rounded hover:border-[var(--color-gold)] transition-colors"
            >
              Cancel
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function NewEventPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-[var(--color-text-muted)]">Loading...</div>}>
      <NewEventForm />
    </Suspense>
  )
}
