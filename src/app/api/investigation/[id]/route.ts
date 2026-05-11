import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { use } from 'react'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = use(params)
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('investigations')
    .select(`
      *,
      persons:primary_person_id (id, name_given, name_surname)
    `)
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = use(params)
  const supabase = createServerSupabaseClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('investigations')
    .update({ ...body, last_worked_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
