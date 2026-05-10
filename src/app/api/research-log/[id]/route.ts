import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface Props { params: { id: string } }

// GET /api/research-log/[id] -- fetch one session with person and sources
export async function GET(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('research_sessions')
      .select(`
        *,
        person:persons(id, display_name),
        session_sources(
          *,
          source:sources(id, label, source_type, ee_short_citation)
        )
      `)
      .eq('id', params.id)
      .single()
    if (error) throw error
    if (!data)  return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ session: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH /api/research-log/[id] -- update session fields
export async function PATCH(req: Request, { params }: Props) {
  try {
    const body    = await req.json()
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('research_sessions')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select('*, person:persons(id, display_name)')
      .single()
    if (error) throw error
    return NextResponse.json({ session: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /api/research-log/[id] -- delete session (cascades to session_sources)
export async function DELETE(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from('research_sessions')
      .delete()
      .eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ deleted: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
