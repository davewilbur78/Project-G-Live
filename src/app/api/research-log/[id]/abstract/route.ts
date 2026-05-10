import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { callClaude } from '@/lib/ai'

interface Props { params: { id: string } }

// POST /api/research-log/[id]/abstract
// Sends the session's freeform notes to Claude (Chat Conversation Abstractor v2 pattern).
// Returns structured fields: finds, negatives, follow_up -- and patches the session record.
//
// Claude is instructed to extract only what is explicitly present in the notes.
// Anti-fabrication rules apply: do not infer or add detail not present in the text.

export async function POST(_req: Request, { params }: Props) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: session, error: sessionError } = await supabase
      .from('research_sessions')
      .select('*')
      .eq('id', params.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (!session.notes?.trim()) {
      return NextResponse.json(
        { error: 'No notes found. Add freeform notes before abstracting.' },
        { status: 400 }
      )
    }

    const prompt = `You are a GPS-compliant genealogical research assistant helping structure a research session log.

The researcher has provided freeform notes from a research session. Your task is to extract and organize them into structured fields.

SESSION CONTEXT:
Date: ${session.session_date}
Title: ${session.title}
Goal: ${session.goal}

FREEFORM NOTES:
${session.notes}

EXTRACT THE FOLLOWING:
1. finds: What was found? What positive information did the research yield? Write as clear, factual statements.
2. negatives: What was NOT found? What searches were conducted that yielded no results? Under GPS, negative results are evidence and must be documented.
3. follow_up: What follow-up actions should be taken based on this session? What remains unresolved?

ANTI-FABRICATION RULES:
- Extract only what is explicitly stated in the notes. Do not infer, add, or embellish.
- If the notes contain nothing relevant for a field, return an empty string for that field.
- Do not generate generic genealogical advice. Only extract what the notes say.

Respond ONLY with valid JSON. No preamble, no markdown, no explanation. Exactly this structure:
{
  "finds": "string -- what was found, or empty string",
  "negatives": "string -- what was not found, or empty string",
  "follow_up": "string -- follow-up actions, or empty string"
}`

    const raw = await callClaude(
      [{ role: 'user', content: prompt }],
      { maxTokens: 2000 }
    )

    let parsed: { finds: string; negatives: string; follow_up: string }
    try {
      const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      return NextResponse.json(
        { error: 'AI returned malformed JSON. Try again or fill in the fields manually.', raw },
        { status: 500 }
      )
    }

    // Update the session record with the extracted fields
    const { data: updated, error: updateError } = await supabase
      .from('research_sessions')
      .update({
        finds:      parsed.finds?.trim()     || null,
        negatives:  parsed.negatives?.trim() || null,
        follow_up:  parsed.follow_up?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      session: updated,
      extracted: {
        finds:     parsed.finds,
        negatives: parsed.negatives,
        follow_up: parsed.follow_up,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
