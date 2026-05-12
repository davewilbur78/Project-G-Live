import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { data, error } = await supabase
    .from('dna_matches')
    .select(`
      id, match_name, platform, shared_cm, shared_segments,
      largest_segment_cm, kit_number, match_email, person_id,
      status, hypothesized_relationship, ancestral_line,
      documentary_evidence, endogamy_context, in_common_with,
      notes, created_at, updated_at,
      persons ( id, given_name, surname )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    console.error('GET /api/dna-matches/[id] error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body: Record<string, unknown>
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  const allowedFields = [
    'match_name', 'platform', 'shared_cm', 'shared_segments', 'largest_segment_cm',
    'kit_number', 'match_email', 'person_id', 'status',
    'hypothesized_relationship', 'ancestral_line', 'documentary_evidence',
    'endogamy_context', 'in_common_with', 'notes',
  ]
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field]
  }

  const { data, error } = await supabase
    .from('dna_matches')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    console.error('PATCH /api/dna-matches/[id] error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error } = await supabase.from('dna_matches').delete().eq('id', id)
  if (error) {
    console.error('DELETE /api/dna-matches/[id] error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ deleted: true })
}
