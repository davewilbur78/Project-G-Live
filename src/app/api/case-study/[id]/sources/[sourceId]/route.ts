// PATCH  /api/case-study/[id]/sources/[sourceId] -- update triage, notes
// DELETE /api/case-study/[id]/sources/[sourceId] -- remove source from case study

import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string; sourceId: string }> }

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { sourceId } = await params
    const body = await request.json()

    const allowed = ['triage_status', 'name_recorded', 'notes', 'display_order']
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) {
        updates[key] = typeof body[key] === 'string' ? body[key].trim() || null : body[key]
      }
    }

    if (updates.triage_status && !['GREEN', 'YELLOW', 'RED'].includes(updates.triage_status as string)) {
      return NextResponse.json({ error: 'Invalid triage_status' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('case_study_sources')
      .update(updates)
      .eq('id', sourceId)
      .select('*, source:sources(*)')
      .single()

    if (error) throw error
    return NextResponse.json({ source: data })
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
    const { sourceId } = await params
    const supabase = createServerClient()
    const { error } = await supabase.from('case_study_sources').delete().eq('id', sourceId)
    if (error) throw error
    return NextResponse.json({ deleted: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
