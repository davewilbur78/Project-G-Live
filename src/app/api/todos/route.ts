import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET /api/todos -- list all todos, open/in_progress first, then by priority
export async function GET(req: Request) {
  try {
    const url       = new URL(req.url)
    const status    = url.searchParams.get('status')    // filter by status
    const personId  = url.searchParams.get('person_id') // filter by person
    const priority  = url.searchParams.get('priority')  // filter by priority

    const supabase = createServerSupabaseClient()
    let query = supabase
      .from('todos')
      .select('*, person:persons(id, display_name)')
      .order('status')                             // open before complete
      .order('priority')                           // high before low (alphabetical: high, low, medium -- override below)
      .order('created_at', { ascending: false })

    if (status)   query = query.eq('status', status)
    if (personId) query = query.eq('person_id', personId)
    if (priority) query = query.eq('priority', priority)

    const { data, error } = await query
    if (error) throw error

    // Sort by priority weight client-side (high=0, medium=1, low=2)
    const PRIORITY_WEIGHT: Record<string, number> = { high: 0, medium: 1, low: 2 }
    const sorted = (data ?? []).sort((a, b) => {
      // First: open/in_progress before complete/dropped
      const statusOrder: Record<string, number> = { open: 0, in_progress: 1, complete: 2, dropped: 3 }
      const statusDiff = (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0)
      if (statusDiff !== 0) return statusDiff
      // Then: priority
      return (PRIORITY_WEIGHT[a.priority] ?? 1) - (PRIORITY_WEIGHT[b.priority] ?? 1)
    })

    return NextResponse.json({ todos: sorted })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/todos -- create a new to-do
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, notes, priority, person_id, source_type_hint, origin_module, origin_id, due_date } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const validPriorities = ['high', 'medium', 'low']
    const resolvedPriority = validPriorities.includes(priority) ? priority : 'medium'

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('todos')
      .insert({
        title:            title.trim(),
        notes:            notes?.trim()            ?? null,
        priority:         resolvedPriority,
        person_id:        person_id                ?? null,
        source_type_hint: source_type_hint?.trim() ?? null,
        origin_module:    origin_module?.trim()    ?? 'manual',
        origin_id:        origin_id                ?? null,
        due_date:         due_date                 ?? null,
        status:           'open',
      })
      .select('*, person:persons(id, display_name)')
      .single()

    if (error) throw error
    return NextResponse.json({ todo: data }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
