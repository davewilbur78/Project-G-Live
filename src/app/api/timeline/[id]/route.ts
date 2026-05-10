import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface Props { params: { id: string } }

// GET /api/timeline/[id]
export async function GET(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('timeline_events')
      .select(`
        *,
        person:persons(id, display_name),
        source:sources(id, label, ee_short_citation, ee_full_citation, source_type, info_type, evidence_type),
        address:addresses(*)
      `)
      .eq('id', params.id)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ event: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH /api/timeline/[id]
export async function PATCH(req: Request, { params }: Props) {
  try {
    const body = await req.json()
    const {
      event_type, event_date, event_date_end, date_qualifier, date_display,
      place_name, city, county, state_province, country,
      address_id, residence_date_from, residence_date_to,
      residence_from_qualifier, residence_to_qualifier, residence_current,
      source_id, evidence_type, description, notes,
    } = body

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (event_type               !== undefined) updates.event_type               = event_type
    if (event_date               !== undefined) updates.event_date               = event_date               ?? null
    if (event_date_end           !== undefined) updates.event_date_end           = event_date_end           ?? null
    if (date_qualifier           !== undefined) updates.date_qualifier           = date_qualifier
    if (date_display             !== undefined) updates.date_display             = date_display?.trim()     ?? null
    if (place_name               !== undefined) updates.place_name               = place_name?.trim()       ?? null
    if (city                     !== undefined) updates.city                     = city?.trim()             ?? null
    if (county                   !== undefined) updates.county                   = county?.trim()           ?? null
    if (state_province           !== undefined) updates.state_province           = state_province?.trim()   ?? null
    if (country                  !== undefined) updates.country                  = country?.trim()          ?? null
    if (address_id               !== undefined) updates.address_id               = address_id               ?? null
    if (residence_date_from      !== undefined) updates.residence_date_from      = residence_date_from      ?? null
    if (residence_date_to        !== undefined) updates.residence_date_to        = residence_date_to        ?? null
    if (residence_from_qualifier !== undefined) updates.residence_from_qualifier = residence_from_qualifier ?? null
    if (residence_to_qualifier   !== undefined) updates.residence_to_qualifier   = residence_to_qualifier   ?? null
    if (residence_current        !== undefined) updates.residence_current        = residence_current
    if (source_id                !== undefined) updates.source_id                = source_id                ?? null
    if (evidence_type            !== undefined) updates.evidence_type            = evidence_type            ?? null
    if (description              !== undefined) updates.description              = description?.trim()      ?? null
    if (notes                    !== undefined) updates.notes                    = notes?.trim()            ?? null

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('timeline_events')
      .update(updates)
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ event: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /api/timeline/[id]
export async function DELETE(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ deleted: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
