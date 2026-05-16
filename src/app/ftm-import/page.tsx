'use client'

/**
 * FTM Bridge -- Import Control (Phase 3 UI)
 * Module 17 · /ftm-import
 *
 * Shows current FTM import stats from Supabase.
 * Triggers the import script via POST /api/ftm-import.
 * Streams live log output via polling /api/ftm-import/status.
 *
 * The import runs locally (ARM64 ftm-extractor + FTM 2024 file on Dave's Mac).
 * Re-import is fully idempotent -- safe to run at any time.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

interface ImportStats {
  persons:         number
  sources:         number
  families:        number
  timeline_events: number
  sourced_events:  number
  last_imported:   string | null
  running:         boolean
}

const DEFAULT_FTM_PATH = '/Users/dave/ftm playground /Mom plus 1 generation.ftm'

function sourcedPct(sourced: number, total: number): string {
  if (!total) return ''
  return `${Math.round((sourced / total) * 100)}%`
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleString('en-US', {
    month:        'short',
    day:          'numeric',
    year:         'numeric',
    hour:         'numeric',
    minute:       '2-digit',
    timeZoneName: 'short',
  })
}

export default function FtmImportPage() {
  const [stats,   setStats]   = useState<ImportStats | null>(null)
  const [log,     setLog]     = useState('')
  const [running, setRunning] = useState(false)
  const [ftmPath, setFtmPath] = useState(DEFAULT_FTM_PATH)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const logRef = useRef<HTMLPreElement>(null)

  // -------------------------------------------------------------------------
  // Stats fetch
  // -------------------------------------------------------------------------

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/ftm-import')
      if (!res.ok) throw new Error(await res.text())
      const data: ImportStats = await res.json()
      setStats(data)
      // If the server already knows an import is running (e.g. page reload mid-run),
      // start polling immediately.
      if (data.running) setRunning(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => { fetchStats() }, [fetchStats])

  // -------------------------------------------------------------------------
  // Polling -- active while running === true
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!running) return

    let cancelled = false

    const poll = setInterval(async () => {
      if (cancelled) return
      try {
        const res = await fetch('/api/ftm-import/status')
        if (!res.ok) return
        const data: { running: boolean; log: string } = await res.json()
        setLog(data.log)
        if (!data.running) {
          setRunning(false)
          clearInterval(poll)
          // Refresh stats after a short pause to let Supabase settle.
          // No cancelled guard here: React 18/19 handles state updates on
          // unmounting components gracefully. The cancelled guard was
          // incorrectly killing the stats refresh because effect cleanup
          // (which sets cancelled=true) runs before the 800ms timeout fires.
          setTimeout(() => fetchStats(), 800)
        }
      } catch { /* ignore transient polling errors */ }
    }, 2000)

    return () => {
      cancelled = true
      clearInterval(poll)
    }
  }, [running, fetchStats])

  // Auto-scroll log to bottom as new output arrives
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [log])

  // -------------------------------------------------------------------------
  // Trigger import
  // -------------------------------------------------------------------------

  async function handleRunImport() {
    if (running || !ftmPath.trim()) return
    setError(null)
    setLog('')

    try {
      const res = await fetch('/api/ftm-import', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ftm_path: ftmPath }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error((d as { error?: string }).error ?? res.statusText)
      }
      // Start polling (useEffect watches [running])
      setRunning(true)
      // Also fetch the initial log content immediately
      const statusRes = await fetch('/api/ftm-import/status')
      const statusData: { running: boolean; log: string } = await statusRes.json()
      setLog(statusData.log)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start import')
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const STAT_TILES: Array<{ label: string; value: number; sub?: string }> = stats
    ? [
        { label: 'Persons',  value: stats.persons },
        { label: 'Sources',  value: stats.sources },
        { label: 'Families', value: stats.families },
        { label: 'Events',   value: stats.timeline_events },
        {
          label: 'Sourced',
          value: stats.sourced_events,
          sub:   sourcedPct(stats.sourced_events, stats.timeline_events),
        },
      ]
    : []

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">

      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          href="/"
          className="font-mono text-xs text-[var(--ink-faint)] hover:text-[var(--gold-mid)] transition-colors"
        >
          &larr; Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="border-b-2 border-[var(--ink)] pb-6 mb-10">
        <p className="font-mono text-xs tracking-widest text-[var(--ink-faint)] uppercase mb-2">
          Module 17 &middot; FTM Bridge &middot; Phase 3
        </p>
        <h1 className="font-display text-4xl font-bold text-[var(--ink)] mb-2">
          FTM Import Control
        </h1>
        <p className="text-[var(--ink-soft)] italic">
          Direct pipeline from Family Tree Maker into Supabase. Fully idempotent.
        </p>
      </div>

      {/* Stats panel */}
      <section className="mb-10">
        <p className="font-mono text-xs tracking-widest text-[var(--ink-faint)] uppercase mb-4">
          Current Import State
        </p>

        {loading ? (
          <p className="text-sm text-[var(--ink-faint)] font-mono">Loading&hellip;</p>
        ) : error && !stats ? (
          <p className="text-sm font-mono" style={{ color: 'var(--red-ink)' }}>{error}</p>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
              {STAT_TILES.map(({ label, value, sub }) => (
                <div
                  key={label}
                  className="p-4 rounded border border-[var(--rule)] bg-[var(--parchment)] text-center"
                >
                  <div className="font-display text-2xl font-bold text-[var(--ink)]">
                    {value.toLocaleString()}
                  </div>
                  <div className="font-mono text-xs text-[var(--ink-faint)] mt-1">{label}</div>
                  {sub && (
                    <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--green-ink)' }}>
                      {sub}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="font-mono text-xs text-[var(--ink-faint)]">
              Last imported: {formatTimestamp(stats.last_imported)}
              {running && (
                <span className="ml-3 animate-pulse" style={{ color: 'var(--amber-ink)' }}>
                  &bull; Import running&hellip;
                </span>
              )}
            </p>
          </>
        ) : null}
      </section>

      {/* Run import */}
      <section className="mb-10">
        <p className="font-mono text-xs tracking-widest text-[var(--ink-faint)] uppercase mb-4">
          Run Import
        </p>

        <div
          className="p-6 rounded border border-[var(--rule)] space-y-4"
          style={{ background: 'var(--parchment)' }}
        >
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--ink-faint)' }}>
              FTM file path
            </label>
            <input
              type="text"
              value={ftmPath}
              onChange={e => setFtmPath(e.target.value)}
              disabled={running}
              className="w-full font-mono text-sm px-3 py-2 rounded border border-[var(--rule)] bg-white text-[var(--ink)] focus:outline-none focus:border-[var(--gold-mid)] disabled:opacity-50"
              placeholder="/path/to/tree.ftm"
            />
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={handleRunImport}
              disabled={running || !ftmPath.trim()}
              className="px-6 py-2 rounded font-mono text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: running ? 'var(--amber-bg)' : 'var(--ink)',
                color:      running ? 'var(--amber-ink)' : 'var(--parchment)',
              }}
            >
              {running ? 'Running\u2026' : 'Run Import'}
            </button>
            {running && (
              <span className="font-mono text-xs animate-pulse" style={{ color: 'var(--amber-ink)' }}>
                Import in progress. Do not close this tab.
              </span>
            )}
          </div>

          <p className="font-mono text-xs" style={{ color: 'var(--ink-faint)' }}>
            Requires compiled <code>scripts/ftm-extractor</code> and a valid FTM 2024 file.
            Re-import is fully idempotent &mdash; safe to run at any time.
          </p>
        </div>

        {error && (
          <p className="font-mono text-xs mt-3" style={{ color: 'var(--red-ink)' }}>
            Error: {error}
          </p>
        )}
      </section>

      {/* Import log -- only shown once log has content */}
      {log && (
        <section>
          <p className="font-mono text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--ink-faint)' }}>
            Import Log
            {running && (
              <span
                className="ml-2 normal-case animate-pulse"
                style={{ color: 'var(--amber-ink)' }}
              >
                &bull; live
              </span>
            )}
          </p>
          <pre
            ref={logRef}
            className="font-mono text-xs rounded border border-[var(--rule)] p-4 overflow-auto max-h-96 whitespace-pre-wrap"
            style={{
              background: 'var(--parchment-darker)',
              color:      'var(--ink)',
            }}
          >
            {log}
          </pre>
        </section>
      )}

    </div>
  )
}
