import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { callWithEngine } from '@/lib/ai';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data: person, error: personError } = await supabase
    .from('persons')
    .select('id, given_name, surname, birth_date, birth_place, death_date, death_place')
    .eq('id', id)
    .single();

  if (personError || !person) {
    return NextResponse.json({ error: 'Person not found' }, { status: 404 });
  }

  const { data: timeline } = await supabase
    .from('timeline_events')
    .select('id, date_display, event_date, place_name, source_id, event_types(display_name)')
    .eq('person_id', id)
    .order('event_date', { ascending: true, nullsFirst: false });

  const totalEvents = (timeline || []).length;
  const sourcedEvents = (timeline || []).filter((e: any) => e.source_id).length;
  const unsourcedEvents = totalEvents - sourcedEvents;
  const sourcingPct = totalEvents > 0 ? Math.round((sourcedEvents / totalEvents) * 100) : 0;

  const eventLines = (timeline || [])
    .map((e: any) => {
      const typeName = (e.event_types as any)?.display_name || 'Event';
      const place = e.place_name ? ` at ${e.place_name}` : '';
      const sourced = e.source_id ? ' [sourced]' : ' [UNSOURCED]';
      return `- ${e.date_display || 'date unknown'}: ${typeName}${place}${sourced}`;
    })
    .join('\n');

  const dataContext = [
    `PERSON: ${person.given_name} ${person.surname}`,
    `Born: ${person.birth_date || 'unknown'}${person.birth_place ? ` in ${person.birth_place}` : ''}`,
    `Died: ${person.death_date || 'unknown'}${person.death_place ? ` in ${person.death_place}` : ''}`,
    '',
    `TIMELINE: ${totalEvents} total events | ${sourcedEvents} sourced (${sourcingPct}%) | ${unsourcedEvents} unsourced`,
    '',
    'EVENTS:',
    eventLines || '(none)',
  ].join('\n');

  const prompt = `You are generating a research package for a genealogical researcher. Using ONLY the data provided below, produce two outputs.

CRITICAL RULES:
- Use ONLY the data provided. Do not invent facts, dates, places, names, or record sets not shown.
- Icebreaker: exactly ONE actionable observation, 2-3 sentences max. Second person. Specific. No hedging.
- Scaffold: structured markdown using only ## headers. Each section gets 1-3 bullet observations drawn directly from the data. Do not add placeholder bullets ("No data available" etc.) -- simply omit sections that have nothing real to say.
- Both outputs must be consistent with each other -- they are generated from the same data.

SECTIONS FOR SCAFFOLD (use only those with real content):
## What We Know — sourced facts about this person
## Unsourced Events — events present in timeline without a source
## Gaps in the Record — spans of time or life stages with no events
## Next Steps — specific record sets or archives implied by the data above

Respond with valid JSON only. No preamble, no markdown fences.
{
  "icebreaker": "<2-3 sentence research prompt>",
  "scaffold": "<markdown string>"
}

DATA:
${dataContext}`;

  try {
    const raw = await callWithEngine('gra', prompt);
    const trimmed = (raw || '').trim();

    // Strip markdown code fences if the model wrapped the JSON
    const jsonStr = trimmed.startsWith('```')
      ? trimmed.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim()
      : trimmed;

    let icebreaker: string | null = null;
    let scaffold: string | null = null;

    try {
      const parsed = JSON.parse(jsonStr);
      icebreaker = parsed.icebreaker?.trim() || null;
      scaffold = parsed.scaffold?.trim() || null;
    } catch {
      // Fallback: if JSON parse fails, return raw as icebreaker only
      icebreaker = trimmed || null;
    }

    return NextResponse.json({ icebreaker, scaffold });
  } catch (err) {
    console.error('Scaffold generation error:', err);
    return NextResponse.json({ icebreaker: null, scaffold: null });
  }
}
