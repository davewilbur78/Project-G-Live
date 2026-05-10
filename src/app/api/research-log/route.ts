import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET /api/research-log -- list all sessions, newest first
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('research_sessions')
      .select('*, person:persons(id, display_name)')
      .order('session_date', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ sessions: data ?? [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/research-log -- create a new research session
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { session_date, title, goal, person_id, notes } = body

    if (!title?.trim())        return NextResponse.json({ error: 'title is required' }, { status: 400 })
    if (!goal?.trim())         return NextResponse.json({ error: 'goal is required' }, { status: 400 })
    if (!session_date?.trim()) return NextResponse.json({ error: 'session_date is required' }, { status: 400 })

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('research_sessions')
      .insert({
        session_date: session_date.trim(),
        title:        title.trim(),
        goal:         goal.trim(),
        person_id:    person_id ?? null,
        notes:        notes?.trim() ?? null,
        status:       'draft',
      })
      .select('*, person:persons(id, display_name)')
      .single()

    if (error) throw error
    return NextResponse.json({ session: data }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
