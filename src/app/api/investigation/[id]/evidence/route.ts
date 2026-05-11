import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = (await params)
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('investigation_evidence')
    .select('*')
    .eq('investigation_id', id)
    .order('added_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = (await params)
  const supabase = createServerSupabaseClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('investigation_evidence')
    .insert({
      investigation_id: id,
      title: body.title,
      record_type: body.record_type || null,
      record_date: body.record_date || null,
      notes: body.notes || null,
      source_id: body.source_id || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
