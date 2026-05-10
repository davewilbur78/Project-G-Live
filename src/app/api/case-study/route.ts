// Case Study Builder -- list and create
// GET: list all case studies, newest first
// POST: create a new case study
// TIMESTAMP: 2026-05-09 17:20 UTC

import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ case_studies: data ?? [] })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { research_question, subject_display, subject_vitals, person_id, notes } = body

  if (!research_question?.trim())
    return NextResponse.json({ error: 'research_question is required' }, { status: 400 })
  if (!subject_display?.trim())
    return NextResponse.json({ error: 'subject_display is required' }, { status: 400 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('case_studies')
    .insert({
      research_question: research_question.trim(),
      subject_display: subject_display.trim(),
      subject_vitals: subject_vitals?.trim() || null,
      person_id: person_id || null,
      notes: notes?.trim() || null,
      status: 'draft',
      gps_stage_reached: 1,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ case_study: data }, { status: 201 })
}
