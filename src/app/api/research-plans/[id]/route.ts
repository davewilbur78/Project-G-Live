import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET /api/research-plans/[id] -- fetch plan with person and items
export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('research_plans')
      .select('*, person:persons(id, display_name)')
      .eq('id', params.id)
      .single()
    if (error) throw error

    // Fetch items separately for reliable ordering
    const { data: items, error: itemsError } = await supabase
      .from('research_plan_items')
      .select('*')
      .eq('plan_id', params.id)
      .order('display_order', { ascending: true })
    if (itemsError) throw itemsError

    return NextResponse.json({ plan: { ...data, items: items ?? [] } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH /api/research-plans/[id] -- partial update
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { title, research_question, status, time_period, geography, community, notes, strategy_summary } = body

    const updates: Record<string, unknown> = {}
    if (title             !== undefined) updates.title             = title?.trim()             ?? null
    if (research_question !== undefined) updates.research_question = research_question?.trim() ?? null
    if (status            !== undefined) updates.status            = status
    if (time_period       !== undefined) updates.time_period       = time_period?.trim()       ?? null
    if (geography         !== undefined) updates.geography         = geography?.trim()         ?? null
    if (community         !== undefined) updates.community         = community?.trim()         ?? null
    if (notes             !== undefined) updates.notes             = notes?.trim()             ?? null
    if (strategy_summary  !== undefined) updates.strategy_summary  = strategy_summary          ?? null

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('research_plans')
      .update(updates)
      .eq('id', params.id)
      .select('*, person:persons(id, display_name)')
      .single()
    if (error) throw error
    return NextResponse.json({ plan: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /api/research-plans/[id]
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from('research_plans')
      .delete()
      .eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
