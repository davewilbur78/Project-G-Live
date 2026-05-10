import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET /api/document-analysis -- list all documents, newest first
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('documents')
      .select('*, source:sources(id, label, source_type, ee_short_citation)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ documents: data ?? [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/document-analysis -- create a new document worksheet
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { label, source_id, notes } = body

    if (!label?.trim()) {
      return NextResponse.json({ error: 'label is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('documents')
      .insert({
        label:                label.trim(),
        source_id:            source_id ?? null,
        transcription_status: 'pending',
        notes:                notes?.trim() ?? null,
      })
      .select('*, source:sources(id, label, source_type, ee_short_citation)')
      .single()

    if (error) throw error
    return NextResponse.json({ document: data }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
