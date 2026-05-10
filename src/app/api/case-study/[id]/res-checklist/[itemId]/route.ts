import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface Params { params: { id: string; itemId: string } }

// PATCH /api/case-study/[id]/res-checklist/[itemId] -- update searched status and notes
export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const body = await req.json()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if ('was_searched'   in body) updates.was_searched   = body.was_searched
  if ('search_result'  in body) updates.search_result  = body.search_result
  if ('explanation'    in body) updates.explanation    = body.explanation
  if ('display_order'  in body) updates.display_order  = body.display_order

  const { data, error } = await supabase
    .from('res_checklist_items')
    .update(updates)
    .eq('id', params.itemId)
    .eq('case_study_id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data })
}

// DELETE /api/case-study/[id]/res-checklist/[itemId]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient()

  const { error } = await supabase
    .from('res_checklist_items')
    .delete()
    .eq('id', params.itemId)
    .eq('case_study_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
