import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface Params { params: { id: string } }

// GET /api/case-study/[id]/proof -- paragraphs and footnotes together
export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient()

  const [paras, fns] = await Promise.all([
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

  if (paras.error) return NextResponse.json({ error: paras.error.message }, { status: 500 })
  if (fns.error)   return NextResponse.json({ error: fns.error.message },   { status: 500 })

  return NextResponse.json({ paragraphs: paras.data, footnotes: fns.data })
}

// POST /api/case-study/[id]/proof -- add paragraph (default) or footnote (body.type === 'footnote')
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const body = await req.json()

  // --- Footnote path ---
  if (body.type === 'footnote') {
    if (!body.footnote_number) {
      return NextResponse.json({ error: 'footnote_number is required' }, { status: 400 })
    }
    if (!body.citation_text?.trim()) {
      return NextResponse.json({ error: 'citation_text is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('footnote_definitions')
      .insert({
        case_study_id:        params.id,
        footnote_number:      Number(body.footnote_number),
        citation_text:        body.citation_text.trim(),
        case_study_source_id: body.case_study_source_id || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ footnote: data }, { status: 201 })
  }

  // --- Paragraph path ---
  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('proof_paragraphs')
    .select('display_order')
    .eq('case_study_id', params.id)
    .order('display_order', { ascending: false })
    .limit(1)

  const nextOrder = (existing && existing.length > 0)
    ? existing[0].display_order + 1
    : 1

  const { data, error } = await supabase
    .from('proof_paragraphs')
    .insert({
      case_study_id: params.id,
      display_order: body.display_order ?? nextOrder,
      content:       body.content.trim(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ paragraph: data }, { status: 201 })
}
