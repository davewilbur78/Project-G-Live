import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET /api/conflict-resolver -- list all source conflicts, open first
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('source_conflicts')
      .select(`
        *,
        person:persons(id, display_name),
        source_a:sources!source_conflicts_source_a_id_fkey(id, label, source_type, info_type, evidence_type, ee_short_citation),
        source_b:sources!source_conflicts_source_b_id_fkey(id, label, source_type, info_type, evidence_type, ee_short_citation)
      `)
      .order('status')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Sort: open and in_progress before resolved
    const STATUS_ORDER: Record<string, number> = { open: 0, in_progress: 1, resolved: 2 }
    const sorted = (data ?? []).sort(
      (a, b) => (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0)
    )

    return NextResponse.json({ conflicts: sorted })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/conflict-resolver -- create a new conflict
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      title, fact_in_dispute, description,
      person_id, source_a_id, source_a_value,
      source_b_id, source_b_value, notes,
    } = body

    if (!title?.trim())          return NextResponse.json({ error: 'title is required' }, { status: 400 })
    if (!fact_in_dispute?.trim()) return NextResponse.json({ error: 'fact_in_dispute is required' }, { status: 400 })
    if (!description?.trim())    return NextResponse.json({ error: 'description is required' }, { status: 400 })

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('source_conflicts')
      .insert({
        title:           title.trim(),
        fact_in_dispute: fact_in_dispute,
        description:     description.trim(),
        person_id:       person_id       ?? null,
        source_a_id:     source_a_id     ?? null,
        source_a_value:  source_a_value?.trim() ?? null,
        source_b_id:     source_b_id     ?? null,
        source_b_value:  source_b_value?.trim() ?? null,
        notes:           notes?.trim()   ?? null,
        status:          'open',
      })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ conflict: data }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
