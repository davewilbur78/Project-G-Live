'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { TimelineEvent, Person } from '@/types'

const EVENT_TYPE_LABELS: Record<string, string> = {
  birth:            'Birth',
  death:            'Death',
  marriage:         'Marriage',
  divorce:          'Divorce',
  residence:        'Residence',
  immigration:      'Immigration',
  emigration:       'Emigration',
  naturalization:   'Naturalization',
  military_service: 'Military Service',
  occupation:       'Occupation',
  land_record:      'Land Record',
  census:           'Census',
  baptism:          'Baptism',
  burial:           'Burial',
  education:        'Education',
  other:            'Other',
}

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

type FilterType = 'all' | 'residence' | 'other'

export default function TimelinePage() {
  const [persons,  setPersons]  = useState<Person[]>([])
  const [personId, setPersonId] = useState<string>('')
  const [events,   setEvents]   = useState<TimelineEvent[]>([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [filter,   setFilter]   = useState<FilterType>('all')

  useEffect(() => {
    fetch('/api/persons')
      .then(r => r.json())
      .then(d => setPersons(d.persons ?? []))
      .catch(() => {})
  }, [])

  const loadEvents = useCallback(async (pid: string) => {
    if (!pid) { setEvents([]); return }
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(`/api/timeline?person_id=${pid}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEvents(data.events ?? [])
    } catch {
      setError('Could not load timeline. Check Supabase connection or run sql/008-add-timeline-addresses.sql.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadEvents(personId) }, [personId, loadEvents])

  const visible = events.filter(e => {
    if (filter === 'residence') return e.event_type === 'residence'
    if (filter === 'other')     return e.event_type !== 'residence'
    return true
  })

  const residenceCount = events.filter(e => e.event_type === 'residence').length
  const currentPerson  = persons.find(p => p.id === personId)

  const formatAddress = (e: TimelineEvent): string | null => {
    const a = e.address
    if (!a) return e.place_name ?? null
    const parts = [a.street_address, a.city, a.state_province, a.country].filter(Boolean)
    return parts.length ? parts.join(', ') : (a.raw_text ?? e.place_name ?? null)
  }

  const formatDate = (e: TimelineEvent): string => {
    if (e.date_display) return e.date_display
    if (e.event_date)   return e.event_date
    return 'Date unknown'
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <Link href="/" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-3">
              &larr; Dashboard
            </Link>
            <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">Timeline Builder</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Chronological workspace. Every event is a discrete, GPS-classified assertion from a source.
            </p>
          </div>
          {personId && (
            <Link
              href={`/timeline/new?person_id=${personId}`}
              className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity mt-8"
            >
              + New Event
            </Link>
          )}
        </div>

        {/* Person selector */}
        <div className="mb-6">
          <label className="block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Person
          </label>
          <select
            value={personId}
            onChange={e => { setPersonId(e.target.value); setFilter('all') }}
            className="w-full max-w-sm px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
          >
            <option value="">-- Select a person --</option>
            {persons.map(p => (
              <option key={p.id} value={p.id}>{p.display_name}</option>
            ))}
          </select>
        </div>

        {/* No person selected */}
        {!personId && (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-[var(--color-text-muted)] mb-3">
              Select a person to view their timeline.
            </p>
            <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
              Every address extracted as evidence, every event sourced and GPS-classified -- all here in chronological order.
            </p>
          </div>
        )}

        {/* Loading */}
        {personId && loading && (
          <p className="text-sm text-[var(--color-text-muted)] py-8">Loading timeline...</p>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">
            {error}
          </div>
        )}

        {/* Stats + filter tabs */}
        {personId && !loading && !error && events.length > 0 && (
          <>
            <div className="flex gap-6 mb-4 font-mono text-xs text-[var(--color-text-muted)]">
              <span>{events.length} event{events.length !== 1 ? 's' : ''}</span>
              <span>{residenceCount} residence{residenceCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex gap-1 mb-6">
              {(['all', 'residence', 'other'] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors ${
                    filter === f
                      ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold-subtle)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]'
                  }`}
                >
                  {f === 'all' ? 'All Events' : f === 'residence' ? 'Residential History' : 'Other Events'}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Empty state for selected person */}
        {personId && !loading && !error && events.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-[var(--color-text-muted)] mb-3">
              No events for {currentPerson?.display_name ?? 'this person'}.
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mb-8">
              Start adding sourced events and they will appear here in chronological order.
            </p>
            <Link
              href={`/timeline/new?person_id=${personId}`}
              className="px-6 py-3 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity"
            >
              Add First Event
            </Link>
          </div>
        )}

        {/* Filter empty state */}
        {personId && !loading && !error && events.length > 0 && visible.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)] py-8 text-center">No items in this view.</p>
        )}

        {/* Timeline list */}
        {!loading && !error && visible.length > 0 && (
          <div className="relative">
            {/* Vertical rule */}
            <div className="absolute left-[7px] top-3 bottom-3 w-px bg-[var(--color-border)]" />

            <div className="space-y-3">
              {visible.map(e => {
                const typeLabel = EVENT_TYPE_LABELS[e.event_type] ?? e.event_type
                const typeColor = EVENT_TYPE_COLOR[e.event_type] ?? EVENT_TYPE_COLOR.other
                const addr      = formatAddress(e)
                const dateStr   = formatDate(e)
                const isRes     = e.event_type === 'residence'

                return (
                  <Link key={e.id} href={`/timeline/${e.id}`} className="block pl-7 relative group">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-0 top-4 w-4 h-4 rounded-full border-2 border-[var(--color-gold)] transition-colors ${
                        isRes
                          ? 'bg-[var(--color-gold)]'
                          : 'bg-[var(--color-bg)] group-hover:bg-[var(--color-gold)]'
                      }`}
                    />

                    <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded hover:border-[var(--color-gold)] transition-colors">
                      <div className="flex items-start gap-4 flex-wrap">
                        <span className="font-mono text-xs text-[var(--color-text-muted)] w-28 flex-shrink-0 pt-0.5">
                          {dateStr}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className={`text-xs px-2 py-0.5 border rounded font-mono ${typeColor}`}>
                              {typeLabel}
                            </span>
                            {e.evidence_type && (
                              <span className="text-xs px-2 py-0.5 border border-[var(--color-border)] rounded font-mono text-[var(--color-text-muted)]">
                                {e.evidence_type}
                              </span>
                            )}
                          </div>

                          {/* Residence: address is the headline */}
                          {isRes && addr && (
                            <p className="text-sm font-semibold text-[var(--color-text)] mb-1">{addr}</p>
                          )}

                          {/* Non-residence: description or place */}
                          {!isRes && e.description && (
                            <p className="text-sm text-[var(--color-text)] mb-1 line-clamp-2">{e.description}</p>
                          )}
                          {!isRes && !e.description && e.place_name && (
                            <p className="text-sm text-[var(--color-text)] mb-1">{e.place_name}</p>
                          )}

                          {/* Source short citation */}
                          {e.source && (
                            <p className="text-xs font-mono text-[var(--color-text-muted)] truncate" title={e.source.ee_short_citation}>
                              {e.source.ee_short_citation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
