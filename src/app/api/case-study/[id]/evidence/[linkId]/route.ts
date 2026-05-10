// PATCH  /api/case-study/[id]/evidence/[linkId]
// DELETE /api/case-study/[id]/evidence/[linkId]

import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string; linkId: string }> }

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { linkId } = await params
    const body = await request.json()

    const allowed = ['claim', 'weight', 'sources_narrative', 'footnote_numbers', 'display_order']
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) {
        updates[key] = typeof body[key] === 'string' ? body[key].trim() || null : body[key]
      }
    }

    if (updates.weight && !['Very Strong', 'Strong', 'Moderate', 'Corroborating'].includes(updates.weight as string)) {
      return NextResponse.json({ error: 'Invalid weight' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('evidence_chain_links')
      .update(updates)
      .eq('id', linkId)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ link: data })
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
    const { linkId } = await params
    const supabase = createServerClient()
    const { error } = await supabase.from('evidence_chain_links').delete().eq('id', linkId)
    if (error) throw error
    return NextResponse.json({ deleted: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
