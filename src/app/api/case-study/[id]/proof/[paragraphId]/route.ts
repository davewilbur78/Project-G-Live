// PATCH  /api/case-study/[id]/proof/[paragraphId]
// DELETE /api/case-study/[id]/proof/[paragraphId]

import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string; paragraphId: string }> }

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { paragraphId } = await params
    const body = await request.json()

    const allowed = ['content', 'display_order']
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) {
        updates[key] = typeof body[key] === 'string' ? body[key].trim() || null : body[key]
      }
    }

    updates.updated_at = new Date().toISOString()

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('proof_paragraphs')
      .update(updates)
      .eq('id', paragraphId)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ paragraph: data })
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
    const { paragraphId } = await params
    const supabase = createServerClient()
    const { error } = await supabase.from('proof_paragraphs').delete().eq('id', paragraphId)
    if (error) throw error
    return NextResponse.json({ deleted: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
