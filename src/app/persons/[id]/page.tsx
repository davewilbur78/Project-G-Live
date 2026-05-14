'use client';

import { use, useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const PersonMap = dynamic(() => import('./PersonMap'), { ssr: false });

// ---- Types ----

interface Person {
  id: string;
  given_name: string | null;
  surname: string | null;
  birth_date_display: string | null;
  birth_place: string | null;
  death_date_display: string | null;
  death_place: string | null;
  sex: string | null;
  research_status: string;
}

interface TimelineEvent {
  id: string;
  event_type_name: string;
  event_date_display: string | null;
  place_name: string | null;
  source_id: string | null;
  sources?: {
    id: string;
    title: string;
    short_footnote_form: string | null;
    source_type: string | null;
  } | null;
}

interface FamilyPerson {
  id: string;
  given_name: string | null;
  surname: string | null;
  birth_date_display: string | null;
  death_date_display: string | null;
  marriage_date_display?: string | null;
  marriage_place?: string | null;
}

interface Source {
  id: string;
  title: string;
  short_footnote_form: string | null;
  source_type: string | null;
}

interface Todo {
  id: string;
  description: string;
  priority: string | null;
  origin_module: string | null;
  status: string;
}

interface Association {
  id: string;
  association_type: string | null;
  notes: string | null;
  person: { id: string; given_name: string | null; surname: string | null } | null;
}

// ---- Status config ----

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  not_started: {
    label: 'Not Started',
    badge: 'bg-gray-100 text-gray-700 border-gray-300',
    dot: 'bg-gray-400',
  },
  in_progress: {
    label: 'In Progress',
    badge: 'bg-blue-50 text-blue-800 border-blue-300',
    dot: 'bg-blue-500',
  },
  complete: {
    label: 'Complete',
    badge: 'bg-green-50 text-green-800 border-green-300',
    dot: 'bg-green-500',
  },
  needs_archive_visit: {
    label: 'Needs Archive Visit',
    badge: 'bg-amber-50 text-amber-800 border-amber-300',
    dot: 'bg-amber-500',
  },
  has_conflicts: {
    label: 'Has Conflicts',
    badge: 'bg-red-50 text-red-800 border-red-300',
    dot: 'bg-red-500',
  },
};

const STATUS_ORDER = ['not_started', 'in_progress', 'complete', 'needs_archive_visit', 'has_conflicts'];

function personName(p: { given_name: string | null; surname: string | null } | null): string {
  if (!p) return 'Unknown';
  return [p.given_name, p.surname].filter(Boolean).join(' ') || 'Unknown';
}

// ---- Page ----

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Main data
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<Person | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [familyConnections, setFamilyConnections] = useState<{
    parents: FamilyPerson[];
    spouses: FamilyPerson[];
    children: FamilyPerson[];
  }>({ parents: [], spouses: [], children: [] });
  const [sources, setSources] = useState<Source[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [mapAddresses, setMapAddresses] = useState<any[]>([]);

  // Research notes
  const [notes, setNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesLastSaved, setNotesLastSaved] = useState<Date | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Icebreaker
  const [icebreaker, setIcebreaker] = useState<string | null>(null);
  const [icebreakerLoading, setIcebreakerLoading] = useState(true);

  // Status
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  // Close status dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Load main data
  useEffect(() => {
    fetch(`/api/persons/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setLoading(false); return; }
        setPerson(data.person);
        setTimeline(data.timeline || []);
        setFamilyConnections(data.familyConnections || { parents: [], spouses: [], children: [] });
        setSources(data.sources || []);
        setTodos(data.todos || []);
        setAssociations(data.associations || []);
        setMapAddresses(data.mapAddresses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Load research notes
  useEffect(() => {
    fetch(`/api/persons/${id}/research-notes`)
      .then(r => r.json())
      .then(data => setNotes(data.content || ''))
      .catch(() => {});
  }, [id]);

  // Load icebreaker
  useEffect(() => {
    fetch(`/api/persons/${id}/icebreaker`)
      .then(r => r.json())
      .then(data => {
        setIcebreaker(data.icebreaker || null);
        setIcebreakerLoading(false);
      })
      .catch(() => setIcebreakerLoading(false));
  }, [id]);

  // Auto-save notes with 1.5s debounce
  const handleNotesChange = useCallback(
    (value: string) => {
      setNotes(value);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        setNotesSaving(true);
        try {
          await fetch(`/api/persons/${id}/research-notes`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: value }),
          });
          setNotesLastSaved(new Date());
        } finally {
          setNotesSaving(false);
        }
      }, 1500);
    },
    [id]
  );

  // Status change
  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      if (!person || statusChanging) return;
      const prev = person.research_status;
      setStatusChanging(true);
      setStatusOpen(false);
      setPerson(p => (p ? { ...p, research_status: newStatus } : p));
      try {
        await fetch(`/api/persons/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ research_status: newStatus }),
        });
      } catch {
        setPerson(p => (p ? { ...p, research_status: prev } : p));
      } finally {
        setStatusChanging(false);
      }
    },
    [person, id, statusChanging]
  );

  // ---- Render ----

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-gray-400 font-serif text-lg">Loading...</p>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-serif text-lg">Person not found.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const displayName = personName(person);
  const statusConfig = STATUS_CONFIG[person.research_status] || STATUS_CONFIG.not_started;
  const sourcedCount = timeline.filter(e => e.source_id).length;
  const sourcingPct = timeline.length > 0 ? Math.round((sourcedCount / timeline.length) * 100) : 0;
  const hasFamily =
    familyConnections.parents.length > 0 ||
    familyConnections.spouses.length > 0 ||
    familyConnections.children.length > 0;

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Breadcrumb */}
      <div className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur-sm px-6 py-3">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Dashboard
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* PANEL 1: Header Anchor */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-3xl font-semibold text-gray-900 leading-tight tracking-tight">
                {displayName}
              </h1>
              <div className="mt-2.5 space-y-0.5 font-serif text-sm text-gray-600">
                {(person.birth_date_display || person.birth_place) && (
                  <div className="flex gap-1.5">
                    <span className="text-gray-400 w-4">b.</span>
                    <span>{[person.birth_date_display, person.birth_place].filter(Boolean).join(' · ')}</span>
                  </div>
                )}
                {(person.death_date_display || person.death_place) && (
                  <div className="flex gap-1.5">
                    <span className="text-gray-400 w-4">d.</span>
                    <span>{[person.death_date_display, person.death_place].filter(Boolean).join(' · ')}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2.5 text-xs text-gray-400">
                <span>{timeline.length} events</span>
                <span>·</span>
                <span>{sourcedCount} sourced ({sourcingPct}%)</span>
                <span>·</span>
                <span>{sources.length} sources</span>
              </div>
            </div>

            {/* Research Status Badge */}
            <div className="flex-shrink-0 relative" ref={statusRef}>
              <button
                onClick={() => setStatusOpen(o => !o)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all flex items-center gap-1.5 ${
                  statusConfig.badge
                } ${statusChanging ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:shadow-sm'}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                {statusConfig.label}
                <span className="text-gray-400 ml-0.5">▾</span>
              </button>
              {statusOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                  {STATUS_ORDER.map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                        person.research_status === s ? 'bg-gray-50' : ''
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_CONFIG[s].dot}`} />
                      <span className={person.research_status === s ? 'font-semibold text-gray-900' : 'text-gray-700'}>
                        {STATUS_CONFIG[s].label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL 2: AI Icebreaker */}
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 text-xs font-bold">
              ✶
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1.5">
                Research Prompt
              </div>
              {icebreakerLoading ? (
                <p className="text-sm text-amber-600 font-serif animate-pulse">Analyzing research data...</p>
              ) : icebreaker ? (
                <p className="text-sm text-amber-900 font-serif leading-relaxed">{icebreaker}</p>
              ) : (
                <p className="text-sm text-amber-600 font-serif">No research prompt available.</p>
              )}
            </div>
          </div>
        </div>

        {/* PANEL 3: Research Notes */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold text-gray-900">Research Notes</h2>
            <div className="text-xs text-gray-400">
              {notesSaving
                ? 'Saving…'
                : notesLastSaved
                ? `Saved at ${notesLastSaved.toLocaleTimeString()}`
                : 'Auto-saves as you type'}
            </div>
          </div>
          <textarea
            value={notes}
            onChange={e => handleNotesChange(e.target.value)}
            placeholder="Your running research narrative for this person. Document hypotheses, negative evidence (failed searches are real evidence), gaps, and reasoning here. This is not the Research Log -- write freely."
            className="w-full min-h-[180px] resize-y text-sm font-serif text-gray-800 placeholder-gray-400 border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent leading-relaxed"
          />
        </div>

        {/* PANEL 4: Timeline */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <h2 className="font-serif text-lg font-semibold text-gray-900 mb-5">
            Timeline
            <span className="ml-2 text-base font-normal text-gray-400">({timeline.length})</span>
          </h2>
          {timeline.length === 0 ? (
            <p className="text-sm text-gray-400 font-serif">No timeline events found.</p>
          ) : (
            <div className="space-y-0">
              {timeline.map((event, i) => {
                const isSourced = !!event.source_id;
                return (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`mt-1 w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                          isSourced
                            ? 'bg-green-500 border-green-600'
                            : 'bg-yellow-400 border-yellow-500'
                        }`}
                      />
                      {i < timeline.length - 1 && (
                        <div className="w-px flex-1 bg-gray-100 my-1" />
                      )}
                    </div>
                    <div className="pb-4 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xs font-mono text-gray-400">
                            {event.event_date_display || 'Date unknown'}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {event.event_type_name}
                          </span>
                          {event.place_name && (
                            <span className="text-sm text-gray-600 font-serif">{event.place_name}</span>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {isSourced && event.sources ? (
                            <span
                              className="text-xs bg-green-50 text-green-700 border border-green-200 rounded px-1.5 py-0.5 max-w-[200px] block truncate"
                              title={event.sources.title}
                            >
                              {event.sources.short_footnote_form || event.sources.title}
                            </span>
                          ) : (
                            <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded px-1.5 py-0.5">
                              Unsourced
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PANEL 5: Geographic Life Story (Map) */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <h2 className="font-serif text-lg font-semibold text-gray-900 mb-4">Geographic Life Story</h2>
          <PersonMap addresses={mapAddresses} />
        </div>

        {/* PANEL 6: Family Connections */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <h2 className="font-serif text-lg font-semibold text-gray-900 mb-4">Family</h2>
          {!hasFamily ? (
            <p className="text-sm text-gray-400 font-serif">No family connections found.</p>
          ) : (
            <div className="space-y-5">
              {familyConnections.parents.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Parents</div>
                  <div className="flex flex-wrap gap-2">
                    {familyConnections.parents.map(p => (
                      <Link
                        key={p.id}
                        href={`/persons/${p.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-serif text-gray-800 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        {personName(p)}
                        {p.birth_date_display && (
                          <span className="text-xs text-gray-400">b. {p.birth_date_display}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {familyConnections.spouses.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Spouse(s)</div>
                  <div className="flex flex-wrap gap-2">
                    {familyConnections.spouses.map(p => (
                      <Link
                        key={p.id}
                        href={`/persons/${p.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-serif text-gray-800 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        {personName(p)}
                        {p.marriage_date_display && (
                          <span className="text-xs text-gray-400">m. {p.marriage_date_display}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {familyConnections.children.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Children</div>
                  <div className="flex flex-wrap gap-2">
                    {familyConnections.children.map(p => (
                      <Link
                        key={p.id}
                        href={`/persons/${p.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-serif text-gray-800 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        {personName(p)}
                        {p.birth_date_display && (
                          <span className="text-xs text-gray-400">b. {p.birth_date_display}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PANEL 7: Sources */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <h2 className="font-serif text-lg font-semibold text-gray-900 mb-4">
            Sources
            <span className="ml-2 text-base font-normal text-gray-400">({sources.length})</span>
          </h2>
          {sources.length === 0 ? (
            <p className="text-sm text-gray-400 font-serif">No sources attached to this person&apos;s timeline.</p>
          ) : (
            <div className="space-y-2">
              {sources.map(source => (
                <div
                  key={source.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div
                    className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${
                      source.source_type === 'original'
                        ? 'bg-green-500'
                        : source.source_type === 'derivative'
                        ? 'bg-yellow-500'
                        : 'bg-blue-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 font-serif leading-snug">
                      {source.title}
                    </div>
                    {source.short_footnote_form && (
                      <div className="text-xs text-gray-500 mt-0.5 font-mono">
                        {source.short_footnote_form}
                      </div>
                    )}
                    {source.source_type && (
                      <span className="mt-1 inline-block text-xs text-gray-400 capitalize">
                        {source.source_type}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PANEL 8: Open To-Dos */}
        {todos.length > 0 && (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
            <h2 className="font-serif text-lg font-semibold text-gray-900 mb-4">
              Open To-Dos
              <span className="ml-2 text-base font-normal text-gray-400">({todos.length})</span>
            </h2>
            <div className="space-y-2">
              {todos.map(todo => (
                <div
                  key={todo.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div
                    className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${
                      todo.priority === 'high'
                        ? 'bg-red-500'
                        : todo.priority === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`}
                  />
                  <div className="flex-1 text-sm text-gray-800 font-serif">{todo.description}</div>
                  {todo.origin_module && (
                    <span className="flex-shrink-0 text-xs text-gray-400">from {todo.origin_module}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PANEL 9: FAN Club */}
        {associations.length > 0 && (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
            <h2 className="font-serif text-lg font-semibold text-gray-900 mb-4">
              FAN Club
              <span className="ml-2 text-base font-normal text-gray-400">({associations.length})</span>
            </h2>
            <div className="space-y-2">
              {associations.map(assoc => {
                if (!assoc.person) return null;
                return (
                  <div
                    key={assoc.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <Link
                      href={`/persons/${assoc.person.id}`}
                      className="text-sm font-medium text-gray-900 font-serif hover:text-blue-600 transition-colors"
                    >
                      {personName(assoc.person)}
                    </Link>
                    {assoc.association_type && (
                      <span className="text-xs text-gray-500">{assoc.association_type}</span>
                    )}
                    {assoc.notes && (
                      <span className="text-xs text-gray-400 truncate">{assoc.notes}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
