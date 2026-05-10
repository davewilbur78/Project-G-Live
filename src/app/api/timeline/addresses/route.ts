import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET /api/timeline/addresses?person_id=X&source_id=Y
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const person_id = searchParams.get('person_id')
    const source_id = searchParams.get('source_id')

    const supabase = createServerSupabaseClient()
    let query = supabase
      .from('addresses')
      .select(`
        *,
        person:persons(id, display_name),
        source:sources(id, label, ee_short_citation)
      `)
      .order('address_date', { ascending: true, nullsFirst: false })

    if (person_id) query = query.eq('person_id', person_id)
    if (source_id) query = query.eq('source_id', source_id)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ addresses: data ?? [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/timeline/addresses
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      person_id, source_id, address_role,
      raw_text, street_address, city, county, state_province, country,
      lat, lng, address_date, date_qualifier, date_display, notes,
    } = body

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('addresses')
      .insert({
        person_id:      person_id               ?? null,
        source_id:      source_id               ?? null,
        address_role:   address_role            ?? 'residence',
        raw_text:       raw_text?.trim()        ?? null,
        street_address: street_address?.trim()  ?? null,
        city:           city?.trim()            ?? null,
        county:         county?.trim()          ?? null,
        state_province: state_province?.trim()  ?? null,
        country:        country?.trim()         ?? null,
        lat:            lat                     ?? null,
        lng:            lng                     ?? null,
        address_date:   address_date            ?? null,
        date_qualifier: date_qualifier          ?? 'exact',
        date_display:   date_display?.trim()    ?? null,
        notes:          notes?.trim()           ?? null,
      })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ address: data }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
