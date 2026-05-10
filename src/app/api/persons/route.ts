import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET /api/persons -- list all persons, alphabetical by display_name
// Shared endpoint used by Research Log, Case Study Builder, and any other module
// that needs a person picker.
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('persons')
      .select('id, display_name, given_name, surname, birth_date, birth_place')
      .order('display_name')
    if (error) throw error
    return NextResponse.json({ persons: data ?? [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/persons -- create a new person record
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { display_name, given_name, surname, birth_date, birth_place, notes } = body

    if (!display_name?.trim()) {
      return NextResponse.json({ error: 'display_name is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('persons')
      .insert({
        display_name: display_name.trim(),
        given_name:   given_name?.trim()   ?? null,
        surname:      surname?.trim()      ?? null,
        birth_date:   birth_date?.trim()   ?? null,
        birth_place:  birth_place?.trim()  ?? null,
        notes:        notes?.trim()        ?? null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ person: data }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
