// GET    /api/citation-builder/[id] -- fetch a single source
// PATCH  /api/citation-builder/[id] -- update a source
// DELETE /api/citation-builder/[id] -- delete a source

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
    const { data: source, error } = await supabase
      .from('sources')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ source })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Only allow updating these fields
    const allowed = [
      'label',
      'source_type',
      'info_type',
      'evidence_type',
      'ee_full_citation',
      'ee_short_citation',
      'repository',
      'collection',
      'ark_identifier',
      'nara_series',
      'ancestry_url',
    ]

    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) {
        updates[key] = typeof body[key] === 'string' ? body[key].trim() || null : body[key]
      }
    }

    // Enforce GPS vocabulary if classifications are being updated
    if (updates.source_type && !['Original','Derivative','Authored'].includes(updates.source_type as string)) {
      return NextResponse.json({ error: 'Invalid source_type' }, { status: 400 })
    }
    if (updates.info_type && !['Primary','Secondary','Undetermined','N/A'].includes(updates.info_type as string)) {
      return NextResponse.json({ error: 'Invalid info_type' }, { status: 400 })
    }
    if (updates.evidence_type && !['Direct','Indirect','Negative'].includes(updates.evidence_type as string)) {
      return NextResponse.json({ error: 'Invalid evidence_type' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const supabase = createServerClient()
    const { data: source, error } = await supabase
      .from('sources')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ source })
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
    const { id } = await params
    const supabase = createServerClient()
    const { error } = await supabase.from('sources').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ deleted: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
