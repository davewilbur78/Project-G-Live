// Conflicts -- update and delete
// PATCH: update conflict details, analysis, or resolution status
// DELETE: remove conflict record
// TIMESTAMP: 2026-05-09 17:20 UTC

import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

interface Params { params: { id: string; conflictId: string } }

export async function PATCH(req: Request, { params }: Params) {
  const body = await req.json()
  const supabase = createServerClient()

  const allowed = [
    'title', 'source_a_id', 'source_b_id',
    'name_in_a', 'name_in_b', 'analysis_text',
    'is_resolved', 'display_order',
  ]
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const { data, error } = await supabase
    .from('conflicts')
    .update(update)
    .eq('id', params.conflictId)
    .eq('case_study_id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ conflict: data })
}

export async function DELETE(_req: Request, { params }: Params) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('conflicts')
    .delete()
    .eq('id', params.conflictId)
    .eq('case_study_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
