import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface Props { params: { id: string; factId: string } }

// PATCH /api/document-analysis/[id]/facts/[factId]
export async function PATCH(req: Request, { params }: Props) {
  try {
    const body = await req.json()
    const allowed = ['claim_text', 'source_type', 'info_type', 'evidence_type', 'display_order', 'notes']
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('document_facts')
      .update(updates)
      .eq('id', params.factId)
      .eq('document_id', params.id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ fact: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /api/document-analysis/[id]/facts/[factId]
export async function DELETE(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from('document_facts')
      .delete()
      .eq('id', params.factId)
      .eq('document_id', params.id)
    if (error) throw error
    return NextResponse.json({ deleted: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
