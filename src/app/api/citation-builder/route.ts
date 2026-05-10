// GET /api/citation-builder -- list all sources
// POST /api/citation-builder -- create a source

import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data: sources, error } = await supabase
      .from('sources')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ sources })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[citation-builder GET]', message)
    return NextResponse.json({ error: message, sources: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Required fields
    const required = [
      'label',
      'source_type',
      'info_type',
      'evidence_type',
      'ee_full_citation',
      'ee_short_citation',
    ]
    for (const field of required) {
      if (!body[field]?.trim()) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // GPS vocabulary validation
    const sourceTypes = ['Original', 'Derivative', 'Authored']
    const infoTypes   = ['Primary', 'Secondary', 'Undetermined', 'N/A']
    const evidTypes   = ['Direct', 'Indirect', 'Negative']

    if (!sourceTypes.includes(body.source_type)) {
      return NextResponse.json({ error: 'Invalid source_type. Must be Original, Derivative, or Authored.' }, { status: 400 })
    }
    if (!infoTypes.includes(body.info_type)) {
      return NextResponse.json({ error: 'Invalid info_type. Must be Primary, Secondary, Undetermined, or N/A.' }, { status: 400 })
    }
    if (!evidTypes.includes(body.evidence_type)) {
      return NextResponse.json({ error: 'Invalid evidence_type. Must be Direct, Indirect, or Negative.' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { data: source, error } = await supabase
      .from('sources')
      .insert([{
        label:             body.label.trim(),
        source_type:       body.source_type,
        info_type:         body.info_type,
        evidence_type:     body.evidence_type,
        ee_full_citation:  body.ee_full_citation.trim(),
        ee_short_citation: body.ee_short_citation.trim(),
        repository:        body.repository?.trim()   || null,
        collection:        body.collection?.trim()   || null,
        ark_identifier:    body.ark_identifier?.trim() || null,
        nara_series:       body.nara_series?.trim()  || null,
        ancestry_url:      body.ancestry_url?.trim() || null,
      }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ source }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[citation-builder POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
