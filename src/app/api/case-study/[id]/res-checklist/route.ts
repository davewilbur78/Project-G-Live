import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface Params { params: { id: string } }

// GET /api/case-study/[id]/res-checklist -- all checklist items in order
export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('res_checklist_items')
    .select('*')
    .eq('case_study_id', params.id)
    .order('display_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data })
}

// POST /api/case-study/[id]/res-checklist -- add a checklist item
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const body = await req.json()

  if (!body.source_category?.trim()) {
    return NextResponse.json({ error: 'source_category is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('res_checklist_items')
    .insert({
      case_study_id:   params.id,
      source_category: body.source_category.trim(),
      was_searched:    body.was_searched ?? false,
      search_result:   body.search_result?.trim() || null,
      explanation:     body.explanation?.trim() || null,
      display_order:   body.display_order ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data }, { status: 201 })
}
