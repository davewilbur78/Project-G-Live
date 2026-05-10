import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface Params { params: { id: string; sourceId: string } }

const VALID_TRIAGE = ['GREEN', 'YELLOW', 'RED']

// PATCH /api/case-study/[id]/sources/[sourceId] -- update triage, notes, order
export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const body = await req.json()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if ('triage_status' in body) {
    if (!VALID_TRIAGE.includes(body.triage_status)) {
      return NextResponse.json({ error: 'Invalid triage_status' }, { status: 400 })
    }
    updates.triage_status = body.triage_status
  }
  if ('name_recorded' in body) updates.name_recorded = body.name_recorded
  if ('notes' in body)         updates.notes = body.notes
  if ('display_order' in body) updates.display_order = body.display_order

  const { data, error } = await supabase
    .from('case_study_sources')
    .update(updates)
    .eq('id', params.sourceId)
    .eq('case_study_id', params.id)
    .select('*, source:sources(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ source: data })
}

// DELETE /api/case-study/[id]/sources/[sourceId] -- remove source from case study
export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient()

  const { error } = await supabase
    .from('case_study_sources')
    .delete()
    .eq('id', params.sourceId)
    .eq('case_study_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
