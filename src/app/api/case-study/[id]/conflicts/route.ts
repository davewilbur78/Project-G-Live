import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface Params { params: { id: string } }

// GET /api/case-study/[id]/conflicts
export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('conflicts')
    .select('*')
    .eq('case_study_id', params.id)
    .order('display_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ conflicts: data })
}

// POST /api/case-study/[id]/conflicts -- add a conflict
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const body = await req.json()

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('conflicts')
    .insert({
      case_study_id: params.id,
      title:         body.title.trim(),
      source_a_id:   body.source_a_id   || null,
      source_b_id:   body.source_b_id   || null,
      name_in_a:     body.name_in_a?.trim()     || null,
      name_in_b:     body.name_in_b?.trim()     || null,
      analysis_text: body.analysis_text?.trim() || null,
      is_resolved:   body.is_resolved   ?? false,
      display_order: body.display_order ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ conflict: data }, { status: 201 })
}
