# Changelog

All notable changes to Project-G-Live are recorded here.
Format: TIMESTAMP | Session | Change

---

## 2026-05-10 23:00 UTC -- Session: EXPLORE (Module 7 design + Address-as-Evidence)

EXPLORE session. No application code written. Design artifacts committed.

- docs/modules/07-timeline-builder.md -- full Module 7 design doc
  addresses table as first-class entity; timeline_events FK to addresses;
  complete schema for both tables; UI page plan; AI feature spec;
  wiring notes to Modules 5, 8, 16; Address-as-Evidence rationale documented.

- sql/008-add-timeline-addresses.sql -- addresses + timeline_events tables + RLS + indexes
  addresses: person_id, source_id, address_role (8 roles), raw_text, normalized fields,
  lat/lng, address_date, date_qualifier, date_display.
  timeline_events: person_id, event_type (16 types), date fields with qualifier,
  place fields, address_id FK, residence duration fields, source_id, evidence_type.

- AGENT.md v2.7.2 -- major additions:
  * Address-as-Evidence named as spine-level platform principle (TIMESTAMP: 2026-05-10 22:45 UTC)
  * Address-as-Search-Key named as corollary principle (TIMESTAMP: 2026-05-10 22:45 UTC)
  * Brick Wall Reframe documented (TIMESTAMP: 2026-05-10 22:45 UTC)
  * Conversational Fact Extraction Protocol established (TIMESTAMP: 2026-05-10 22:45 UTC)
  * Research-to-Family Flywheel macro vision named (TIMESTAMP: 2026-05-10 22:45 UTC)
  * Module 7 status updated to BUILD READY
  * Module 8 redesign note added (spatial FAN map, not relationship diagram)
  * Platform name pending -- note to ask user periodically
  * New backlog items: address geocoding, address-as-search-key query,
    FAN Club Mapper redesign note

- sessions/SESSION-2026-05-10-2300-UTC.md -- session snapshot with Julia/Jenny Klein
  fact extraction (first live use of conversational fact extraction protocol)

- sessions/SESSIONS-INDEX.md -- updated

---

## 2026-05-10 20:30 UTC -- Session: FIX->BUILD (Supabase alias fix + Module 6 Source Conflict Resolver)

FIX (2026-05-10 20:20 UTC):
- src/lib/supabase.ts -- added `createServerSupabaseClient` alias for `createServerClient`
  Root cause: all API routes import `createServerSupabaseClient` but the function was
  exported as `createServerClient`. One alias export fixes all routes.
  Bugs resolved: Research To-Do Tracker load failure + Research Plan Builder 500 on submit

BUILD -- Module 6 (Source Conflict Resolver) (2026-05-10 20:30 UTC):
- sql/007-add-source-conflicts.sql -- source_conflicts table + RLS + indexes
  Standalone table referencing global sources directly (NOT case-study-scoped conflicts).
  Fact types: birth_date, birth_place, name, age, death_date, death_place,
  residence, immigration, marriage, occupation, other.
  Resolution basis: source_quality, preponderance, corroboration, inconclusive.
- src/types/index.ts -- added SourceConflict, SourceConflictStatus, FactInDispute,
  ResolutionBasis interfaces
- src/app/api/conflict-resolver/route.ts -- GET list (open first, with person+sources joined)
  + POST create
- src/app/api/conflict-resolver/[id]/route.ts -- GET (with full source GPS data joined)
  + PATCH (partial update) + DELETE
- src/app/api/conflict-resolver/[id]/analyze/route.ts -- POST: GPS-aware AI analysis.
  Builds prompt with both sources' GPS classifications. Returns analysis_text, resolution,
  resolution_basis. Writes directly to record and advances status from open to in_progress.
- src/app/conflict-resolver/page.tsx -- list with Active/Resolved/All filter tabs,
  status badges, fact type badges, Source A vs Source B display, person link
- src/app/conflict-resolver/new/page.tsx -- form with source picker for A and B,
  live GPS chip preview for each selected source, auto-title generation,
  fact type selector, description, person picker
- src/app/conflict-resolver/[id]/page.tsx -- detail with side-by-side source comparison
  (GPS classification chips, short citation, what each source says), analysis textarea,
  AI Analyze button, resolution section (text + basis selector), status control, notes
- src/app/page.tsx -- Module 6 updated to COMPLETE
- AGENT.md bumped to v2.7.0

---

## 2026-05-10 17:00 UTC -- Session: Phase 3 BUILD (Research Plan Builder)

- sql/006-add-research-plans.sql -- research_plans + research_plan_items tables + RLS
  Also: ALTER TABLE research_sessions ADD COLUMN research_plan_id (deferred FK from Module 3)
- src/types/index.ts -- added ResearchPlan, ResearchPlanItem, ResearchPlanStatus,
  ResearchPlanItemStatus, ResearchPlanItemPriority; updated ResearchSession with research_plan_id
- src/app/api/research-plans/route.ts -- GET list (with person + item counts) + POST create
- src/app/api/research-plans/[id]/route.ts -- GET + PATCH + DELETE
- src/app/api/research-plans/[id]/generate/route.ts -- POST: AI strategy generation
  (Research Agent Assignment v2.1 pattern; returns strategy_summary + 8-12 prioritized items)
- src/app/api/research-plans/[id]/items/route.ts -- GET list + POST create (manual items)
- src/app/api/research-plans/[id]/items/[itemId]/route.ts -- PATCH + DELETE
- src/app/research-plans/page.tsx -- list with person, status, item counts, High-pending callout
- src/app/research-plans/new/page.tsx -- new plan form: person picker, auto-fill title,
  research question, AI context fields (time period, geography, community)
- src/app/research-plans/[id]/page.tsx -- detail: inline plan edit, status selector,
  AI strategy generation, items sorted by priority, inline status cycling,
  inline item edit, add item form, delete plan
- src/app/page.tsx -- Module 2 updated to COMPLETE, href fixed to /research-plans
- Dashboard breadcrumb navigation added by design to all three new pages
- Module 2 (Research Plan Builder): COMPLETE
- AGENT.md bumped to v2.6.0

---

## 2026-05-09 16:15 UTC -- Session: Phase 3 BUILD (Research To-Do Tracker)

- sql/005-add-todos.sql -- todos table + RLS
- src/types/index.ts -- added Todo, TodoStatus, TodoPriority interfaces
- src/app/api/todos/route.ts -- GET list (with status/person/priority filters, priority-weighted sort) + POST create
- src/app/api/todos/[id]/route.ts -- GET + PATCH (auto-stamps completed_at) + DELETE
- src/app/todos/page.tsx -- list with status filter tabs, inline status cycling, priority badges, stats bar
- src/app/todos/new/page.tsx -- new item form (priority picker, person, source type hint, due date)
- src/app/todos/[id]/page.tsx -- detail with inline edit and delete
- src/app/page.tsx -- Research To-Do Tracker updated to COMPLETE
- Module 15 (Research To-Do Tracker): COMPLETE
- AGENT.md bumped to v2.5.0

---

## 2026-05-09 15:50 UTC -- Session: Phase 3 BUILD (Research Log)

- sql/004-add-research-log.sql -- research_sessions + session_sources tables + RLS
- src/types/index.ts -- added ResearchSession, ResearchSessionStatus, SessionSource interfaces
- src/app/api/persons/route.ts -- shared GET list + POST create (new shared endpoint)
- src/app/api/research-log/route.ts -- GET list + POST create
- src/app/api/research-log/[id]/route.ts -- GET + PATCH + DELETE
- src/app/api/research-log/[id]/session-sources/route.ts -- GET list + POST
- src/app/api/research-log/[id]/session-sources/[sourceId]/route.ts -- PATCH + DELETE
- src/app/api/research-log/[id]/abstract/route.ts -- POST AI abstraction
- src/app/research-log/page.tsx, new/page.tsx, [id]/page.tsx
- Module 3 (Research Log): COMPLETE
- docs/architecture.md -- research_sessions and session_sources column-level specs added
- AGENT.md bumped to v2.4.0

---

## 2026-05-10 06:00 UTC -- Session: Phase 3 FIX->BUILD (Bug fixes + Document Analysis Worksheet)

- src/app/globals.css -- added --color-* CSS variable aliases (root cause of GPS radio + Continue button bugs)
- src/app/citation-builder/new/page.tsx -- replaced bg-[var(--color-gold)]/5 with --color-gold-subtle
- src/app/page.tsx -- COMPLETE modules converted to Link elements (navigation wired)
- sql/003-add-documents.sql -- documents + document_facts + RLS
- src/types/index.ts -- added Document, DocumentFact, TranscriptionStatus interfaces
- src/app/api/document-analysis/route.ts, [id]/route.ts, [id]/extract-facts/route.ts,
  [id]/facts/route.ts, [id]/facts/[factId]/route.ts
- src/app/document-analysis/page.tsx, new/page.tsx, [id]/page.tsx
- Module 5 (Document Analysis Worksheet): COMPLETE

---

## 2026-05-10 03:25 UTC -- Session: Phase 3 BUILD (Citation Builder)

- sql/001-create-tables.sql -- All 9 Supabase tables with RLS policies
- src/types/index.ts -- Entity interfaces
- src/app/citation-builder/page.tsx, new/page.tsx, [id]/page.tsx
- src/app/api/citation-builder/route.ts, [id]/route.ts
- Module 4 (Citation Builder): COMPLETE

---

## 2026-05-09 17:38 UTC -- Session: Phase 3 BUILD (Case Study Builder)

- sql/002-add-res-checklist.sql -- RES checklist table
- 13 API routes for case study
- 6 stage components
- src/app/case-study/page.tsx, new/page.tsx, [id]/page.tsx
- Module 10 (Case Study Builder): COMPLETE
