import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

  // 1. Person
  const { data: person, error: personError } = await supabase
    .from('persons')
    .select('*')
    .eq('id', id)
    .single();

  if (personError || !person) {
    return NextResponse.json({ error: 'Person not found' }, { status: 404 });
  }

  // 2. Timeline events with event_types, sources, and addresses
  const { data: timeline } = await supabase
    .from('timeline_events')
    .select(`
      id, date_display, event_date, place_name, notes,
      source_id, address_id,
      event_types(id, display_name),
      sources(id, label, ee_short_citation, source_type, info_type, evidence_type),
      addresses(id, street_address, city, state_province, country, lat, lng)
    `)
    .eq('person_id', id)
    .order('event_date', { ascending: true, nullsFirst: false });

  // 3. Family connections
  const { data: memberships } = await supabase
    .from('family_members')
    .select('family_id, role')
    .eq('person_id', id);

  const familyIds = (memberships || []).map((m: any) => m.family_id);
  const familyConnections: { parents: any[]; spouses: any[]; children: any[] } = {
    parents: [],
    spouses: [],
    children: [],
  };

  if (familyIds.length > 0) {
    const { data: familyData } = await supabase
      .from('families')
      .select(`
        id, marriage_date_display, marriage_place,
        family_members(
          person_id, role,
          persons(id, given_name, surname, birth_date, death_date)
        )
      `)
      .in('id', familyIds);

    (familyData || []).forEach((family: any) => {
      const myMembership = (memberships || []).find((m: any) => m.family_id === family.id);
      const others = (family.family_members || []).filter((m: any) => m.person_id !== id);

      if (myMembership?.role === 'child') {
        others
          .filter((m: any) => m.role === 'partner')
          .forEach((m: any) => {
            if (m.persons) familyConnections.parents.push(m.persons);
          });
      } else if (myMembership?.role === 'partner') {
        others
          .filter((m: any) => m.role === 'partner')
          .forEach((m: any) => {
            if (m.persons)
              familyConnections.spouses.push({
                ...m.persons,
                marriage_date_display: family.marriage_date_display,
                marriage_place: family.marriage_place,
              });
          });
        others
          .filter((m: any) => m.role === 'child')
          .forEach((m: any) => {
            if (m.persons) familyConnections.children.push(m.persons);
          });
      }
    });
  }

  // 4. Deduplicated sources from timeline
  const sourceMap = new Map<string, any>();
  (timeline || []).forEach((event: any) => {
    if (event.sources?.id) {
      sourceMap.set(event.sources.id, event.sources);
    }
  });
  const sources = Array.from(sourceMap.values());

  // 5. Open todos for this person
  const { data: todos } = await supabase
    .from('todos')
    .select('id, title, priority, origin_module, created_at, status')
    .eq('person_id', id)
    .not('status', 'eq', 'complete')
    .order('created_at', { ascending: false });

  // 6. Associations (FAN Club) -- query both directions, then fetch person names
  const { data: assoc1 } = await supabase
    .from('associations')
    .select('id, association_type, notes, person_id_2')
    .eq('person_id_1', id)
    .limit(20);

  const { data: assoc2 } = await supabase
    .from('associations')
    .select('id, association_type, notes, person_id_1')
    .eq('person_id_2', id)
    .limit(20);

  // Collect all associated person IDs
  const assocPersonIds = [
    ...(assoc1 || []).map((a: any) => a.person_id_2),
    ...(assoc2 || []).map((a: any) => a.person_id_1),
  ].filter(Boolean);

  let assocPersons: Record<string, any> = {};
  if (assocPersonIds.length > 0) {
    const { data: ap } = await supabase
      .from('persons')
      .select('id, given_name, surname')
      .in('id', assocPersonIds);
    (ap || []).forEach((p: any) => { assocPersons[p.id] = p; });
  }

  const associations = [
    ...(assoc1 || []).map((a: any) => ({ ...a, person: assocPersons[a.person_id_2] })),
    ...(assoc2 || []).map((a: any) => ({ ...a, person: assocPersons[a.person_id_1] })),
  ];

  // 7. Map addresses -- timeline events that have geocoded addresses
  const mapAddresses = (timeline || [])
    .filter((e: any) => e.addresses?.lat && e.addresses?.lng)
    .map((e: any) => ({
      ...e.addresses,
      event_type: e.event_types?.display_name || 'Event',
      event_date_display: e.event_date_display,
      place_name: e.place_name,
    }));

  return NextResponse.json({
    person,
    timeline: (timeline || []).map((e: any) => ({
      ...e,
      event_date_display: e.date_display,
      event_type_name: e.event_types?.display_name || e.event_type || 'Event',
      sources: e.sources ? {
        ...e.sources,
        title: e.sources.label,
        short_footnote_form: e.sources.ee_short_citation,
        information_type: e.sources.info_type,
      } : null,
    })),
    familyConnections,
    sources: sources.map((s: any) => ({
      ...s,
      title: s.label,
      short_footnote_form: s.ee_short_citation,
      information_type: s.info_type,
    })),
    todos: todos || [],
    associations,
    mapAddresses,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabase();
  const body = await request.json();

  const { data, error } = await supabase
    .from('persons')
    .update({ research_status: body.research_status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
