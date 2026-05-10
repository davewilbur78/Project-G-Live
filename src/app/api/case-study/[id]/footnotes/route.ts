// Footnote Definitions -- upsert
// POST: create or replace a footnote by number (upsert on case_study_id + footnote_number)
// Footnote numbers must be unique within a case study.
// TIMESTAMP: 2026-05-09 17:20 UTC

import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

interface Params { params: { id: string } }

export async function POST(req: Request, { params }: Params) {
  const body = await req.json()
  const { footnote_number, citation_text, case_study_source_id } = body

  if (!footnote_number)
    return NextResponse.json({ error: 'footnote_number is required' }, { status: 400 })
  if (!citation_text?.trim())
    return NextResponse.json({ error: 'citation_text is required' }, { status: 400 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('footnote_definitions')
    .upsert(
      {
        case_study_id: params.id,
        footnote_number,
        citation_text: citation_text.trim(),
        case_study_source_id: case_study_source_id || null,
      },
      { onConflict: 'case_study_id,footnote_number' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ footnote: data }, { status: 201 })
}
