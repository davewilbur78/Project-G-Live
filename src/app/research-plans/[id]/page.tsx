'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { ResearchPlan, ResearchPlanItem, ResearchPlanItemStatus, ResearchPlanItemPriority } from '@/types'

// ============================================================
// Constants
// ============================================================

const PRIORITY_STYLE: Record<ResearchPlanItemPriority, { bg: string; color: string }> = {
  High:   { bg: '#fef2f2', color: '#991b1b' },
  Medium: { bg: 'var(--amber-bg)', color: 'var(--amber-ink)' },
  Low:    { bg: 'var(--parchment-darker)', color: 'var(--ink-faint)' },
}

const STATUS_META: Record<ResearchPlanItemStatus, { label: string; next: ResearchPlanItemStatus; bg: string; color: string }> = {
  pending:     { label: 'Pending',          next: 'in_progress', bg: 'var(--parchment-darker)', color: 'var(--ink-faint)' },
  in_progress: { label: 'In Progress',     next: 'complete',    bg: 'var(--amber-bg)',         color: 'var(--amber-ink)' },
  complete:    { label: 'Complete',         next: 'negative',    bg: 'var(--green-bg)',          color: 'var(--green-ink)' },
  negative:    { label: 'Searched (Neg.)', next: 'pending',     bg: '#fff7ed',                  color: '#9a3412'         },
}

const PLAN_STATUS_OPTIONS = ['draft', 'active', 'complete'] as const

const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 }

// ============================================================
// Component
// ============================================================

export default function ResearchPlanDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()

  const [plan, setPlan]           = useState<ResearchPlan | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError]   = useState<string | null>(null)
  const [deleting, setDeleting]   = useState(false)

  // Inline plan edit state
  const [editingPlan, setEditingPlan]     = useState(false)
  const [planDraft, setPlanDraft]         = useState({ title: '', research_question: '', time_period: '', geography: '', community: '', notes: '' })
  const [savingPlan, setSavingPlan]       = useState(false)

  // Add item form
  const [showAddItem, setShowAddItem]     = useState(false)
  const [addForm, setAddForm]             = useState({ source_category: '', repository: '', strategy_note: '', priority: 'Medium' as ResearchPlanItemPriority })
  const [addingItem, setAddingItem]       = useState(false)
  const [addError, setAddError]           = useState<string | null>(null)

  // Inline item edit
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [itemDraft, setItemDraft]         = useState({ source_category: '', repository: '', strategy_note: '', priority: 'Medium' as ResearchPlanItemPriority })
  const [savingItem, setSavingItem]       = useState(false)

  const loadPlan = useCallback(async () => {
    try {
      const res  = await fetch(`/api/research-plans/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load plan')
      setPlan(data.plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadPlan() }, [loadPlan])

  // ---- Plan-level status change (select dropdown) ----
  const handleStatusChange = async (status: string) => {
    if (!plan) return
    try {
      const res  = await fetch(`/api/research-plans/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPlan(p => p ? { ...p, status: data.plan.status } : p)
    } catch { /* non-fatal -- reload */ }
  }

  // ---- Plan inline edit ----
  const startEditPlan = () => {
    if (!plan) return
    setPlanDraft({ title: plan.title, research_question: plan.research_question, time_period: plan.time_period ?? '', geography: plan.geography ?? '', community: plan.community ?? '', notes: plan.notes ?? '' })
    setEditingPlan(true)
  }
  const savePlan = async () => {
    setSavingPlan(true)
    try {
      const res  = await fetch(`/api/research-plans/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(planDraft) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPlan(p => p ? { ...p, ...data.plan } : p)
      setEditingPlan(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSavingPlan(false)
    }
  }

  // ---- Generate strategy ----
  const handleGenerate = async () => {
    if (!plan) return
    const hasItems = (plan.items?.length ?? 0) > 0
    if (hasItems) {
      if (!confirm('Regenerating will replace all existing plan items. Continue?')) return
    }
    setGenerating(true)
    setGenError(null)
    try {
      const res  = await fetch(`/api/research-plans/${id}/generate`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      setPlan(data.plan)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  // ---- Item status cycle ----
  const cycleItemStatus = async (item: ResearchPlanItem) => {
    const nextStatus = STATUS_META[item.status].next
    try {
      const res  = await fetch(`/api/research-plans/${id}/items/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPlan(p => p ? { ...p, items: p.items?.map(i => i.id === item.id ? data.item : i) } : p)
    } catch { /* non-fatal */ }
  }

  // ---- Item inline edit ----
  const startEditItem = (item: ResearchPlanItem) => {
    setItemDraft({ source_category: item.source_category, repository: item.repository ?? '', strategy_note: item.strategy_note ?? '', priority: item.priority })
    setEditingItemId(item.id)
  }
  const saveItem = async (itemId: string) => {
    setSavingItem(true)
    try {
      const res  = await fetch(`/api/research-plans/${id}/items/${itemId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(itemDraft) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPlan(p => p ? { ...p, items: p.items?.map(i => i.id === itemId ? data.item : i) } : p)
      setEditingItemId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSavingItem(false)
    }
  }
  const deleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return
    try {
      await fetch(`/api/research-plans/${id}/items/${itemId}`, { method: 'DELETE' })
      setPlan(p => p ? { ...p, items: p.items?.filter(i => i.id !== itemId) } : p)
    } catch { /* non-fatal */ }
  }

  // ---- Add item ----
  const handleAddItem = async () => {
    setAddError(null)
    if (!addForm.source_category.trim()) { setAddError('Source category is required'); return }
    setAddingItem(true)
    try {
      const res  = await fetch(`/api/research-plans/${id}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(addForm) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPlan(p => p ? { ...p, items: [...(p.items ?? []), data.item] } : p)
      setAddForm({ source_category: '', repository: '', strategy_note: '', priority: 'Medium' })
      setShowAddItem(false)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setAddingItem(false)
    }
  }

  // ---- Delete plan ----
  const handleDeletePlan = async () => {
    if (!confirm('Delete this research plan and all its items? This cannot be undone.')) return
    setDeleting(true)
    try {
      await fetch(`/api/research-plans/${id}`, { method: 'DELETE' })
      router.push('/research-plans')
    } catch {
      setDeleting(false)
    }
  }

  // ---- Sort items: priority order then display_order ----
  const sortedItems = [...(plan?.items ?? [])].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 1
    const pb = PRIORITY_ORDER[b.priority] ?? 1
    if (pa !== pb) return pa - pb
    return a.display_order - b.display_order
  })

  const inputClass = 'w-full px-3 py-2 text-sm border border-[var(--rule)] rounded bg-white text-[var(--ink)] focus:outline-none focus:border-[var(--gold-mid)]'
  const labelClass = 'block text-xs font-mono tracking-widest text-[var(--ink-faint)] uppercase mb-1'

  // ============================================================
  // Render
  // ============================================================

  if (loading) return <div className="max-w-4xl mx-auto px-6 py-12"><p className="text-[var(--ink-soft)] italic">Loading...</p></div>
  if (error || !plan) return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/research-plans" className="font-mono text-xs tracking-widest text-[var(--ink-faint)] hover:text-[var(--gold-mid)] uppercase transition-colors">&larr; Research Plans</Link>
      <p className="mt-6 text-red-600 text-sm">{error ?? 'Plan not found'}</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-2">
        <Link href="/research-plans" className="font-mono text-xs tracking-widest text-[var(--ink-faint)] hover:text-[var(--gold-mid)] uppercase transition-colors">
          &larr; Research Plans
        </Link>
        <span className="text-[var(--ink-faint)] text-xs">/</span>
        <Link href="/" className="font-mono text-xs tracking-widest text-[var(--ink-faint)] hover:text-[var(--gold-mid)] uppercase transition-colors">
          Dashboard
        </Link>
      </div>

      {/* ---- Plan header ---- */}
      {!editingPlan ? (
        <div className="border-b-2 border-[var(--ink)] pb-6 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-mono text-xs tracking-widest text-[var(--ink-faint)] uppercase mb-1">Module 02 &middot; Research Plan</p>
              <h1 className="font-display text-3xl font-bold text-[var(--ink)] leading-tight mb-2">{plan.title}</h1>
              {plan.person && (
                <p className="text-sm text-[var(--gold-mid)] font-mono mb-2">{plan.person.display_name}</p>
              )}
              <p className="text-[var(--ink-soft)] italic text-sm">{plan.research_question}</p>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <select
                value={plan.status}
                onChange={e => handleStatusChange(e.target.value)}
                className="text-xs font-mono px-2 py-1 border border-[var(--rule)] rounded bg-[var(--parchment)] text-[var(--ink)] focus:outline-none focus:border-[var(--gold-mid)]"
              >
                {PLAN_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <button onClick={startEditPlan} className="text-xs text-[var(--ink-faint)] hover:text-[var(--gold-mid)] underline transition-colors">Edit plan</button>
            </div>
          </div>

          {/* Context row */}
          {(plan.time_period || plan.geography || plan.community) && (
            <div className="flex flex-wrap gap-3 mt-4">
              {plan.time_period && (
                <span className="text-xs font-mono text-[var(--ink-faint)] bg-[var(--parchment-darker)] px-2 py-1 rounded">
                  {plan.time_period}
                </span>
              )}
              {plan.geography && (
                <span className="text-xs font-mono text-[var(--ink-faint)] bg-[var(--parchment-darker)] px-2 py-1 rounded">
                  {plan.geography}
                </span>
              )}
              {plan.community && (
                <span className="text-xs font-mono text-[var(--ink-faint)] bg-[var(--parchment-darker)] px-2 py-1 rounded">
                  {plan.community}
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ---- Plan edit form ---- */
        <div className="border-b-2 border-[var(--ink)] pb-6 mb-8">
          <p className="font-mono text-xs tracking-widest text-[var(--ink-faint)] uppercase mb-4">Editing Plan</p>
          <div className="space-y-4">
            <div><label className={labelClass}>Title</label>
              <input type="text" value={planDraft.title} onChange={e => setPlanDraft(d => ({ ...d, title: e.target.value }))} className={inputClass} /></div>
            <div><label className={labelClass}>Research Question</label>
              <textarea rows={3} value={planDraft.research_question} onChange={e => setPlanDraft(d => ({ ...d, research_question: e.target.value }))} className={`${inputClass} resize-y`} /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className={labelClass}>Time Period</label>
                <input type="text" value={planDraft.time_period} onChange={e => setPlanDraft(d => ({ ...d, time_period: e.target.value }))} className={inputClass} /></div>
              <div><label className={labelClass}>Geography</label>
                <input type="text" value={planDraft.geography} onChange={e => setPlanDraft(d => ({ ...d, geography: e.target.value }))} className={inputClass} /></div>
              <div><label className={labelClass}>Community</label>
                <input type="text" value={planDraft.community} onChange={e => setPlanDraft(d => ({ ...d, community: e.target.value }))} className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>Notes</label>
              <textarea rows={2} value={planDraft.notes} onChange={e => setPlanDraft(d => ({ ...d, notes: e.target.value }))} className={`${inputClass} resize-y`} /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={savePlan} disabled={savingPlan} className="px-4 py-2 text-sm font-semibold rounded bg-[var(--ink)] text-[var(--parchment)] hover:opacity-80 disabled:opacity-50 transition-opacity">
              {savingPlan ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => setEditingPlan(false)} className="px-4 py-2 text-sm text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* ---- Strategy section ---- */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-bold text-[var(--ink)]">Research Strategy</h2>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 text-xs font-semibold rounded border border-[var(--gold-mid)] text-[var(--gold-mid)] hover:bg-[var(--gold-light)] disabled:opacity-50 transition-colors"
          >
            {generating ? 'Generating...' : plan.strategy_summary ? 'Regenerate Strategy' : 'Generate Strategy'}
          </button>
        </div>

        {genError && <p className="text-sm text-red-600 mb-3">{genError}</p>}

        {plan.strategy_summary ? (
          <div className="bg-[var(--parchment-darker)] border border-[var(--rule)] rounded p-4">
            <p className="text-sm text-[var(--ink)] leading-relaxed italic">{plan.strategy_summary}</p>
          </div>
        ) : (
          <div className="bg-[var(--parchment-darker)] border border-dashed border-[var(--rule)] rounded p-6 text-center">
            <p className="text-sm text-[var(--ink-faint)] italic mb-1">No strategy generated yet.</p>
            <p className="text-xs text-[var(--ink-faint)]">Click Generate Strategy to produce a prioritized source list using AI.</p>
          </div>
        )}
      </div>

      {/* ---- Items section ---- */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-[var(--ink)]">Action Items</h2>
            <p className="text-xs text-[var(--ink-faint)] mt-0.5">
              {sortedItems.length} items
              {sortedItems.filter(i => i.status === 'complete' || i.status === 'negative').length > 0 && (
                <span> &middot; {sortedItems.filter(i => i.status === 'complete' || i.status === 'negative').length} done</span>
              )}
              {sortedItems.filter(i => i.status === 'negative').length > 0 && (
                <span className="ml-1">(&ldquo;Searched (Neg.)&rdquo; = GPS-documented negative evidence)</span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowAddItem(v => !v)}
            className="px-3 py-1.5 text-xs font-semibold rounded border border-[var(--rule)] text-[var(--ink-faint)] hover:border-[var(--gold-mid)] hover:text-[var(--gold-mid)] transition-colors"
          >
            {showAddItem ? 'Cancel' : '+ Add Item'}
          </button>
        </div>

        {/* Items list */}
        {sortedItems.length === 0 && !showAddItem && (
          <p className="text-sm text-[var(--ink-faint)] italic py-4">No items yet. Generate a strategy or add items manually.</p>
        )}

        <div className="space-y-2">
          {sortedItems.map(item => {
            const ps = PRIORITY_STYLE[item.priority] ?? PRIORITY_STYLE.Medium
            const ss = STATUS_META[item.status]    ?? STATUS_META.pending
            const isEditing = editingItemId === item.id

            if (isEditing) {
              return (
                <div key={item.id} className="border-2 border-[var(--gold-mid)] rounded p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className={labelClass}>Source Category</label>
                      <input type="text" value={itemDraft.source_category} onChange={e => setItemDraft(d => ({ ...d, source_category: e.target.value }))} className={inputClass} /></div>
                    <div><label className={labelClass}>Priority</label>
                      <select value={itemDraft.priority} onChange={e => setItemDraft(d => ({ ...d, priority: e.target.value as ResearchPlanItemPriority }))} className={inputClass}>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select></div>
                  </div>
                  <div><label className={labelClass}>Repository</label>
                    <input type="text" value={itemDraft.repository} onChange={e => setItemDraft(d => ({ ...d, repository: e.target.value }))} className={inputClass} /></div>
                  <div><label className={labelClass}>Strategy Note</label>
                    <textarea rows={3} value={itemDraft.strategy_note} onChange={e => setItemDraft(d => ({ ...d, strategy_note: e.target.value }))} className={`${inputClass} resize-y`} /></div>
                  <div className="flex gap-3">
                    <button onClick={() => saveItem(item.id)} disabled={savingItem} className="px-4 py-1.5 text-xs font-semibold rounded bg-[var(--ink)] text-[var(--parchment)] hover:opacity-80 disabled:opacity-50 transition-opacity">
                      {savingItem ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingItemId(null)} className="px-3 py-1.5 text-xs text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors">Cancel</button>
                  </div>
                </div>
              )
            }

            return (
              <div key={item.id} className="border border-[var(--rule)] rounded p-4 bg-[var(--parchment)]">
                <div className="flex items-start gap-3">
                  {/* Priority badge */}
                  <span
                    className="flex-shrink-0 font-mono text-xs px-2 py-0.5 rounded mt-0.5"
                    style={{ background: ps.bg, color: ps.color }}
                  >
                    {item.priority}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--ink)]">{item.source_category}</p>
                    {item.repository && (
                      <p className="text-xs text-[var(--gold-mid)] font-mono mt-0.5">{item.repository}</p>
                    )}
                    {item.strategy_note && (
                      <p className="text-sm text-[var(--ink-soft)] mt-1 leading-snug">{item.strategy_note}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Status pill -- click to cycle */}
                    <button
                      onClick={() => cycleItemStatus(item)}
                      title={`Click to advance to: ${STATUS_META[ss.next]?.label}`}
                      className="font-mono text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ background: ss.bg, color: ss.color }}
                    >
                      {ss.label}
                    </button>
                    <button onClick={() => startEditItem(item)} className="text-xs text-[var(--ink-faint)] hover:text-[var(--gold-mid)] transition-colors px-1">Edit</button>
                    <button onClick={() => deleteItem(item.id)} className="text-xs text-[var(--ink-faint)] hover:text-red-500 transition-colors px-1">Del</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Add item form */}
        {showAddItem && (
          <div className="mt-4 border-2 border-dashed border-[var(--gold-mid)] rounded p-4 space-y-3">
            <p className="text-xs font-mono tracking-widest text-[var(--ink-faint)] uppercase">Add Item Manually</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><label className={labelClass}>Source Category <span className="text-red-500">*</span></label>
                <input type="text" value={addForm.source_category}
                  onChange={e => setAddForm(f => ({ ...f, source_category: e.target.value }))}
                  placeholder="e.g. Vital Records"
                  className={inputClass} /></div>
              <div><label className={labelClass}>Priority</label>
                <select value={addForm.priority} onChange={e => setAddForm(f => ({ ...f, priority: e.target.value as ResearchPlanItemPriority }))} className={inputClass}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select></div>
            </div>
            <div><label className={labelClass}>Repository</label>
              <input type="text" value={addForm.repository}
                onChange={e => setAddForm(f => ({ ...f, repository: e.target.value }))}
                placeholder="e.g. Ancestry.com, FamilySearch, NARA"
                className={inputClass} /></div>
            <div><label className={labelClass}>Strategy Note</label>
              <textarea rows={2} value={addForm.strategy_note}
                onChange={e => setAddForm(f => ({ ...f, strategy_note: e.target.value }))}
                placeholder="What to look for and why..."
                className={`${inputClass} resize-y`} /></div>
            {addError && <p className="text-xs text-red-600">{addError}</p>}
            <div className="flex gap-3">
              <button onClick={handleAddItem} disabled={addingItem} className="px-4 py-1.5 text-xs font-semibold rounded bg-[var(--ink)] text-[var(--parchment)] hover:opacity-80 disabled:opacity-50 transition-opacity">
                {addingItem ? 'Adding...' : 'Add Item'}
              </button>
              <button onClick={() => { setShowAddItem(false); setAddError(null) }} className="px-3 py-1.5 text-xs text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* ---- Notes ---- */}
      {plan.notes && (
        <div className="mb-8 p-4 bg-[var(--parchment-darker)] border border-[var(--rule)] rounded">
          <p className="text-xs font-mono tracking-widest text-[var(--ink-faint)] uppercase mb-2">Notes</p>
          <p className="text-sm text-[var(--ink-soft)] whitespace-pre-wrap">{plan.notes}</p>
        </div>
      )}

      {/* ---- Danger zone ---- */}
      <div className="border-t border-[var(--rule)] pt-6 mt-6">
        <button
          onClick={handleDeletePlan}
          disabled={deleting}
          className="text-xs text-[var(--ink-faint)] hover:text-red-500 transition-colors underline disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Delete this plan'}
        </button>
      </div>

    </div>
  )
}
