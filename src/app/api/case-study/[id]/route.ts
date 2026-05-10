import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface Params { params: { id: string } }

// GET /api/case-study/[id] -- single case study record
export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ case_study: data })
}

// PATCH /api/case-study/[id] -- update case study fields
export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const body = await req.json()

  const ALLOWED = [
    'research_question', 'subject_display', 'subject_vitals',
    'status', 'gps_stage_reached', 'notes',
  ]
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of ALLOWED) {
    if (key in body) updates[key] = body[key]
  }

  const { data, error } = await supabase
    .from('case_studies')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ case_study: data })
}

// DELETE /api/case-study/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient()

  const { error } = await supabase
    .from('case_studies')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
