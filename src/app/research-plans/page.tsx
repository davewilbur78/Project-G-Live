'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface PlanItem { id: string; status: string; priority: string }
interface Person   { id: string; display_name: string }
interface Plan {
  id: string
  title: string
  research_question: string
  status: string
  strategy_summary?: string | null
  person?: Person | null
  items?: PlanItem[]
  created_at: string
}

const PLAN_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  active:   { bg: 'var(--amber-bg)',        color: 'var(--amber-ink)',  label: 'Active'   },
  draft:    { bg: 'var(--parchment-darker)', color: 'var(--ink-faint)', label: 'Draft'    },
  complete: { bg: 'var(--green-bg)',         color: 'var(--green-ink)', label: 'Complete' },
}

export default function ResearchPlansPage() {
  const [plans, setPlans]   = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/research-plans')
      .then(r => r.json())
      .then(d => { setPlans(d.plans ?? []); setLoading(false) })
      .catch(() => { setError('Failed to load plans'); setLoading(false) })
  }, [])

  const itemStats = (items: PlanItem[] = []) => ({
    total:    items.length,
    done:     items.filter(i => i.status === 'complete' || i.status === 'negative').length,
    high:     items.filter(i => i.priority === 'High'   && i.status === 'pending').length,
  })

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back link */}
      <div className="mb-2">
        <Link href="/" className="font-mono text-xs tracking-widest text-[var(--ink-faint)] hover:text-[var(--gold-mid)] uppercase transition-colors">
          &larr; Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="border-b-2 border-[var(--ink)] pb-6 mb-10">
        <p className="font-mono text-xs tracking-widest text-[var(--ink-faint)] uppercase mb-2">Module 02</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold text-[var(--ink)] mb-2">Research Plans</h1>
            <p className="text-[var(--ink-soft)] italic">
              GPS-compliant research planning with AI-generated source strategies
            </p>
          </div>
          <Link
            href="/research-plans/new"
            className="flex-shrink-0 px-4 py-2 text-sm font-semibold rounded border-2 border-[var(--gold-mid)] text-[var(--gold-mid)] hover:bg-[var(--gold-light)] transition-colors"
          >
            + New Plan
          </Link>
        </div>
      </div>

      {loading && <p className="text-[var(--ink-soft)] italic">Loading...</p>}
      {error   && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && !error && plans.length === 0 && (
        <div className="text-center py-16">
          <p className="font-display text-xl text-[var(--ink-soft)] mb-3">No research plans yet</p>
          <p className="text-sm text-[var(--ink-faint)] mb-6 max-w-md mx-auto">
            A research plan defines your scope and ensures reasonably exhaustive search --
            GPS element 1. Create one to get started.
          </p>
          <Link
            href="/research-plans/new"
            className="inline-block px-6 py-3 text-sm font-semibold rounded bg-[var(--ink)] text-[var(--parchment)] hover:opacity-80 transition-opacity"
          >
            Create First Plan
          </Link>
        </div>
      )}

      {!loading && plans.length > 0 && (
        <div className="space-y-3">
          {plans.map(plan => {
            const { total, done, high } = itemStats(plan.items)
            const s = PLAN_STATUS[plan.status] ?? PLAN_STATUS.draft
            return (
              <Link
                key={plan.id}
                href={`/research-plans/${plan.id}`}
                className="block p-5 rounded border border-[var(--rule)] bg-[var(--parchment)] hover:border-[var(--gold-mid)] hover:bg-[var(--gold-light)] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--ink)] text-base leading-snug">{plan.title}</p>
                    {plan.person && (
                      <p className="text-xs text-[var(--gold-mid)] font-mono mt-0.5">{plan.person.display_name}</p>
                    )}
                    <p className="text-sm text-[var(--ink-soft)] mt-1 line-clamp-2 italic">{plan.research_question}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className="font-mono text-xs px-2 py-1 rounded"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                    {total > 0 && (
                      <span className="text-xs text-[var(--ink-faint)] font-mono">
                        {done}/{total} done
                        {high > 0 && <span className="text-red-600 ml-1">&middot; {high} High pending</span>}
                      </span>
                    )}
                    {!plan.strategy_summary && (
                      <span className="text-xs text-[var(--ink-faint)] italic">No strategy yet</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
