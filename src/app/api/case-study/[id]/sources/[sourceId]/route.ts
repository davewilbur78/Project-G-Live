// Case Study Sources -- update and remove individual source
// PATCH: update triage status, name recorded, or notes for a case-study-specific source record
// DELETE: detach source from this case study (does not delete the global source record)
// TIMESTAMP: 2026-05-09 17:20 UTC

import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

interface Params { params: { id: string; sourceId: string } }

export async function PATCH(req: Request, { params }: Params) {
  const body = await req.json()
  const supabase = createServerClient()

  const allowed = ['triage_status', 'name_recorded', 'notes', 'display_order']
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  if (
    update.triage_status !== undefined &&
    !['GREEN', 'YELLOW', 'RED'].includes(update.triage_status as string)
  ) {
    return NextResponse.json({ error: 'Invalid triage_status' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('case_study_sources')
    .update(update)
    .eq('id', params.sourceId)
    .eq('case_study_id', params.id)
    .select('*, source:sources(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ source: data })
}

export async function DELETE(_req: Request, { params }: Params) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('case_study_sources')
    .delete()
    .eq('id', params.sourceId)
    .eq('case_study_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
