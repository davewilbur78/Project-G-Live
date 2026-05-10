// Case Study Builder -- single case study
// GET: full detail with all related data (sources, evidence, conflicts, proof, footnotes)
// PATCH: update case study metadata
// DELETE: remove case study and cascade-delete all related records
// TIMESTAMP: 2026-05-09 17:20 UTC

import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

interface Params { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const supabase = createServerClient()
  const id = params.id

  const [studyRes, sourcesRes, evidenceRes, conflictsRes, proofRes, footnotesRes] =
    await Promise.all([
      supabase.from('case_studies').select('*').eq('id', id).single(),
      supabase.from('case_study_sources')
        .select('*, source:sources(*)')
        .eq('case_study_id', id)
        .order('display_order'),
      supabase.from('evidence_chain_links')
        .select('*')
        .eq('case_study_id', id)
        .order('display_order'),
      supabase.from('conflicts')
        .select('*')
        .eq('case_study_id', id)
        .order('display_order'),
      supabase.from('proof_paragraphs')
        .select('*')
        .eq('case_study_id', id)
        .order('display_order'),
      supabase.from('footnote_definitions')
        .select('*')
        .eq('case_study_id', id)
        .order('footnote_number'),
    ])

  if (studyRes.error)
    return NextResponse.json({ error: studyRes.error.message }, { status: 404 })

  return NextResponse.json({
    case_study: studyRes.data,
    sources: sourcesRes.data ?? [],
    evidence: evidenceRes.data ?? [],
    conflicts: conflictsRes.data ?? [],
    proof_paragraphs: proofRes.data ?? [],
    footnotes: footnotesRes.data ?? [],
  })
}

export async function PATCH(req: Request, { params }: Params) {
  const body = await req.json()
  const supabase = createServerClient()

  const allowed = [
    'research_question', 'subject_display', 'subject_vitals',
    'status', 'gps_stage_reached', 'notes', 'search_checklist',
  ]
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const { data, error } = await supabase
    .from('case_studies')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ case_study: data })
}

export async function DELETE(_req: Request, { params }: Params) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('case_studies')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
