'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Source } from '@/types'

export default function NewDocumentPage() {
  const router  = useRouter()
  const [sources,  setSources]  = useState<Source[]>([])
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [form,     setForm]     = useState({ label: '', source_id: '', notes: '' })

  useEffect(() => {
    fetch('/api/citation-builder')
      .then(r => r.json())
      .then(d => setSources(d.sources ?? []))
      .catch(() => {/* sources optional */})
  }, [])

  function set(field: string, value: string) { setForm(f => ({ ...f, [field]: value })) }

  async function submit() {
    if (!form.label.trim()) { setError('Document label is required.'); return }
    setError(null); setSaving(true)
    try {
      const res  = await fetch('/api/document-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label:     form.label.trim(),
          source_id: form.source_id || null,
          notes:     form.notes.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to create worksheet.'); setSaving(false); return }
      router.push(`/document-analysis/${data.document.id}`)
    } catch { setError('Network error. Could not reach the server.'); setSaving(false) }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-2xl mx-auto px-6 py-10">

        <Link href="/document-analysis" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] block mb-6">
          &larr; Document Worksheets
        </Link>
        <h1 className="font-display text-3xl text-[var(--color-gold)] mb-1">New Worksheet</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-10">
          Link a source record, then transcribe and analyze the document.
        </p>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400 mb-6">{error}</div>
        )}

        <div className="space-y-6">

          {/* Label */}
          <div>
            <label className="block font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2">
              Worksheet Label <span className="text-[var(--color-gold)]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., 1907 Passenger Manifest -- Yankel Springer entry"
              value={form.label}
              onChange={e => set('label', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]"
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Identifies this worksheet in the list. Usually document name + subject.
            </p>
          </div>

          {/* Source link */}
          <div>
            <label className="block font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2">
              Linked Source (Citation Builder)
            </label>
            {sources.length === 0 ? (
              <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text-muted)]">
                No sources in your library yet.{' '}
                <Link href="/citation-builder/new" className="text-[var(--color-gold)] hover:underline">
                  Add a source first
                </Link>{' '}
                so you can link it here.
              </div>
            ) : (
              <select
                value={form.source_id}
                onChange={e => set('source_id', e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-gold)]"
              >
                <option value="">-- Select a source (optional) --</option>
                {sources.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.source_type})
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              The source record provides the GPS classification context for this document.
              Linking a source is strongly recommended -- fact extraction uses it.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2">
              Researcher Notes (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Internal notes about this document. Not part of the analysis."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] resize-none"
            />
          </div>

          <button
            onClick={submit}
            disabled={saving}
            className="w-full py-3 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Worksheet'}
          </button>

        </div>
      </div>
    </div>
  )
}
