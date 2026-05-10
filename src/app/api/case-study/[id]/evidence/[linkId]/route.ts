// Evidence Chain Links -- update and delete
// PATCH: update claim, weight, narrative, or footnote references
// DELETE: remove link from evidence chain
// TIMESTAMP: 2026-05-09 17:20 UTC

import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

interface Params { params: { id: string; linkId: string } }

export async function PATCH(req: Request, { params }: Params) {
  const body = await req.json()
  const supabase = createServerClient()

  const allowed = ['claim', 'weight', 'sources_narrative', 'footnote_numbers', 'display_order']
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const { data, error } = await supabase
    .from('evidence_chain_links')
    .update(update)
    .eq('id', params.linkId)
    .eq('case_study_id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ link: data })
}

export async function DELETE(_req: Request, { params }: Params) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('evidence_chain_links')
    .delete()
    .eq('id', params.linkId)
    .eq('case_study_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
