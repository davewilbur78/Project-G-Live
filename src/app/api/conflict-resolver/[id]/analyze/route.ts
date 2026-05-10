import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { callClaude } from '@/lib/ai'

const FACT_LABELS: Record<string, string> = {
  birth_date:  'Birth Date',
  birth_place: 'Birth Place',
  name:        'Name / Name Spelling',
  age:         'Age at Event',
  death_date:  'Death Date',
  death_place: 'Death Place',
  residence:   'Residence / Address',
  immigration: 'Immigration / Arrival Date',
  marriage:    'Marriage Date or Place',
  occupation:  'Occupation',
  other:       'Other',
}

// POST /api/conflict-resolver/[id]/analyze
// Uses Claude to produce a GPS-compliant conflict analysis.
// Writes the analysis back to the record and returns the updated conflict.
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()

    // Fetch conflict with both sources
    const { data: conflict, error: fetchError } = await supabase
      .from('source_conflicts')
      .select(`
        *,
        person:persons(id, display_name),
        source_a:sources!source_conflicts_source_a_id_fkey(
          id, label, source_type, info_type, evidence_type,
          ee_full_citation, ee_short_citation
        ),
        source_b:sources!source_conflicts_source_b_id_fkey(
          id, label, source_type, info_type, evidence_type,
          ee_full_citation, ee_short_citation
        )
      `)
      .eq('id', params.id)
      .single()

    if (fetchError) throw fetchError

    const sa = conflict.source_a as Record<string, string> | null
    const sb = conflict.source_b as Record<string, string> | null
    const person = conflict.person as { display_name: string } | null
    const factLabel = FACT_LABELS[conflict.fact_in_dispute] ?? conflict.fact_in_dispute

    const prompt = `You are a GPS-compliant genealogical researcher performing a source conflict analysis.

Two sources provide different information about the same fact. Analyze this conflict using the Genealogical Proof Standard.

SUBJECT: ${person?.display_name ?? 'Unknown'}
FACT IN DISPUTE: ${factLabel}
DESCRIPTION OF DISCREPANCY: ${conflict.description}

SOURCE A: ${sa?.label ?? 'Unknown source'}
- GPS Source Type: ${sa?.source_type ?? 'Unknown'} (Original = created at time of event; Derivative = transcribed/abstracted from original; Authored = compiled from multiple sources)
- GPS Information Type: ${sa?.info_type ?? 'Unknown'} (Primary = informant had firsthand knowledge; Secondary = informant did not have firsthand knowledge; Undetermined)
- GPS Evidence Type: ${sa?.evidence_type ?? 'Unknown'} (Direct = explicitly states the fact; Indirect = requires inference; Negative = absence of record is the evidence)
- Short citation: ${sa?.ee_short_citation ?? 'Not provided'}
- What Source A says about the disputed fact: ${conflict.source_a_value ?? 'Not specified'}

SOURCE B: ${sb?.label ?? 'Unknown source'}
- GPS Source Type: ${sb?.source_type ?? 'Unknown'}
- GPS Information Type: ${sb?.info_type ?? 'Unknown'}
- GPS Evidence Type: ${sb?.evidence_type ?? 'Unknown'}
- Short citation: ${sb?.ee_short_citation ?? 'Not provided'}
- What Source B says about the disputed fact: ${conflict.source_b_value ?? 'Not specified'}

Provide a GPS-compliant source conflict analysis. Consider:
1. Source quality hierarchy: Original sources are generally more reliable than Derivative, which are more reliable than Authored
2. Information quality: Primary information (from someone with firsthand knowledge) is generally more reliable than Secondary
3. Evidence type: Direct evidence is more straightforward than Indirect, but both require critical evaluation
4. Context: The time elapsed between the event and the recording, the informant's likely knowledge, and any known transcription errors
5. Do not fabricate corroborating sources or facts not provided above

Return ONLY valid JSON (no markdown fences, no preamble):
{
  "analysis_text": "GPS-compliant analysis of the conflict. 2-4 paragraphs. Evaluate each source on its merits using the GPS framework. Name which source carries more evidentiary weight and explain why, considering source type, information type, and evidence type. Acknowledge any uncertainty. Do not fabricate additional sources or facts.",
  "resolution": "The specific conclusion the evidence supports, stated as a complete sentence. If inconclusive, state that directly.",
  "resolution_basis": "source_quality | preponderance | corroboration | inconclusive"
}`

    const raw = await callClaude(
      [{ role: 'user', content: prompt }],
      { maxTokens: 2000 }
    )

    let parsed: { analysis_text: string; resolution: string; resolution_basis: string }
    try {
      const clean = raw.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      throw new Error('AI returned invalid JSON. Preview: ' + raw.slice(0, 300))
    }

    const validBases = ['source_quality', 'preponderance', 'corroboration', 'inconclusive']
    const basis = validBases.includes(parsed.resolution_basis) ? parsed.resolution_basis : 'inconclusive'

    // Write analysis back to the record, advance status to in_progress if still open
    const { data: updated, error: updateError } = await supabase
      .from('source_conflicts')
      .update({
        analysis_text:    parsed.analysis_text,
        resolution:       parsed.resolution,
        resolution_basis: basis,
        status:           conflict.status === 'open' ? 'in_progress' : conflict.status,
        updated_at:       new Date().toISOString(),
      })
      .eq('id', params.id)
      .select('*')
      .single()

    if (updateError) throw updateError
    return NextResponse.json({ conflict: updated })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
