// GET  /api/case-study/[id]/sources -- list case_study_sources (joined with sources)
// POST /api/case-study/[id]/sources -- add a source to this case study

import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('case_study_sources')
      .select('*, source:sources(*)')
      .eq('case_study_id', id)
      .order('display_order')

    if (error) throw error
    return NextResponse.json({ sources: data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message, sources: [] }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.source_id) {
      return NextResponse.json({ error: 'source_id is required' }, { status: 400 })
    }
    if (!['GREEN', 'YELLOW', 'RED'].includes(body.triage_status)) {
      return NextResponse.json(
        { error: 'triage_status must be GREEN, YELLOW, or RED' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get current max display_order
    const { data: existing } = await supabase
      .from('case_study_sources')
      .select('display_order')
      .eq('case_study_id', id)
      .order('display_order', { ascending: false })
      .limit(1)

    const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0

    const { data, error } = await supabase
      .from('case_study_sources')
      .insert([{
        case_study_id: id,
        source_id:     body.source_id,
        triage_status: body.triage_status,
        name_recorded: body.name_recorded?.trim() || null,
        notes:         body.notes?.trim() || null,
        display_order: nextOrder,
      }])
      .select('*, source:sources(*)')
      .single()

    if (error) throw error
    return NextResponse.json({ source: data }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
