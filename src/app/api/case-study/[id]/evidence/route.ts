import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface Params { params: { id: string } }

const VALID_WEIGHTS = ['Very Strong', 'Strong', 'Moderate', 'Corroborating']

// GET /api/case-study/[id]/evidence -- evidence chain links in order
export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('evidence_chain_links')
    .select('*')
    .eq('case_study_id', params.id)
    .order('display_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ links: data })
}

// POST /api/case-study/[id]/evidence -- add evidence chain link
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const body = await req.json()

  if (!body.claim?.trim()) {
    return NextResponse.json({ error: 'claim is required' }, { status: 400 })
  }
  if (!VALID_WEIGHTS.includes(body.weight)) {
    return NextResponse.json(
      { error: 'weight must be Very Strong, Strong, Moderate, or Corroborating' },
      { status: 400 }
    )
  }

  // Auto-assign next display_order if not provided
  const { data: existing } = await supabase
    .from('evidence_chain_links')
    .select('display_order')
    .eq('case_study_id', params.id)
    .order('display_order', { ascending: false })
    .limit(1)

  const nextOrder = (existing && existing.length > 0)
    ? existing[0].display_order + 1
    : 1

  const { data, error } = await supabase
    .from('evidence_chain_links')
    .insert({
      case_study_id:     params.id,
      display_order:     body.display_order ?? nextOrder,
      claim:             body.claim.trim(),
      weight:            body.weight,
      sources_narrative: body.sources_narrative?.trim() || null,
      footnote_numbers:  body.footnote_numbers || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ link: data }, { status: 201 })
}
