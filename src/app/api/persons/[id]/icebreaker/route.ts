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

  const { data: person } = await supabase
    .from('persons')
    .select('id, given_name, surname, birth_date_display, birth_place, death_date_display, death_place')
    .eq('id', id)
    .single();

  if (!person) {
    return NextResponse.json({ error: 'Person not found' }, { status: 404 });
  }

  const { data: timeline } = await supabase
    .from('timeline_events')
    .select('id, event_date_display, event_date_sort, place_name, source_id, event_types(name)')
    .eq('person_id', id)
    .order('event_date_sort', { ascending: true, nullsFirst: false });

  const totalEvents = (timeline || []).length;
  const sourcedEvents = (timeline || []).filter((e: any) => e.source_id).length;
  const unsourcedEvents = totalEvents - sourcedEvents;
  const sourcingPct = totalEvents > 0 ? Math.round((sourcedEvents / totalEvents) * 100) : 0;

  const eventLines = (timeline || [])
    .map((e: any) => {
      const typeName = e.event_types?.name || 'event';
      const place = e.place_name ? ` at ${e.place_name}` : '';
      const sourced = e.source_id ? ' [sourced]' : ' [UNSOURCED]';
      return `- ${e.event_date_display || 'date unknown'}: ${typeName}${place}${sourced}`;
    })
    .join('\n');

  const dataContext = [
    `PERSON: ${person.given_name} ${person.surname}`,
    `Born: ${person.birth_date_display || 'unknown'}${person.birth_place ? ` in ${person.birth_place}` : ''}`,
    `Died: ${person.death_date_display || 'unknown'}${person.death_place ? ` in ${person.death_place}` : ''}`,
    '',
    `TIMELINE: ${totalEvents} total events | ${sourcedEvents} sourced (${sourcingPct}%) | ${unsourcedEvents} unsourced`,
    '',
    'EVENTS:',
    eventLines || '(none)',
  ].join('\n');

  const prompt = `You are generating a single genealogical research icebreaker -- one specific, actionable observation drawn entirely from the data provided below.

CRITICAL RULES:
- Use ONLY the data provided. Do not invent facts, dates, places, or record sets not shown.
- Generate exactly ONE observation. Not a summary. Not a list. One thing a researcher could act on today.
- Keep it to 2-3 sentences maximum.
- Write in second person, addressing the researcher directly.
- Be specific about what the data actually shows -- not what it might show.
- Good examples: a gap between two known events, an unsourced event that anchors a search, a place that appears repeatedly, a span with no events where records should exist.
- Do not mention confidence levels, caveats, or hedges. Speak to what the data shows.

DATA:
${dataContext}

Generate the research icebreaker now.`;

  try {
    const icebreaker = await callWithEngine('gra', prompt);
    return NextResponse.json({ icebreaker: icebreaker?.trim() || null });
  } catch (err) {
    console.error('Icebreaker generation error:', err);
    return NextResponse.json({ icebreaker: null });
  }
}
