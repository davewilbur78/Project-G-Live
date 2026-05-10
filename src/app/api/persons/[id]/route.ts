import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface Props { params: { id: string } }

// GET /api/persons/[id]
export async function GET(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .eq('id', params.id)
      .single()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ person: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH /api/persons/[id]
export async function PATCH(req: Request, { params }: Props) {
  try {
    const body = await req.json()
    const { display_name, given_name, surname, birth_date, birth_place, death_date, death_place, notes } = body

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (display_name  !== undefined) updates.display_name  = display_name?.trim()  ?? null
    if (given_name    !== undefined) updates.given_name    = given_name?.trim()    ?? null
    if (surname       !== undefined) updates.surname       = surname?.trim()       ?? null
    if (birth_date    !== undefined) updates.birth_date    = birth_date?.trim()    ?? null
    if (birth_place   !== undefined) updates.birth_place   = birth_place?.trim()   ?? null
    if (death_date    !== undefined) updates.death_date    = death_date?.trim()    ?? null
    if (death_place   !== undefined) updates.death_place   = death_place?.trim()   ?? null
    if (notes         !== undefined) updates.notes         = notes?.trim()         ?? null

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('persons')
      .update(updates)
      .eq('id', params.id)
      .select('*')
      .single()
    if (error) throw error
    return NextResponse.json({ person: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /api/persons/[id]
export async function DELETE(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from('persons').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ deleted: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
