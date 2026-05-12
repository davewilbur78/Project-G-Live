import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const recipientType = searchParams.get('recipient_type')

  let query = supabase
    .from('correspondence')
    .select(`
      id, date_sent, recipient_name, recipient_type, subject,
      question_asked, date_responded, outcome, outcome_status,
      follow_up_needed, notes, created_at, repository_id, person_id, source_id,
      repositories ( name ),
      persons ( given_name, surname )
    `)
    .order('date_sent', { ascending: false })

  if (status) query = query.eq('outcome_status', status)
  if (recipientType) query = query.eq('recipient_type', recipientType)

  const { data, error } = await query
  if (error) {
    console.error('GET /api/correspondence error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  const { date_sent, recipient_name, recipient_type, repository_id, person_id,
    subject, question_asked, date_responded, outcome, outcome_status,
    follow_up_needed, source_id, notes } = body as Record<string, string | boolean | null>

  if (!date_sent || !recipient_name || !recipient_type || !subject || !question_asked) {
    return NextResponse.json(
      { error: 'date_sent, recipient_name, recipient_type, subject, and question_asked are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('correspondence')
    .insert({
      date_sent, recipient_name, recipient_type,
      repository_id: repository_id || null,
      person_id: person_id || null,
      subject, question_asked,
      date_responded: date_responded || null,
      outcome: outcome || null,
      outcome_status: outcome_status || 'pending',
      follow_up_needed: follow_up_needed ?? false,
      source_id: source_id || null,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) {
    console.error('POST /api/correspondence error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
