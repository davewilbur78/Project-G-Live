## 2026-05-14 04:00 UTC -- Session: BUILD (v2.11.0 cleanup · migration 020 · person detail page)

### AGENT.md v2.11.0
- Version bump from v2.10.0 (missed at prior session close)
- Connie Knox locked into Static Rules: Greene/Greenspun line is active research, do not use as test data
- Research Notes vs Research Log distinction made permanent: Research Notes is a free-form living document per person; Research Log is the structured event-by-event audit trail

### Migration 020 — person_research_notes + research_status (LIVE)
- `persons.research_status`: text column, NOT NULL, default `'not_started'`, CHECK constraint enforcing 5 values: `not_started`, `in_progress`, `complete`, `needs_archive_visit`, `has_conflicts`
- `person_research_notes` table: one row per person, UUID PK, FK to persons(id) ON DELETE CASCADE, unique constraint on person_id, RLS enabled
- Index: `idx_person_research_notes_person_id`
- Run via Claude in Chrome Monaco editor API; both verification probes passed (1 row each)

### Person detail page — /persons/[id] (commit f28a7c3 + smoke test fixes)
- 9 panels: Header Anchor, AI Icebreaker, Research Notes, Timeline, Geographic Life Story (map), Family Connections, Sources, Open To-Dos, FAN Club
- AI icebreaker: generated on page load via GRA + research-assistant-v8; cacheable
- Research notes: auto-save with 1.5s debounce; PATCH to person_research_notes
- Research status badge: clickable dropdown, 5 states, optimistic update
- Map panel: Leaflet v1.9.4, geocoded address pins with migration path polyline; shows addresses where lat/lng already populated
- Smoke test (Claude Code): 7 column name mismatches found and fixed post-commit
  - `event_types.name` → `display_name`
  - `addresses.latitude/longitude` → `lat/lng`; `state` → `state_province`
  - `sources.title/short_footnote_form/information_type` → `label/ee_short_citation/info_type`
  - `todos.description` → `title`
  - `persons.birth_date_display/death_date_display` → `birth_date/death_date`
  - Route aliases DB names back to frontend-expected names in return payload
- Smoke test result: PASS — Chetney C Clark: 25 events, 100% sourced, 19 sources, family panel (parents + 4 spouses), all 9 panels load, no JS errors

---

## 2026-05-13 22:15 UTC -- Session: EXPLORE->BUILD (Research Notes panel complete)

Posture: EXPLORE -> BUILD. Design locked in EXPLORE; Claude Code executed the build.

### What was done

Migration 020 committed and run in Supabase:
- sql/020-person-research-notes.sql: person_research_notes table (id, person_id FK
  cascade delete, content text, created_at, updated_at). Unique index on person_id
  (one document per person). RLS enabled.
- ALTER TABLE persons ADD COLUMN research_status text NOT NULL DEFAULT 'not_started'
  CHECK (not_started | in_progress | complete | needs_archive_visit).
  has_conflicts explicitly excluded -- derived at query time from source_conflicts.

Design decisions locked this session:
- Markdown textarea + preview toggle (not Tiptap). Portable, no dependency, upgradeable.
- 4 manual research_status states only. has_conflicts is derived, never stored.
- AI scaffold optional on first open. "Start blank" or "Start with AI scaffold."
- Scaffold sections ARE the prompts -- headers with one-line observations under each.
- Icebreaker (Panel 2) and scaffold (Panel 3) share one API call. One call returns
  { icebreaker, scaffold } together. Cannot contradict each other.
- Research Notes are freeform. No GPS enforcement on content.
- Voice profile conversation not yet had. Scaffold language neutral for now.

Claude Code gaps found and fixed (four gaps between design and prior implementation):
1. has_conflicts removed from STATUS_CONFIG and STATUS_ORDER in page.tsx.
   Also corrected in sql/020-person-research-notes.sql for documentation accuracy.
2. Markdown preview toggle added to Research Notes panel header. Write/Preview tabs.
   renderMarkdown() inline function -- no library. Handles headers, bold/italic,
   bullets, paragraphs. Toggle appears only once notes are started.
3. Combined scaffold API route: src/app/api/persons/[id]/scaffold/route.ts.
   One AI call via callWithEngine('gra', ...) returns { icebreaker, scaffold } as JSON.
   Old /icebreaker route is dead code (not deleted -- flagged for cleanup pass).
4. First-open choice UI in Panel 3. Blank notes show "Start blank" / "Start with
   AI scaffold" instead of a textarea. Scaffold button populates textarea and
   auto-saves. "Start blank" opens clean empty textarea.

Smoke test: PASSED on Aaron Jacob Klein (commit ed2402e by Claude Code).
- Panel 2 icebreaker: specific, data-driven, pointed to WWI service angle.
- Panel 3 scaffold: consistent with icebreaker (same API call). Populated with
  real timeline observations under structured section headers.
- Write/Preview toggle working. Rendered markdown correct.
- Status dropdown shows exactly 4 options. has_conflicts gone.
- Auto-save confirmed ("Saved at" timestamp visible).

### Build phase

Phase 3 ACTIVE -- 12 of 16 original modules complete + Module 17 Phase 2 + person detail page.
Person detail page: all panels live, Research Notes complete, icebreaker + scaffold working.

### Open for next session

- Delete dead icebreaker route (cleanup).
- Voice profile conversation (required before Module 9).
- Connie Knox Ancestry playlist review (Dave will provide summary).
- FTM Bridge Phase 3 UI (/ftm-import page) or Vercel deployment -- next BUILD target.

---

## 2026-05-11 14:30 UTC -- Session: BUILD (Module 14 DNA Evidence Tracker)

Posture: BUILD. Module 14 built complete while user stepped away.
Also fixed dashboard bug: Module 12 (Correspondence Log) was showing NOT STARTED.

### What was done

Module 14 (DNA Evidence Tracker) -- COMPLETE.

SQL migration:
- sql/018-dna-tracker.sql: dna_matches table with platform check constraint
  (23andme | ancestry | ftdna | myheritage | gedmatch | other), status check constraint
  (identified | working_hypothesis | unresolved), shared_cm numeric(8,2),
  shared_segments integer, largest_segment_cm numeric(8,2), kit_number text,
  match_email text, person_id uuid FK to persons ON DELETE SET NULL,
  hypothesized_relationship text, ancestral_line text, documentary_evidence text,
  endogamy_context text, in_common_with text, notes text.
  5 indexes (status, platform, ancestral_line, person_id, shared_cm DESC).
  RLS enabled. Migration run via Claude in Chrome + Monaco setValue() method: SUCCESS.

API routes:
- src/app/api/dna-matches/route.ts: GET (list, filterable by status/platform/ancestral_line,
  ordered by shared_cm DESC), POST
- src/app/api/dna-matches/[id]/route.ts: GET, PATCH (partial update, allowed field list), DELETE

Pages:
- src/app/dna-tracker/page.tsx: list with GPS note banner, summary bar
  (total/identified/working hypothesis/unresolved), status filter tabs, platform badge,
  ancestral line + hypothesized relationship in row metadata, linked person name if identified
- src/app/dna-tracker/new/page.tsx: full 2-column form with GPS note, all fields,
  redirects to detail page on save
- src/app/dna-tracker/[id]/page.tsx: read mode + edit toggle + two-step delete,
  params handled via React use() hook (Next.js 15 pattern)

Dashboard fix:
- src/app/page.tsx: Module 12 status corrected from NOT STARTED to COMPLETE.
  Module 14 status set to COMPLETE. Build order list updated.

GPS compliance: GPS note enforced on every page (list, new, detail) --
"DNA evidence is corroborating indirect evidence -- never standalone proof."
Ashkenazi endogamy context field built in at the schema and UI level.
All pages include dashboard breadcrumb navigation.
No AI calls in v1 -- module is structured data entry, evidence linking, and retrieval.

### Build phase

Phase 3 ACTIVE -- 11 of 16 modules complete.

Modules complete: 2, 3, 4, 5, 6, 7, 10, 12, 14, 15, 16.
Modules remaining: 1, 8, 9 (voice profile required), 11, 13.

### Smoke tests still needed

Module 12 and Module 14 smoke tests: hand to Claude Code.
Protocol: git pull, restart dev server (pkill + rm -rf .next + npm run dev),
open /correspondence and /dna-tracker, create one entry each, verify list and detail pages.

---

## 2026-05-12 (dinner session) UTC -- Session: BUILD (Module 12 Correspondence Log)

Posture: BUILD. Module 12 built complete while user was at dinner.

### What was done

Module 12 (Correspondence Log) -- COMPLETE.

SQL migration:
- sql/017-correspondence.sql: correspondence table with recipient_type check constraint
  (repository | courthouse | archive | researcher | dna_match | other), outcome_status
  check constraint (pending | responded | no_response | closed), follow_up_needed boolean,
  FKs to repositories, persons, sources. RLS enabled. 3 indexes.
  Migration run in Supabase via Claude in Chrome + Monaco setValue(): SUCCESS.

API routes:
- src/app/api/correspondence/route.ts: GET (list, filterable by status + recipient_type), POST
- src/app/api/correspondence/[id]/route.ts: GET, PATCH (partial update, allowed field list), DELETE

Pages:
- src/app/correspondence/page.tsx: list with summary bar (total/pending/follow-up counts),
  status filter tabs, hover-highlight rows, empty state
- src/app/correspondence/new/page.tsx: sectioned form (Recipient / Inquiry / Response / Notes),
  response section optional at creation, follow-up flag checkbox
- src/app/correspondence/[id]/page.tsx: read mode + edit toggle + two-step delete,
  params handled via React use() hook (Next.js 15 pattern)

GPS compliance: module documents reasonably exhaustive search outreach (GPS element 1).
All pages include dashboard breadcrumb navigation.
No AI calls in v1 -- module is purely structured data entry and retrieval.

### Session notes

MCP connector went down twice (Docker restarts). Code was staged locally in container
during outage and pushed once connector recovered. Two-batch push strategy used to
avoid timeout on large payloads. Monaco setValue() + find(Run button) + ref click
for SQL execution.

### Build phase

Phase 3 ACTIVE -- 10 of 16 modules complete.

Modules complete: 2, 3, 4, 5, 6, 7, 10, 12, 15, 16.
Modules remaining: 1, 8, 9 (voice profile required), 11, 13, 14.

---

## 2026-05-12 00:10 UTC -- Session: BUILD (Supabase migrations + prompt library complete)

Posture: BUILD. Completed all outstanding open threads from SESSION-2026-05-11-2200-UTC.

### What was done

SQL migrations run in Supabase via Claude in Chrome + Monaco setValue() method:
- sql/015-assertions.sql: assertions + assertion_case_study_links + assertion_conflict_links
  tables, indexes, RLS policies. SUCCESS.
- sql/016-investigations.sql: investigations + investigation_messages + investigation_evidence
  + investigation_candidates + investigation_matrix_cells tables, indexes, RLS policies.
  SUCCESS.

Prompt library completed:
- prompts/research/research-assistant-v8.md -- fetched from Steve Little's repo
  via GitHub connector. 700-line comprehensive GPS research assistant. v8.0.
- prompts/writing/lingua-maven-v9.md -- fetched from Steve Little's repo via
  GitHub connector. AHD-style language advisor. v9.

ai.ts ENGINE_FILES updated:
- research_assistant: 'prompts/research/research-assistant-v8.md' -- UNCOMMENTED
- lingua_maven: 'prompts/writing/lingua-maven-v9.md' -- UNCOMMENTED
- research_assistant added to RESEARCH_ENGINES set (GRA composes as base layer)
- Total engines now live: 15

UPSTREAM-SYNC.md updated:
- research-assistant-v8 and lingua-maven-v9 moved from Still to Fetch to What We Have
- Still to Fetch section now reads: None.
- Update Log entry added for 2026-05-12 actions

AGENT.md updated to v2.8.1.

### Closed threads (from SESSION-2026-05-11-2200 open thread list)

- Thread 1 CLOSED: sql/015 and sql/016 run successfully in Supabase. Module 16 is
  now usable pending smoke test (local git pull + dev server).
- Thread 2 CLOSED: research-assistant-v8.md and lingua-maven-v9.md committed.
  ENGINE_FILES uncommented. Prompt library complete -- no files left to fetch.
- Thread 3 (smoke test): OPEN. Requires local git pull + dev server start.
  Not done this session -- no local access.

### Still open

- Smoke test Module 16 locally (git pull, start dev server, open /investigation)
- src/types/index.ts investigation types (deferred until type error surfaces)
- Voice profile discussion
- Platform name
- Steve collaboration (held)
- gps_stage_reached constraint bug (low priority)

---

## 2026-05-11 20:00 UTC -- Session: EXPLORE->BUILD (Steve Little Integration + Prompt Engine Library + Assertions Architecture)

EXPLORE session that transitioned to BUILD at 2026-05-11 18:45 UTC.

### EXPLORE work

Full 30,000-foot project review. Assessment covered:
- What is working well (architecture sound, schema solid, session memory holding)
- What has changed since the original plan (schema outpacing UI, Module 16 complexity)
- What is missing (assertions table, person/family management UI, prompt engine wiring)
- What is genuinely original and remarkable (Address-as-Evidence, GPS-as-architecture,
  flywheel vision, session memory architecture, prototype-first schema approach)

Full deep-dive of Steve Little's Open-Genealogy GitHub repo and Vibe Genealogy Substack.
Key findings:
- Steve is AI Program Director at the National Genealogical Society. Co-hosts
  Family History AI Show. 2000+ Substack subscribers. Background in computational
  linguistics and NLP.
- Repo contains 120+ files / 16,500+ lines: research prompts (v6-v8.5), transcription
  tools (general + Jewish-specialized), image analysis (9-layer forensic), Hebrew
  headstone analysis (10-phase with gematria), writing tools (fact extractor/narrator,
  narrative assistant, linguistic profiler, conversation abstractor, etc.), GRA skill,
  benchmark framework, and a 100KB PRD for GPS-grade AI record analysis.
- The PRD (January 2026, co-authored with Claude Opus 4.5) describes assertion
  atomization as the core architectural move. Steve's prompts are the AI engine layer;
  Project-G-Live is the application and persistence layer; the assertions table is
  where they meet.
- Steve's plan to link his workflow to a MySQL database (documented in Vibe Genealogy
  blog) is the same architectural vision as Project-G-Live.

Integration architecture decided: near-total integration approved. License: CC BY-NC-SA 4.0.
Project-G-Live is personal and non-commercial -- use is fully within license terms.

Exclusions (with reasoning):
- Photo restoration prompts: Claude should be evaluated directly first. Dave has
  achieved strong restoration results using Claude + good prompts. Do not default
  to a third-party API without testing.
- News hound, event materials synthesizer, quick editor/cleanup: too generic,
  not genealogically specific, or redundant with other engines.
- GPT configs, media folder: platform-specific or educational only.

Steve collaboration: held, not closed. Dave has interfaced with Steve online. Not
ready to approach formally yet. Revisit when the platform is further along.

Voice profile discussion: identified as important, scheduled for a future session.
The linguistic profiler + narrative assistant combo is what powers the Layer 2
narrative flywheel and researcher voice matching across Module 9 output.

### BUILD work

All committed to main. No wip/ branch.

- prompts/README.md -- engine library overview, module-engine mapping, attribution
- prompts/research/gra-v8.5.2c.md -- GPS enforcement base layer
- prompts/research/research-agent-assignment-v2.1.md -- Research Plan Builder engine
- prompts/transcription/ocr-htr-v08.md -- general diplomatic transcription
- prompts/transcription/jewish-transcription-v2.md -- Jewish document transcription
- prompts/image-analysis/deep-look-v2.md -- 9-layer forensic image analysis
- prompts/image-analysis/hebrew-headstone-helper-v9.md -- 10-phase headstone analysis
- prompts/writing/fact-extractor-v4.md -- LABEL: Value extraction
- prompts/writing/fact-narrator-v4.md -- assertions to narrative prose
- prompts/writing/narrative-assistant-v3.md -- GPS-informed narrative (3 modes)
- prompts/writing/linguistic-profiler-v3.md -- writer voice fingerprinting
- prompts/writing/conversation-abstractor-v2.md -- session/interview summarization
- prompts/writing/document-distiller-v2.md -- document summarization
- prompts/writing/image-citation-builder-v2.md -- image provenance citation
- docs/architecture/assertions-table.md -- full assertions schema spec

Still to fetch from upstream and commit:
- research-assistant-v8.md (700-line full version)
- lingua-maven-v9.md

### Key architectural decisions made this session

Assertions table (migration 015):
- Three tables: assertions, assertion_case_study_links, assertion_conflict_links
- Forward-only: no retrofitting existing data
- Evidence type stored as default; overridable per case study via join table
- Extraction method + engine version fields track AI vs. human provenance
- Sits between sources and conclusions; enables cross-module fact queries,
  Address-as-Search-Key engine, GPS-compliant proof arguments, conflict detection

Engine registry:
- callWithEngine(engineName, content, context) in src/lib/ai.ts
- No inline prompt approximations in API routes
- GRA is base layer -- composed into all research-facing routes
- All prompts load from /prompts/ directory

Revised build sequence:
1. DONE: /prompts/ directory + assertions spec
2. NEXT: callWithEngine() engine registry in src/lib/ai.ts
3. Replace inline approximations (Research Plan Builder gets real research-agent-assignment-v2.1)
4. sql/015-assertions.sql + Supabase run via Claude in Chrome
5. Module 16 (now builds on assertions foundation)
6. Module 5 upgrade (full input pipeline)
7. Module 9 Research Report Writer

- sessions/SESSION-2026-05-11-2000-UTC.md -- session snapshot
- sessions/SESSIONS-INDEX.md -- updated
- AGENT.md v2.7.7 (next)
