// GET    /api/case-study/[id] -- full case study with all related data
// PATCH  /api/case-study/[id] -- update case study fields
// DELETE /api/case-study/[id] -- delete case study

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

    const [csRes, sourcesRes, evidenceRes, conflictsRes, proofRes, footnotesRes] =
      await Promise.all([
        supabase.from('case_studies').select('*').eq('id', id).single(),
        supabase.from('case_study_sources').select('*, source:sources(*)').eq('case_study_id', id).order('display_order'),
        supabase.from('evidence_chain_links').select('*').eq('case_study_id', id).order('display_order'),
        supabase.from('conflicts').select('*').eq('case_study_id', id).order('display_order'),
        supabase.from('proof_paragraphs').select('*').eq('case_study_id', id).order('display_order'),
        supabase.from('footnote_definitions').select('*').eq('case_study_id', id).order('footnote_number'),
      ])

    if (csRes.error) throw csRes.error

    return NextResponse.json({
      case_study: csRes.data,
      sources:    sourcesRes.data  ?? [],
      evidence:   evidenceRes.data ?? [],
      conflicts:  conflictsRes.data ?? [],
      proof:      proofRes.data    ?? [],
      footnotes:  footnotesRes.data ?? [],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[case-study/[id] GET]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const body = await request.json()

    const allowed = [
      'research_question',
      'subject_display',
      'subject_vitals',
      'notes',
      'status',
      'gps_stage_reached',
      'res_checklist',
    ]

    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) {
        updates[key] = typeof body[key] === 'string'
          ? body[key].trim() || null
          : body[key]
      }
    }

    if (updates.status && !['draft', 'in_progress', 'complete'].includes(updates.status as string)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const supabase = createServerClient()
    const { data: case_study, error } = await supabase
      .from('case_studies')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ case_study })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[case-study/[id] PATCH]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const supabase = createServerClient()
    const { error } = await supabase.from('case_studies').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ deleted: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[case-study/[id] DELETE]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
