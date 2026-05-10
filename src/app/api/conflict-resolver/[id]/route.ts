import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface Props { params: { id: string } }

// GET /api/conflict-resolver/[id] -- fetch conflict with joined sources and person
export async function GET(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('source_conflicts')
      .select(`
        *,
        person:persons(id, display_name),
        source_a:sources!source_conflicts_source_a_id_fkey(
          id, label, source_type, info_type, evidence_type,
          ee_full_citation, ee_short_citation, repository
        ),
        source_b:sources!source_conflicts_source_b_id_fkey(
          id, label, source_type, info_type, evidence_type,
          ee_full_citation, ee_short_citation, repository
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ conflict: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH /api/conflict-resolver/[id] -- partial update
export async function PATCH(req: Request, { params }: Props) {
  try {
    const body = await req.json()
    const {
      title, fact_in_dispute, description,
      person_id, source_a_id, source_a_value,
      source_b_id, source_b_value,
      analysis_text, resolution, resolution_basis,
      status, notes,
    } = body

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (title            !== undefined) updates.title            = title?.trim()            ?? null
    if (fact_in_dispute  !== undefined) updates.fact_in_dispute  = fact_in_dispute
    if (description      !== undefined) updates.description      = description?.trim()      ?? null
    if (person_id        !== undefined) updates.person_id        = person_id                ?? null
    if (source_a_id      !== undefined) updates.source_a_id      = source_a_id              ?? null
    if (source_a_value   !== undefined) updates.source_a_value   = source_a_value?.trim()   ?? null
    if (source_b_id      !== undefined) updates.source_b_id      = source_b_id              ?? null
    if (source_b_value   !== undefined) updates.source_b_value   = source_b_value?.trim()   ?? null
    if (analysis_text    !== undefined) updates.analysis_text    = analysis_text             ?? null
    if (resolution       !== undefined) updates.resolution       = resolution?.trim()       ?? null
    if (resolution_basis !== undefined) updates.resolution_basis = resolution_basis          ?? null
    if (status           !== undefined) updates.status           = status
    if (notes            !== undefined) updates.notes            = notes?.trim()            ?? null

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('source_conflicts')
      .update(updates)
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ conflict: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /api/conflict-resolver/[id]
export async function DELETE(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from('source_conflicts')
      .delete()
      .eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ deleted: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
