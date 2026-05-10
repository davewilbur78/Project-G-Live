import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface Props { params: { id: string } }

// GET /api/research-log/[id]/session-sources -- list sources for a session
export async function GET(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('session_sources')
      .select('*, source:sources(id, label, source_type, ee_short_citation)')
      .eq('session_id', params.id)
      .order('display_order')
    if (error) throw error
    return NextResponse.json({ session_sources: data ?? [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/research-log/[id]/session-sources -- add a source to a session
export async function POST(req: Request, { params }: Props) {
  try {
    const body = await req.json()
    const { source_id, source_label, yielded_results, result_summary, display_order } = body

    if (!source_label?.trim()) {
      return NextResponse.json({ error: 'source_label is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('session_sources')
      .insert({
        session_id:      params.id,
        source_id:       source_id ?? null,
        source_label:    source_label.trim(),
        yielded_results: yielded_results ?? false,
        result_summary:  result_summary?.trim() ?? null,
        display_order:   display_order ?? 0,
      })
      .select('*, source:sources(id, label, source_type, ee_short_citation)')
      .single()

    if (error) throw error
    return NextResponse.json({ session_source: data }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
