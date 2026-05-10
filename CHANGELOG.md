# Changelog

All notable changes to Project-G-Live are recorded here.
Format: TIMESTAMP | Session | Change

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
- src/app/api/research-log/[id]/abstract/route.ts -- POST AI abstraction (Chat Conversation Abstractor pattern)
- src/app/research-log/page.tsx -- session list
- src/app/research-log/new/page.tsx -- new session form with person picker
- src/app/research-log/[id]/page.tsx -- detail: inline edit per section, source tracking with yielded toggle, AI abstractor panel
- src/app/page.tsx -- Research Log status updated to COMPLETE
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
- src/app/api/document-analysis/route.ts -- GET list + POST create
- src/app/api/document-analysis/[id]/route.ts -- GET + PATCH + DELETE
- src/app/api/document-analysis/[id]/extract-facts/route.ts -- POST AI fact extraction
- src/app/api/document-analysis/[id]/facts/route.ts -- GET list + POST create
- src/app/api/document-analysis/[id]/facts/[factId]/route.ts -- PATCH + DELETE
- src/app/document-analysis/page.tsx -- list
- src/app/document-analysis/new/page.tsx -- new worksheet
- src/app/document-analysis/[id]/page.tsx -- detail with transcription + AI extraction + Three-Layer classification
- Module 5 (Document Analysis Worksheet): COMPLETE

---

## 2026-05-10 03:25 UTC -- Session: Phase 3 BUILD (Citation Builder)

- sql/001-create-tables.sql -- All 9 Supabase tables with RLS policies
- src/types/index.ts -- Entity interfaces (Source, Person, CaseStudy, CaseStudySource, etc.)
- src/app/citation-builder/page.tsx -- Source library with search and filter
- src/app/citation-builder/new/page.tsx -- 5-step structured source interview (11 categories)
- src/app/citation-builder/[id]/page.tsx -- Source detail with copy and edit
- src/app/api/citation-builder/route.ts -- GET list + POST create (GPS validated)
- src/app/api/citation-builder/[id]/route.ts -- GET + PATCH + DELETE
- Module 4 (Citation Builder): COMPLETE

---

## 2026-05-09 17:38 UTC -- Session: Phase 3 BUILD (Case Study Builder)

- sql/002-add-res-checklist.sql -- RES checklist table, gps_stage_reached constraint expanded to 6
- 13 API routes for case study (list, CRUD, sources, evidence, RES checklist, conflicts, proof)
- 6 stage components (StageNav + Stages 1-6)
- src/app/case-study/page.tsx, new/page.tsx, [id]/page.tsx
- Module 10 (Case Study Builder): COMPLETE
