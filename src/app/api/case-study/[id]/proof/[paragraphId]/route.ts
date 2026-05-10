import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface Params { params: { id: string; paragraphId: string } }

// PATCH /api/case-study/[id]/proof/[paragraphId]
export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const body = await req.json()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if ('content'       in body) updates.content       = body.content
  if ('display_order' in body) updates.display_order = body.display_order

  const { data, error } = await supabase
    .from('proof_paragraphs')
    .update(updates)
    .eq('id', params.paragraphId)
    .eq('case_study_id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ paragraph: data })
}

// DELETE /api/case-study/[id]/proof/[paragraphId]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient()

  const { error } = await supabase
    .from('proof_paragraphs')
    .delete()
    .eq('id', params.paragraphId)
    .eq('case_study_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
