import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface Params { params: { id: string } }

const VALID_TRIAGE = ['GREEN', 'YELLOW', 'RED']

// GET /api/case-study/[id]/sources -- list sources for this case study (with source data joined)
export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('case_study_sources')
    .select('*, source:sources(*)')
    .eq('case_study_id', params.id)
    .order('display_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ sources: data })
}

// POST /api/case-study/[id]/sources -- add a source to this case study
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const body = await req.json()

  if (!body.source_id) {
    return NextResponse.json({ error: 'source_id is required' }, { status: 400 })
  }
  if (!VALID_TRIAGE.includes(body.triage_status)) {
    return NextResponse.json(
      { error: 'triage_status must be GREEN, YELLOW, or RED' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('case_study_sources')
    .insert({
      case_study_id: params.id,
      source_id:     body.source_id,
      triage_status: body.triage_status,
      name_recorded: body.name_recorded?.trim() || null,
      notes:         body.notes?.trim() || null,
      display_order: body.display_order ?? 0,
    })
    .select('*, source:sources(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ source: data }, { status: 201 })
}
