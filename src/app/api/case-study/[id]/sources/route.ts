// Case Study Sources -- list and add
// GET: all sources attached to this case study (joined with global source record)
// POST: attach a source from the global library to this case study with triage status
// TIMESTAMP: 2026-05-09 17:20 UTC

import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

interface Params { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('case_study_sources')
    .select('*, source:sources(*)')
    .eq('case_study_id', params.id)
    .order('display_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ sources: data ?? [] })
}

export async function POST(req: Request, { params }: Params) {
  const body = await req.json()
  const { source_id, triage_status, name_recorded, notes, display_order } = body

  if (!source_id)
    return NextResponse.json({ error: 'source_id is required' }, { status: 400 })
  if (!triage_status || !['GREEN', 'YELLOW', 'RED'].includes(triage_status))
    return NextResponse.json(
      { error: 'triage_status must be GREEN, YELLOW, or RED' },
      { status: 400 }
    )

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('case_study_sources')
    .insert({
      case_study_id: params.id,
      source_id,
      triage_status,
      name_recorded: name_recorded?.trim() || null,
      notes: notes?.trim() || null,
      display_order: display_order ?? 0,
    })
    .select('*, source:sources(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ source: data }, { status: 201 })
}
