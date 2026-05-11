import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'

const STATUS_COLORS: Record<string, string> = {
  in_progress: 'bg-blue-100 text-blue-800',
  resolved:    'bg-green-100 text-green-800',
  stalled:     'bg-yellow-100 text-yellow-800',
  handed_off:  'bg-purple-100 text-purple-800',
}

const STATUS_LABELS: Record<string, string> = {
  in_progress: 'In Progress',
  resolved:    'Resolved',
  stalled:     'Stalled',
  handed_off:  'Handed Off',
}

const ENTRY_LABELS: Record<string, string> = {
  known_problem:      'Known Problem',
  mid_research:       'Mid-Research',
  conflict_detection: 'Conflict Detection',
}

export default async function InvestigationsPage() {
  const supabase = createServerSupabaseClient()

  const { data: investigations } = await supabase
    .from('investigations')
    .select(`
      id, name, problem_statement, status, entry_point,
      opened_at, last_worked_at,
      persons:primary_person_id (name_given, name_surname)
    `)
    .order('last_worked_at', { ascending: false })

  const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-700">Dashboard</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-800">Research Investigation</span>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-stone-900">Research Investigation</h1>
            <p className="mt-1 text-stone-500 text-sm max-w-lg">
              Persistent, AI-collaborative workspaces for open-ended research problems.
              Each investigation captures the full reasoning trail -- the conversation,
              the evidence, the disambiguation matrix, the conclusions.
            </p>
          </div>
          <Link
            href="/investigation/new"
            className="shrink-0 bg-stone-800 text-white px-4 py-2 rounded text-sm hover:bg-stone-700 transition-colors"
          >
            Open Investigation
          </Link>
        </div>

        {investigations && investigations.length > 0 ? (
          <div className="space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {investigations.map((inv: any) => {
              const person = inv.persons
              return (
                <Link key={inv.id} href={`/investigation/${inv.id}`}>
                  <div className="bg-white border border-stone-200 rounded p-4 hover:border-stone-400 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h2 className="font-medium text-stone-900 text-sm">{inv.name}</h2>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[inv.status]}`}>
                            {STATUS_LABELS[inv.status]}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                            {ENTRY_LABELS[inv.entry_point]}
                          </span>
                        </div>
                        <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">
                          {inv.problem_statement}
                        </p>
                        {person && (
                          <p className="text-xs text-stone-400 mt-1">
                            Subject: {person.name_given} {person.name_surname}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-xs text-stone-400 whitespace-nowrap shrink-0">
                        <div>Opened {fmt(inv.opened_at)}</div>
                        <div>Worked {fmt(inv.last_worked_at)}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded p-12 text-center">
            <p className="text-stone-400 text-sm mb-3">
              No investigations yet.
            </p>
            <p className="text-stone-400 text-xs max-w-md mx-auto mb-5">
              Open an investigation when you hit a wall -- a disambiguation problem,
              a DNA match you can not place, a conflict too tangled for the resolver.
            </p>
            <Link
              href="/investigation/new"
              className="text-stone-600 underline text-sm hover:text-stone-800"
            >
              Open your first investigation
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
