// Evidence Chain Links -- list and create
// GET: all evidence chain links for this case study, ordered
// POST: add a new link to the evidence chain
// TIMESTAMP: 2026-05-09 17:20 UTC

import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const VALID_WEIGHTS = ['Very Strong', 'Strong', 'Moderate', 'Corroborating'] as const

interface Params { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('evidence_chain_links')
    .select('*')
    .eq('case_study_id', params.id)
    .order('display_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ evidence: data ?? [] })
}

export async function POST(req: Request, { params }: Params) {
  const body = await req.json()
  const { claim, weight, sources_narrative, footnote_numbers, display_order } = body

  if (!claim?.trim())
    return NextResponse.json({ error: 'claim is required' }, { status: 400 })
  if (!weight || !(VALID_WEIGHTS as readonly string[]).includes(weight))
    return NextResponse.json(
      { error: `weight must be one of: ${VALID_WEIGHTS.join(', ')}` },
      { status: 400 }
    )

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('evidence_chain_links')
    .insert({
      case_study_id: params.id,
      claim: claim.trim(),
      weight,
      sources_narrative: sources_narrative?.trim() || null,
      footnote_numbers: footnote_numbers ?? null,
      display_order: display_order ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ link: data }, { status: 201 })
}
