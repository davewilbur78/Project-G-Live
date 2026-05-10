// Conflicts -- list and create
// GET: all conflicts for this case study, ordered
// POST: add a new conflict record
// GPS: no conflict may be bypassed. Unresolved conflicts must be disclosed.
// TIMESTAMP: 2026-05-09 17:20 UTC

import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

interface Params { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('conflicts')
    .select('*')
    .eq('case_study_id', params.id)
    .order('display_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ conflicts: data ?? [] })
}

export async function POST(req: Request, { params }: Params) {
  const body = await req.json()
  const {
    title, source_a_id, source_b_id,
    name_in_a, name_in_b, analysis_text, display_order,
  } = body

  if (!title?.trim())
    return NextResponse.json({ error: 'title is required' }, { status: 400 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('conflicts')
    .insert({
      case_study_id: params.id,
      title: title.trim(),
      source_a_id: source_a_id || null,
      source_b_id: source_b_id || null,
      name_in_a: name_in_a?.trim() || null,
      name_in_b: name_in_b?.trim() || null,
      analysis_text: analysis_text?.trim() || null,
      is_resolved: false,
      display_order: display_order ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ conflict: data }, { status: 201 })
}
