import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface Props { params: { id: string } }

export async function GET(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('todos')
      .select('*, person:persons(id, display_name)')
      .eq('id', params.id)
      .single()
    if (error) throw error
    if (!data)  return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ todo: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: Props) {
  try {
    const body     = await req.json()
    const supabase = createServerSupabaseClient()

    // If marking complete, stamp completed_at
    const extra: Record<string, unknown> = {}
    if (body.status === 'complete' && !body.completed_at) {
      extra.completed_at = new Date().toISOString()
    }
    if (body.status && body.status !== 'complete') {
      extra.completed_at = null
    }

    const { data, error } = await supabase
      .from('todos')
      .update({ ...body, ...extra, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select('*, person:persons(id, display_name)')
      .single()
    if (error) throw error
    return NextResponse.json({ todo: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ deleted: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
