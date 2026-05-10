import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { callClaude } from '@/lib/ai'

interface Props { params: { id: string } }

// POST /api/document-analysis/[id]/extract-facts
// Sends the document transcription to Claude (Fact Extractor v4 engine).
// Returns structured GPS-classified fact claims and saves them to document_facts.
//
// This route replaces (deletes and recreates) all AI-generated facts for the document.
// Manually entered facts (ai_generated: false) are left untouched.

export async function POST(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()

    // Load the document and its linked source
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('*, source:sources(label, source_type, info_type, evidence_type, ee_full_citation)')
      .eq('id', params.id)
      .single()

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (!doc.transcription?.trim()) {
      return NextResponse.json(
        { error: 'No transcription found. Add transcription text before extracting facts.' },
        { status: 400 }
      )
    }

    // Build the prompt for fact extraction
    // The source's GPS classification provides document-level context.
    // Claude must classify each individual claim within that context.
    const sourceContext = doc.source
      ? `Source: "${doc.source.label}" (${doc.source.source_type} source, ${doc.source.info_type} information, ${doc.source.evidence_type} evidence)`
      : 'Source: not specified'

    const prompt = `You are analyzing a genealogical document as part of a GPS-compliant research workflow.

${sourceContext}
EE Citation: ${doc.source?.ee_full_citation ?? 'Not provided'}

DOCUMENT TRANSCRIPTION:
${doc.transcription}

TASK: Extract every discrete factual claim from this document. For each claim:
1. Write the claim as a precise, standalone statement (not a quote -- your paraphrase of what the document states)
2. Classify information_type: was the informant likely a firsthand witness to THIS specific claim?
   - Primary: firsthand witness (e.g., the registrar who personally recorded a birth is primary for the birth date)
   - Secondary: not a firsthand witness (e.g., a widow reporting her husband's birthplace is secondary for that fact)
   - Undetermined: informant identity or knowledge cannot be assessed
   - N/A: not applicable for this type of claim
3. Classify evidence_type relative to a GENEALOGICAL RESEARCH QUESTION (not the document itself):
   - Direct: explicitly answers an identity, parentage, or relationship question without inference
   - Indirect: implies an answer but requires inference to reach the conclusion
   - Negative: absence of expected information that is itself meaningful

ANTI-FABRICATION: Extract only claims actually present in the transcription. Do not infer, add, or embellish.

Respond ONLY with valid JSON. No preamble, no markdown, no explanation. Exactly this structure:
{
  "facts": [
    {
      "claim_text": "string -- the discrete factual claim",
      "source_type": "Original|Derivative|Authored",
      "info_type": "Primary|Secondary|Undetermined|N/A",
      "evidence_type": "Direct|Indirect|Negative",
      "notes": "string -- optional brief explanation of the classification, or empty string"
    }
  ]
}

source_type is inherited from the document's GPS classification: ${doc.source?.source_type ?? 'Unknown'}.
Use that value for every fact.`

    const raw = await callClaude(
      [{ role: 'user', content: prompt }],
      { maxTokens: 4000 }
    )

    // Parse response
    let parsed: { facts: Array<{
      claim_text: string
      source_type: string
      info_type: string
      evidence_type: string
      notes?: string
    }> }
    try {
      const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      return NextResponse.json(
        { error: 'AI returned malformed JSON. Try again or add facts manually.', raw },
        { status: 500 }
      )
    }

    if (!Array.isArray(parsed.facts) || parsed.facts.length === 0) {
      return NextResponse.json(
        { error: 'AI returned no facts. The transcription may be too short or unclear.' },
        { status: 400 }
      )
    }

    // Delete existing AI-generated facts for this document
    await supabase
      .from('document_facts')
      .delete()
      .eq('document_id', params.id)
      .eq('ai_generated', true)

    // Insert new facts
    const sourceType = doc.source?.source_type ?? 'Original'
    const validSourceTypes = ['Original', 'Derivative', 'Authored']
    const validInfoTypes = ['Primary', 'Secondary', 'Undetermined', 'N/A']
    const validEvidenceTypes = ['Direct', 'Indirect', 'Negative']

    const rows = parsed.facts
      .filter(f => f.claim_text?.trim())
      .map((f, i) => ({
        document_id:   params.id,
        claim_text:    f.claim_text.trim(),
        source_type:   validSourceTypes.includes(f.source_type) ? f.source_type : sourceType,
        info_type:     validInfoTypes.includes(f.info_type) ? f.info_type : 'Undetermined',
        evidence_type: validEvidenceTypes.includes(f.evidence_type) ? f.evidence_type : 'Indirect',
        display_order: i,
        ai_generated:  true,
        notes:         f.notes?.trim() ?? null,
      }))

    const { data: inserted, error: insertError } = await supabase
      .from('document_facts')
      .insert(rows)
      .select()

    if (insertError) throw insertError

    // Mark transcription_status complete
    await supabase
      .from('documents')
      .update({ transcription_status: 'complete', updated_at: new Date().toISOString() })
      .eq('id', params.id)

    return NextResponse.json({ facts: inserted, count: inserted?.length ?? 0 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
