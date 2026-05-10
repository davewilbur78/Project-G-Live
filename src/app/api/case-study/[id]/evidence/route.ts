// GET  /api/case-study/[id]/evidence -- list evidence chain links
// POST /api/case-study/[id]/evidence -- create a link

import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

const WEIGHT_VALUES = ['Very Strong', 'Strong', 'Moderate', 'Corroborating']

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('evidence_chain_links')
      .select('*')
      .eq('case_study_id', id)
      .order('display_order')

    if (error) throw error
    return NextResponse.json({ evidence: data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message, evidence: [] }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.claim?.trim()) {
      return NextResponse.json({ error: 'claim is required' }, { status: 400 })
    }
    if (!WEIGHT_VALUES.includes(body.weight)) {
      return NextResponse.json(
        { error: 'weight must be Very Strong, Strong, Moderate, or Corroborating' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const { data: existing } = await supabase
      .from('evidence_chain_links')
      .select('display_order')
      .eq('case_study_id', id)
      .order('display_order', { ascending: false })
      .limit(1)

    const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0

    const { data, error } = await supabase
      .from('evidence_chain_links')
      .insert([{
        case_study_id:     id,
        display_order:     nextOrder,
        claim:             body.claim.trim(),
        weight:            body.weight,
        sources_narrative: body.sources_narrative?.trim() || null,
        footnote_numbers:  body.footnote_numbers || null,
      }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ link: data }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
