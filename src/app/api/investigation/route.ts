import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('investigations')
    .select(`
      id, name, problem_statement, entry_point, status,
      opened_at, last_worked_at, resolved_at,
      primary_person_id,
      persons:primary_person_id (given_name, surname)
    `)
    .order('last_worked_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('investigations')
    .insert({
      name: body.name,
      problem_statement: body.problem_statement,
      entry_point: body.entry_point,
      primary_person_id: body.primary_person_id || null,
      source_conflict_id: body.source_conflict_id || null,
      status: 'in_progress',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
