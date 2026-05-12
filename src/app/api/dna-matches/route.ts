import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const platform = searchParams.get('platform')
  const ancestralLine = searchParams.get('ancestral_line')

  let query = supabase
    .from('dna_matches')
    .select(`
      id, match_name, platform, shared_cm, shared_segments,
      largest_segment_cm, status, hypothesized_relationship,
      ancestral_line, person_id, created_at,
      persons ( given_name, surname )
    `)
    .order('shared_cm', { ascending: false, nullsFirst: false })

  if (status) query = query.eq('status', status)
  if (platform) query = query.eq('platform', platform)
  if (ancestralLine) query = query.eq('ancestral_line', ancestralLine)

  const { data, error } = await query
  if (error) {
    console.error('GET /api/dna-matches error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  const {
    match_name, platform, shared_cm, shared_segments, largest_segment_cm,
    kit_number, match_email, person_id, status,
    hypothesized_relationship, ancestral_line, documentary_evidence,
    endogamy_context, in_common_with, notes,
  } = body as Record<string, string | number | null>

  if (!match_name || !platform) {
    return NextResponse.json(
      { error: 'match_name and platform are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('dna_matches')
    .insert({
      match_name,
      platform,
      shared_cm: shared_cm ?? null,
      shared_segments: shared_segments ?? null,
      largest_segment_cm: largest_segment_cm ?? null,
      kit_number: kit_number || null,
      match_email: match_email || null,
      person_id: person_id || null,
      status: status || 'unresolved',
      hypothesized_relationship: hypothesized_relationship || null,
      ancestral_line: ancestral_line || null,
      documentary_evidence: documentary_evidence || null,
      endogamy_context: endogamy_context || null,
      in_common_with: in_common_with || null,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) {
    console.error('POST /api/dna-matches error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
