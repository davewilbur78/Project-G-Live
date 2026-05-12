import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { data, error } = await supabase
    .from('correspondence')
    .select(`
      id, date_sent, recipient_name, recipient_type, subject, question_asked,
      date_responded, outcome, outcome_status, follow_up_needed, notes,
      created_at, updated_at, repository_id, person_id, source_id,
      repositories ( id, name ),
      persons ( id, given_name, surname ),
      sources ( id, title )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    console.error('GET /api/correspondence/[id] error:', error)
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
    'date_sent','recipient_name','recipient_type','repository_id','person_id',
    'subject','question_asked','date_responded','outcome','outcome_status',
    'follow_up_needed','source_id','notes',
  ]
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field]
  }

  const { data, error } = await supabase
    .from('correspondence')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    console.error('PATCH /api/correspondence/[id] error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error } = await supabase.from('correspondence').delete().eq('id', id)
  if (error) {
    console.error('DELETE /api/correspondence/[id] error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ deleted: true })
}
