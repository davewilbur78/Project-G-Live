import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface Params { params: { id: string; linkId: string } }

const VALID_WEIGHTS = ['Very Strong', 'Strong', 'Moderate', 'Corroborating']

// PATCH /api/case-study/[id]/evidence/[linkId]
export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const body = await req.json()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if ('claim' in body)             updates.claim = body.claim
  if ('weight' in body) {
    if (!VALID_WEIGHTS.includes(body.weight)) {
      return NextResponse.json({ error: 'Invalid weight' }, { status: 400 })
    }
    updates.weight = body.weight
  }
  if ('sources_narrative' in body) updates.sources_narrative = body.sources_narrative
  if ('footnote_numbers' in body)  updates.footnote_numbers = body.footnote_numbers
  if ('display_order' in body)     updates.display_order = body.display_order

  const { data, error } = await supabase
    .from('evidence_chain_links')
    .update(updates)
    .eq('id', params.linkId)
    .eq('case_study_id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ link: data })
}

// DELETE /api/case-study/[id]/evidence/[linkId]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient()

  const { error } = await supabase
    .from('evidence_chain_links')
    .delete()
    .eq('id', params.linkId)
    .eq('case_study_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
