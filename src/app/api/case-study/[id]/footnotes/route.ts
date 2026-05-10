// GET  /api/case-study/[id]/footnotes
// POST /api/case-study/[id]/footnotes

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
      .from('footnote_definitions')
      .select('*')
      .eq('case_study_id', id)
      .order('footnote_number')

    if (error) throw error
    return NextResponse.json({ footnotes: data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message, footnotes: [] }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.citation_text?.trim()) {
      return NextResponse.json({ error: 'citation_text is required' }, { status: 400 })
    }
    if (!body.footnote_number || typeof body.footnote_number !== 'number') {
      return NextResponse.json({ error: 'footnote_number (integer) is required' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('footnote_definitions')
      .insert([{
        case_study_id:        id,
        footnote_number:      body.footnote_number,
        citation_text:        body.citation_text.trim(),
        case_study_source_id: body.case_study_source_id || null,
      }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ footnote: data }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
