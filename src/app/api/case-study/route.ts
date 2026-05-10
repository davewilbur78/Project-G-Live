import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/case-study -- list all case studies, newest first
export async function GET() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ case_studies: data })
}

// POST /api/case-study -- create new case study
export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()

  const { research_question, subject_display, subject_vitals, person_id, notes } = body

  if (!research_question?.trim()) {
    return NextResponse.json({ error: 'research_question is required' }, { status: 400 })
  }
  if (!subject_display?.trim()) {
    return NextResponse.json({ error: 'subject_display is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('case_studies')
    .insert({
      research_question: research_question.trim(),
      subject_display:   subject_display.trim(),
      subject_vitals:    subject_vitals?.trim() || null,
      person_id:         person_id || null,
      notes:             notes?.trim() || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ case_study: data }, { status: 201 })
}
