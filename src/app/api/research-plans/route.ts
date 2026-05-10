import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET /api/research-plans -- list all plans with person and item counts, newest first
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('research_plans')
      .select('*, person:persons(id, display_name), items:research_plan_items(id, status, priority)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ plans: data ?? [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/research-plans -- create a new research plan
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, research_question, person_id, time_period, geography, community, notes } = body

    if (!title?.trim())             return NextResponse.json({ error: 'title is required' }, { status: 400 })
    if (!research_question?.trim()) return NextResponse.json({ error: 'research_question is required' }, { status: 400 })

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('research_plans')
      .insert({
        title:             title.trim(),
        research_question: research_question.trim(),
        person_id:         person_id ?? null,
        time_period:       time_period?.trim()  ?? null,
        geography:         geography?.trim()    ?? null,
        community:         community?.trim()    ?? null,
        notes:             notes?.trim()        ?? null,
        status:            'active',
      })
      .select('*, person:persons(id, display_name)')
      .single()

    if (error) throw error
    return NextResponse.json({ plan: data }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
