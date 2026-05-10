'use client'

import { useState, useEffect, useCallback } from 'react'

interface ResItem {
  id: string; case_study_id: string; source_category: string
  was_searched: boolean; search_result: string | null; explanation: string | null; display_order: number
}

const DEFAULT_CATEGORIES = [
  'Census Records',
  'Vital Records (birth, marriage, death certificates)',
  'Passenger and Immigration Records',
  'Naturalization Records',
  'Passport Applications',
  'Military Records',
  'Land and Deed Records',
  'Probate Records',
  'Cemetery and Burial Records',
  'Newspaper Obituaries and Announcements',
  'City Directories',
  'Religious Records (synagogue, church, civil registration)',
  'Correspondence with Archives and Libraries',
  'Published Indexes and Derivative Sources',
  'DNA Evidence',
  'Oral History and Family Records',
]

interface Props { caseStudyId: string; onAdvance: () => void }

export function Stage4SearchChecklist({ caseStudyId, onAdvance }: Props) {
  const [items,   setItems]   = useState<ResItem[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  // Local text state to avoid API call on every keystroke
  const [localText, setLocalText] = useState<Record<string, { result: string; explanation: string }>>({})

  const load = useCallback(async () => {
    const res = await fetch(`/api/case-study/${caseStudyId}/res-checklist`)
    const d   = await res.json()
    if (!res.ok) { setError(d.error); setLoading(false); return }
    const fetched: ResItem[] = d.items ?? []
    setItems(fetched)
    // seed local text state
    const lt: Record<string, { result: string; explanation: string }> = {}
    for (const item of fetched) lt[item.id] = { result: item.search_result ?? '', explanation: item.explanation ?? '' }
    setLocalText(lt)
    setLoading(false)
  }, [caseStudyId])

  useEffect(() => { load() }, [load])

  async function seedDefaults() {
    setSeeding(true)
    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
      await fetch(`/api/case-study/${caseStudyId}/res-checklist`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_category: DEFAULT_CATEGORIES[i], was_searched: false, display_order: i }),
      })
    }
    await load(); setSeeding(false)
  }

  async function toggleSearched(item: ResItem) {
    const next = !item.was_searched
    await fetch(`/api/case-study/${caseStudyId}/res-checklist/${item.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ was_searched: next }),
    })
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, was_searched: next } : i))
  }

  async function saveText(id: string, field: 'search_result' | 'explanation', value: string) {
    await fetch(`/api/case-study/${caseStudyId}/res-checklist/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: value || null }),
    })
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value || null } : i))
  }

  const searched   = items.filter(i => i.was_searched).length
  const addressed  = items.filter(i => i.was_searched || (localText[i.id]?.explanation?.trim())).length

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-1">GPS Stage 4 of 6</p>
        <h2 className="font-display text-2xl text-[var(--color-text)] mb-2">Reasonably Exhaustive Search</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          GPS requires accounting for every relevant source type. Check each category you searched and record results.
          If you did not search a category, explain why. Every row must be addressed.
        </p>
      </div>

      {error && <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400">{error}</div>}
      {loading && <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>}

      {!loading && items.length === 0 && (
        <div className="text-center py-16 border border-dashed border-[var(--color-border)] rounded">
          <p className="text-sm text-[var(--color-text-muted)] mb-6">No checklist items yet.</p>
          <button onClick={seedDefaults} disabled={seeding} className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90 disabled:opacity-50">
            {seeding ? 'Building checklist...' : 'Load Standard Categories'}
          </button>
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[var(--color-text-muted)]">{searched} of {items.length} searched</span>
            {addressed === items.length && <span className="font-mono text-xs text-green-400">All categories addressed</span>}
          </div>

          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className={`p-4 border rounded transition-colors ${
                item.was_searched ? 'bg-green-400/5 border-green-400/20'
                : localText[item.id]?.explanation?.trim() ? 'bg-amber-400/5 border-amber-400/20'
                : 'bg-[var(--color-surface)] border-[var(--color-border)]'
              }`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={item.was_searched} onChange={() => toggleSearched(item)} className="mt-1 cursor-pointer" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] mb-2">{item.source_category}</p>
                    {item.was_searched ? (
                      <div>
                        <label className="font-mono text-xs text-[var(--color-text-muted)] block mb-1">Search Result</label>
                        <input type="text" placeholder="What did you find? (or 'Searched, not found')"
                          value={localText[item.id]?.result ?? ''}
                          onChange={e => setLocalText(p => ({ ...p, [item.id]: { ...p[item.id], result: e.target.value } }))}
                          onBlur={e => saveText(item.id, 'search_result', e.target.value)}
                          className="w-full px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]" />
                      </div>
                    ) : (
                      <div>
                        <label className="font-mono text-xs text-[var(--color-text-muted)] block mb-1">Not Searched -- Explanation Required</label>
                        <input type="text" placeholder="Why not searched? (e.g. 'Records destroyed', 'Not applicable')" 
                          value={localText[item.id]?.explanation ?? ''}
                          onChange={e => setLocalText(p => ({ ...p, [item.id]: { ...p[item.id], explanation: e.target.value } }))}
                          onBlur={e => saveText(item.id, 'explanation', e.target.value)}
                          className="w-full px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="p-4 border border-[var(--color-border)]/50 rounded bg-[var(--color-surface)]/50">
        <p className="font-mono text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2">GPS Requirement</p>
        <p className="text-sm text-[var(--color-text-muted)]">You do not have to search every conceivable source, but you must justify what you searched and why you stopped. Unlocated sources must be disclosed in the proof argument.</p>
      </div>

      {!loading && items.length > 0 && (
        <div className="flex justify-end">
          <button onClick={onAdvance} className="px-6 py-2.5 bg-[var(--color-gold)] text-[var(--color-bg)] text-sm font-semibold rounded hover:opacity-90">
            Continue to Conflict Analysis
          </button>
        </div>
      )}
    </div>
  )
}
