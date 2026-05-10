import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface Props { params: { id: string } }

// GET /api/document-analysis/[id]/facts -- list all facts for a document
export async function GET(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('document_facts')
      .select('*')
      .eq('document_id', params.id)
      .order('display_order', { ascending: true })
    if (error) throw error
    return NextResponse.json({ facts: data ?? [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/document-analysis/[id]/facts -- add a single fact manually
export async function POST(req: Request, { params }: Props) {
  try {
    const body = await req.json()
    const { claim_text, source_type, info_type, evidence_type, notes } = body

    if (!claim_text?.trim()) {
      return NextResponse.json({ error: 'claim_text is required' }, { status: 400 })
    }
    if (!['Original', 'Derivative', 'Authored'].includes(source_type)) {
      return NextResponse.json({ error: 'Invalid source_type' }, { status: 400 })
    }
    if (!['Primary', 'Secondary', 'Undetermined', 'N/A'].includes(info_type)) {
      return NextResponse.json({ error: 'Invalid info_type' }, { status: 400 })
    }
    if (!['Direct', 'Indirect', 'Negative'].includes(evidence_type)) {
      return NextResponse.json({ error: 'Invalid evidence_type' }, { status: 400 })
    }

    // Get current max display_order
    const supabase = createServerSupabaseClient()
    const { data: existing } = await supabase
      .from('document_facts')
      .select('display_order')
      .eq('document_id', params.id)
      .order('display_order', { ascending: false })
      .limit(1)

    const nextOrder = (existing?.[0]?.display_order ?? -1) + 1

    const { data, error } = await supabase
      .from('document_facts')
      .insert({
        document_id:   params.id,
        claim_text:    claim_text.trim(),
        source_type,
        info_type,
        evidence_type,
        display_order: nextOrder,
        ai_generated:  false,
        notes:         notes?.trim() ?? null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ fact: data }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
