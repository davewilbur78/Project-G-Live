import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface Props { params: { id: string } }

// GET /api/document-analysis/[id]
export async function GET(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('documents')
      .select('*, source:sources(id, label, source_type, info_type, evidence_type, ee_full_citation, ee_short_citation)')
      .eq('id', params.id)
      .single()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ document: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH /api/document-analysis/[id] -- update transcription, notes, status
export async function PATCH(req: Request, { params }: Props) {
  try {
    const body = await req.json()
    const allowed = ['label', 'transcription', 'transcription_status', 'source_id', 'notes']
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', params.id)
      .select('*, source:sources(id, label, source_type, info_type, evidence_type, ee_full_citation, ee_short_citation)')
      .single()
    if (error) throw error
    return NextResponse.json({ document: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /api/document-analysis/[id]
export async function DELETE(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from('documents').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ deleted: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
