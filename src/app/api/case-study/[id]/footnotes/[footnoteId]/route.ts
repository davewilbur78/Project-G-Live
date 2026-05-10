// PATCH  /api/case-study/[id]/footnotes/[footnoteId]
// DELETE /api/case-study/[id]/footnotes/[footnoteId]

import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string; footnoteId: string }> }

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { footnoteId } = await params
    const body = await request.json()

    const allowed = ['footnote_number', 'citation_text', 'case_study_source_id']
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) {
        updates[key] = typeof body[key] === 'string' ? body[key].trim() || null : body[key]
      }
    }

    updates.updated_at = new Date().toISOString()

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('footnote_definitions')
      .update(updates)
      .eq('id', footnoteId)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ footnote: data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { footnoteId } = await params
    const supabase = createServerClient()
    const { error } = await supabase.from('footnote_definitions').delete().eq('id', footnoteId)
    if (error) throw error
    return NextResponse.json({ deleted: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
