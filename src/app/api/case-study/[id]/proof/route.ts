// Proof Argument Paragraphs -- list and create
// GET: all paragraphs and all footnotes for this case study
// POST: add a new paragraph
// Content may contain [FN1] markers rendered as superscripts on the frontend.
// TIMESTAMP: 2026-05-09 17:20 UTC

import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

interface Params { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const supabase = createServerClient()
  const [paraRes, fnRes] = await Promise.all([
    supabase
      .from('proof_paragraphs')
      .select('*')
      .eq('case_study_id', params.id)
      .order('display_order'),
    supabase
      .from('footnote_definitions')
      .select('*')
      .eq('case_study_id', params.id)
      .order('footnote_number'),
  ])

  return NextResponse.json({
    paragraphs: paraRes.data ?? [],
    footnotes: fnRes.data ?? [],
  })
}

export async function POST(req: Request, { params }: Params) {
  const body = await req.json()
  const { content, display_order } = body

  if (!content?.trim())
    return NextResponse.json({ error: 'content is required' }, { status: 400 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('proof_paragraphs')
    .insert({
      case_study_id: params.id,
      content: content.trim(),
      display_order: display_order ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ paragraph: data }, { status: 201 })
}
