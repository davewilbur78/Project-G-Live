import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = (await params)
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('investigation_candidates')
    .select(`
      *,
      matrix_cells:investigation_matrix_cells(*)
    `)
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

  const { data, error } = await supabase
    .from('investigation_candidates')
    .insert({
      investigation_id: id,
      candidate_name: body.candidate_name,
      notes: body.notes || null,
      status: 'unresolved',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
