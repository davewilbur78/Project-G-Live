// GET  /api/case-study/[id]/conflicts
// POST /api/case-study/[id]/conflicts

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
      .from('conflicts')
      .select('*')
      .eq('case_study_id', id)
      .order('display_order')

    if (error) throw error
    return NextResponse.json({ conflicts: data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message, conflicts: [] }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { data: existing } = await supabase
      .from('conflicts')
      .select('display_order')
      .eq('case_study_id', id)
      .order('display_order', { ascending: false })
      .limit(1)

    const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0

    const { data, error } = await supabase
      .from('conflicts')
      .insert([{
        case_study_id: id,
        title:         body.title.trim(),
        source_a_id:   body.source_a_id || null,
        source_b_id:   body.source_b_id || null,
        name_in_a:     body.name_in_a?.trim() || null,
        name_in_b:     body.name_in_b?.trim() || null,
        analysis_text: body.analysis_text?.trim() || null,
        is_resolved:   body.is_resolved ?? false,
        display_order: nextOrder,
      }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ conflict: data }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
