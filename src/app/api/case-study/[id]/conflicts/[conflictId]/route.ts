import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface Params { params: { id: string; conflictId: string } }

// PATCH /api/case-study/[id]/conflicts/[conflictId]
export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const body = await req.json()

  const FIELDS = [
    'title', 'source_a_id', 'source_b_id',
    'name_in_a', 'name_in_b', 'analysis_text',
    'is_resolved', 'display_order',
  ]
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const f of FIELDS) {
    if (f in body) updates[f] = body[f]
  }

  const { data, error } = await supabase
    .from('conflicts')
    .update(updates)
    .eq('id', params.conflictId)
    .eq('case_study_id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ conflict: data })
}

// DELETE /api/case-study/[id]/conflicts/[conflictId]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient()

  const { error } = await supabase
    .from('conflicts')
    .delete()
    .eq('id', params.conflictId)
    .eq('case_study_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
