import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET /api/timeline?person_id=X&event_type=Y
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const person_id  = searchParams.get('person_id')
    const event_type = searchParams.get('event_type')

    const supabase = createServerSupabaseClient()
    let query = supabase
      .from('timeline_events')
      .select(`
        *,
        person:persons(id, display_name),
        source:sources(id, label, ee_short_citation, source_type, info_type, evidence_type),
        address:addresses(*)
      `)
      .order('event_date', { ascending: true, nullsFirst: false })

    if (person_id)  query = query.eq('person_id', person_id)
    if (event_type) query = query.eq('event_type', event_type)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ events: data ?? [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/timeline
// Accepts optional nested address object for residence events.
// If address data is present, creates address record first, then links event.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      person_id, event_type,
      event_date, event_date_end, date_qualifier, date_display,
      place_name, city, county, state_province, country,
      source_id, evidence_type, description, notes,
      address: addressData,
      residence_date_from, residence_date_to,
      residence_from_qualifier, residence_to_qualifier, residence_current,
    } = body

    if (!event_type?.trim()) {
      return NextResponse.json({ error: 'event_type is required' }, { status: 400 })
    }
    if (!evidence_type?.trim()) {
      return NextResponse.json({ error: 'evidence_type is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    let address_id: string | null = null

    // Create address record if address data is provided and has content
    if (
      addressData &&
      (addressData.raw_text?.trim() || addressData.street_address?.trim() || addressData.city?.trim())
    ) {
      const { data: addr, error: addrErr } = await supabase
        .from('addresses')
        .insert({
          person_id:      person_id                        ?? null,
          source_id:      source_id                        ?? null,
          address_role:   addressData.address_role         ?? 'residence',
          raw_text:       addressData.raw_text?.trim()     ?? null,
          street_address: addressData.street_address?.trim() ?? null,
          city:           addressData.city?.trim()         ?? null,
          county:         addressData.county?.trim()       ?? null,
          state_province: addressData.state_province?.trim() ?? null,
          country:        addressData.country?.trim()      ?? null,
          address_date:   event_date                       ?? null,
          date_qualifier: date_qualifier                   ?? 'exact',
          date_display:   date_display?.trim()             ?? null,
          notes:          addressData.notes?.trim()        ?? null,
        })
        .select('id')
        .single()
      if (addrErr) throw addrErr
      address_id = addr.id
    }

    const { data, error } = await supabase
      .from('timeline_events')
      .insert({
        person_id:                  person_id           ?? null,
        event_type,
        event_date:                 event_date          ?? null,
        event_date_end:             event_date_end      ?? null,
        date_qualifier:             date_qualifier      ?? 'exact',
        date_display:               date_display?.trim() ?? null,
        place_name:                 place_name?.trim()  ?? null,
        city:                       city?.trim()        ?? null,
        county:                     county?.trim()      ?? null,
        state_province:             state_province?.trim() ?? null,
        country:                    country?.trim()     ?? null,
        address_id,
        residence_date_from:        residence_date_from ?? null,
        residence_date_to:          residence_date_to   ?? null,
        residence_from_qualifier:   residence_from_qualifier ?? null,
        residence_to_qualifier:     residence_to_qualifier   ?? null,
        residence_current:          residence_current   ?? false,
        source_id:                  source_id           ?? null,
        evidence_type:              evidence_type       ?? null,
        description:                description?.trim() ?? null,
        notes:                      notes?.trim()       ?? null,
      })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ event: data }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
