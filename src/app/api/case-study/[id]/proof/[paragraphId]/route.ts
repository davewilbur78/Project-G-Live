// Proof Paragraphs -- update and delete
// PATCH: update paragraph content or display order
// DELETE: remove paragraph
// TIMESTAMP: 2026-05-09 17:20 UTC

import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

interface Params { params: { id: string; paragraphId: string } }

export async function PATCH(req: Request, { params }: Params) {
  const body = await req.json()
  const supabase = createServerClient()

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if ('content' in body) update.content = body.content
  if ('display_order' in body) update.display_order = body.display_order

  const { data, error } = await supabase
    .from('proof_paragraphs')
    .update(update)
    .eq('id', params.paragraphId)
    .eq('case_study_id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ paragraph: data })
}

export async function DELETE(_req: Request, { params }: Params) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('proof_paragraphs')
    .delete()
    .eq('id', params.paragraphId)
    .eq('case_study_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
