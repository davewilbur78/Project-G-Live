import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface Props { params: { id: string; sourceId: string } }

// PATCH /api/research-log/[id]/session-sources/[sourceId]
export async function PATCH(req: Request, { params }: Props) {
  try {
    const body     = await req.json()
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('session_sources')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', params.sourceId)
      .eq('session_id', params.id)
      .select('*, source:sources(id, label, source_type, ee_short_citation)')
      .single()
    if (error) throw error
    return NextResponse.json({ session_source: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /api/research-log/[id]/session-sources/[sourceId]
export async function DELETE(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from('session_sources')
      .delete()
      .eq('id', params.sourceId)
      .eq('session_id', params.id)
    if (error) throw error
    return NextResponse.json({ deleted: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
