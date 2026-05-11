// Matrix cells API for Research Investigation module
// GET: returns all matrix cells for an investigation, grouped by candidate
// POST: upserts a cell (create or update by candidate_id + record_type)

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = (await params)
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('investigation_matrix_cells')
    .select('*')
    .eq('investigation_id', id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = (await params)
  const supabase = createServerSupabaseClient()
  const body = await req.json()

  // Upsert: update if candidate_id + record_type already exists, insert otherwise
  const { data, error } = await supabase
    .from('investigation_matrix_cells')
    .upsert(
      {
        investigation_id: id,
        candidate_id: body.candidate_id,
        record_type: body.record_type,
        value: body.value ?? null,
        source_id: body.source_id ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'candidate_id,record_type' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
