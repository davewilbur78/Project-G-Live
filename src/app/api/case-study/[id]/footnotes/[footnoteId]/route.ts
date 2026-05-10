// Footnote Definitions -- update and delete
// PATCH: update citation text, number, or linked source
// DELETE: remove footnote definition
// TIMESTAMP: 2026-05-09 17:20 UTC

import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

interface Params { params: { id: string; footnoteId: string } }

export async function PATCH(req: Request, { params }: Params) {
  const body = await req.json()
  const supabase = createServerClient()

  const update: Record<string, unknown> = {}
  if ('citation_text' in body) update.citation_text = body.citation_text
  if ('footnote_number' in body) update.footnote_number = body.footnote_number
  if ('case_study_source_id' in body) update.case_study_source_id = body.case_study_source_id

  const { data, error } = await supabase
    .from('footnote_definitions')
    .update(update)
    .eq('id', params.footnoteId)
    .eq('case_study_id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ footnote: data })
}

export async function DELETE(_req: Request, { params }: Params) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('footnote_definitions')
    .delete()
    .eq('id', params.footnoteId)
    .eq('case_study_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
