import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// PATCH /api/research-plans/[id]/items/[itemId]
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const body = await req.json()
    const { source_category, repository, strategy_note, priority, status } = body

    const updates: Record<string, unknown> = {}
    if (source_category !== undefined) updates.source_category = source_category?.trim() ?? null
    if (repository      !== undefined) updates.repository      = repository?.trim()      ?? null
    if (strategy_note   !== undefined) updates.strategy_note   = strategy_note?.trim()  ?? null
    if (priority        !== undefined) updates.priority        = priority
    if (status          !== undefined) updates.status          = status

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('research_plan_items')
      .update(updates)
      .eq('id', params.itemId)
      .eq('plan_id', params.id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ item: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /api/research-plans/[id]/items/[itemId]
export async function DELETE(
  _: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from('research_plan_items')
      .delete()
      .eq('id', params.itemId)
      .eq('plan_id', params.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
