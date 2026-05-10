// GET  /api/case-study -- list all case studies
// POST /api/case-study -- create a case study

import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data: case_studies, error } = await supabase
      .from('case_studies')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ case_studies })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[case-study GET]', message)
    return NextResponse.json({ error: message, case_studies: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.research_question?.trim()) {
      return NextResponse.json({ error: 'research_question is required' }, { status: 400 })
    }
    if (!body.subject_display?.trim()) {
      return NextResponse.json({ error: 'subject_display is required' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { data: case_study, error } = await supabase
      .from('case_studies')
      .insert([{
        research_question: body.research_question.trim(),
        subject_display:   body.subject_display.trim(),
        subject_vitals:    body.subject_vitals?.trim() || null,
        notes:             body.notes?.trim() || null,
        status:            'draft',
        gps_stage_reached: 1,
      }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ case_study }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[case-study POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
