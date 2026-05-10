Project-G-Live AGENT.md
Version: 2.7.2
Last updated: 2026-05-10 23:00 UTC
Last updated by: Claude

# What This Is

Single source of truth for Project-G-Live. One file. One authority.
All operating rules and project context live here. No other file overrides this one.

Claude has a direct GitHub connector. Use it for all repo reads and writes.
No workarounds, no raw URLs, no base64 decoding required.

At session start: read this file, confirm version and date in natural language,
fetch the most recent session snapshot from /sessions/ to orient, then ask for posture.
Do not read additional files unless the session's work specifically requires them.

---

# Session Posture System

Every session declares a posture before work begins. Posture is declared explicitly.
Transitions are permitted at any time with a declaration and TIMESTAMP.

BUILD -- Moving the project forward. New code, new files, new prototypes, committed artifacts.

FIX -- Something is wrong. Stay within the problem boundary. No new features.
Diagnose and fix only. Do not touch anything outside the problem scope.

EXPLORE -- Thinking, designing, deciding. No build output.
Specs, design docs, and AGENT.md updates are permitted.
Use this when direction is uncertain before building, or when working through a new idea.

Posture transition format:
  POSTURE TRANSITION -- TIMESTAMP: YYYY-MM-DD HH:MM UTC
  FROM: [posture] TO: [posture] REASON: [one sentence]

When transitioning OUT of BUILD, commit all work before the transition is declared.

Session direction is never inferred from project state. Always ask. Always wait.

---

# Signal Vocabulary

These phrases are system signals. Execute the protocol immediately -- before any other response.

EXIT SIGNALS
"i have to go" / "going to bed" / "leaving" / "stepping away" / "brb" / "gotta run"
  1. TIMESTAMP the event
  2. Name exactly what was in motion
  3. Commit all uncommitted work to wip/ branch
  4. Write session snapshot to /sessions/
  5. Generate restoration prompt
  6. Confirm: "Session preserved. [filename] committed. Restoration prompt ready."

DISTRESS SIGNALS
"something is wrong" / "you're going in circles" / "context window" /
"you're losing it" / "start over" / "something is off"
  1. TIMESTAMP the event
  2. STOP all forward work. Name exactly what was in motion.
  3. Commit in-progress work to wip/ branch
  4. Write session snapshot
  5. Generate restoration prompt
  6. Report context status honestly
  7. Ask what feels wrong. Do not resume until user confirms direction.

HEALTH CHECK SIGNALS
"how are we doing" / "context check" / "where are we" / "status"
  1. TIMESTAMP the check
  2. Report: context load estimate, what was done this session with TIMESTAMPs,
     anything that feels degraded, recommendation to continue or checkpoint

TRANSCRIPT SIGNALS
"save this conversation" / "preserve this" / "pull the transcript" / "this is important, log it"
  1. Write a full session log -- not a summary, a complete reconstruction
     with full decision trail, all reasoning, all rejected options, all open threads
  2. Commit to /sessions/ immediately
  3. Confirm with filename and TIMESTAMP

WIP SIGNALS
"wip is messy" / "clean up the branch" / "merge wip"
  1. TIMESTAMP the event
  2. Review what is currently in wip/
  3. Propose a merge plan. Wait for confirmation before merging anything.
  4. After confirmed merge: note in CHANGELOG, reset wip/

---

# Session Memory Architecture

TIMESTAMP format: YYYY-MM-DD HH:MM UTC
Every artifact, decision, commit, signal event, and snapshot carries a full timestamp.
A fact without a TIMESTAMP is a rumor.

## /sessions/ Folder

Every session produces at least one snapshot committed to /sessions/.
File naming: SESSION-YYYY-MM-DD-HHMM-UTC.md
Snapshots are never deleted, never overwritten. The full archive is a first-class artifact.

SESSIONS-INDEX.md: one line per session.
Format: TIMESTAMP | Posture | AI | one-sentence summary.
Update every time a new snapshot is committed.

## Session Snapshot Format

  --- SESSION SNAPSHOT ---
  TIMESTAMP: YYYY-MM-DD HH:MM UTC
  Captured by: [AI name]
  Posture at capture: [BUILD / FIX / EXPLORE]
  Trigger: [context checkpoint / exit signal / distress signal / session close]

  WHAT THIS SESSION WAS DOING
  [2-4 sentences. What this specific session worked on from the moment it opened.]

  STATE AT CAPTURE -- TIMESTAMP: YYYY-MM-DD HH:MM UTC
  [What is committed. What exists only in context. What is half-built.
  Reference wip/ branch commit if applicable.]

  DECISIONS MADE THIS SESSION
  TIMESTAMP: YYYY-MM-DD HH:MM UTC -- [decision and reason]
  TIMESTAMP: YYYY-MM-DD HH:MM UTC -- [rejected option and why]

  OPEN THREADS -- TIMESTAMP: YYYY-MM-DD HH:MM UTC
  [Questions mid-air. Unresolved tensions. Things about to be decided. Be specific.]

  PARTIALLY BUILT WORK
  [If anything exists only in context and cannot be committed to wip/:
  reconstruct it fully and completely here. Not a summary -- the actual work.
  If it can be committed to wip/, do that and reference the commit here.]

  DO NOT DO THIS
  [Wrong turns already taken. Things that look tempting but were ruled out.
  Questions already closed that must not be reopened.]

  NEXT IMMEDIATE ACTION
  TIMESTAMP: YYYY-MM-DD HH:MM UTC
  [One thing. Specific. Actionable.]
  --- END SNAPSHOT ---

## /wip/ Branch

Any partially built code that exists only in the context window must be
committed to wip/ before session close or any checkpoint -- even if broken,
even if incomplete.

Broken code in a branch is recoverable.
A description of broken code is not.

Commit message format: wip: [what it is] -- TIMESTAMP: YYYY-MM-DD HH:MM UTC

When complete, user triggers merge via the WIP Signal. After confirmed merge:
note in CHANGELOG, reset wip/. The branch is always a working scratch space, never permanent.

## Context Window Pulse

At approximately 60% context consumption:
Write a session snapshot, commit it, continue if healthy. Note checkpoint in next response.

At approximately 80% context consumption:
Write another snapshot. Commit everything including wip/. Present status to user.
Ask: "Context is at approximately 80%. Continue or checkpoint and close?"

If critically full: execute distress protocol immediately without waiting for a signal.

AI self-reporting of context fill percentage is unreliable. Err toward early checkpoints.
The user's health check signals are more reliable than AI self-assessment.

## Restoration Prompt Format

  --- RESTORATION PROMPT ---
  TIMESTAMP: YYYY-MM-DD HH:MM UTC
  Generated by: [AI name]
  Restoring from: [/sessions/SESSION-filename.md]

  PROJECT STATE
  Version: [AGENT.md version] | Build phase: [current phase]
  Last clean commit: TIMESTAMP -- [commit message]
  WIP commit: TIMESTAMP -- [description] (or "none")

  WHAT THIS SESSION WAS DOING
  [Precise. Specific enough to re-enter without re-reading everything.]

  DECISION TRAIL
  TIMESTAMP: [time] -- [decision and reason]
  TIMESTAMP: [time] -- [rejected option and why]

  OPEN THREADS
  [Every question mid-air at capture. Named specifically, not summarized.]

  PARTIALLY BUILT WORK
  [wip/ branch commit reference, or full reconstruction if not committed.]

  DO NOT DO THIS
  [What was tried and ruled out. Closed questions not to reopen.]

  NEXT IMMEDIATE ACTION
  [One thing. Specific.]

  CONFIRMATION REQUIRED
  Does this match your understanding of where we were?
  Do not take any action until the user confirms.
  --- END RESTORATION PROMPT ---

---

# Session Close Protocol

Mandatory at the end of every session. No exceptions.

1. Declare session close with TIMESTAMP
2. Commit all work products to GitHub using the connector
3. Commit wip/ branch if any partially built work exists
4. Write final session snapshot to /sessions/
5. Update SESSIONS-INDEX.md with this session's entry
6. Update AGENT.md version number and last updated timestamp
7. Write CHANGELOG.md entry for this session
8. Commit AGENT.md, CHANGELOG.md, and session files

---

# Versioning

Semantic versioning: MAJOR.MINOR.PATCH
- PATCH: small fixes, doc updates within a session
- MINOR: completed prototype, significant new feature, meaningful operating model change
- MAJOR: named product launch

All timestamps: YYYY-MM-DD HH:MM UTC. Time to the minute required. No date-only stamps.

Current version: 2.7.2

---

# Foundational Research Principles

These principles are spine-level. They inform every module, every AI prompt,
and every design decision. They are not feature descriptions.

## Address-as-Evidence

TIMESTAMP established: 2026-05-10 22:45 UTC

Every address in every record is a first-class piece of evidence, not a
descriptive label attached to a person's profile. Ancestry.com and most
genealogy tools treat addresses as metadata about a person (where they lived).
This platform treats addresses as evidence artifacts from a source (what this
record says about where this person was at this moment).

Those are completely different things. The first produces a profile field.
The second produces a research engine.

Practical consequence: every record attached to any person should produce at
least one address record in the addresses table. The addresses table is a
first-class research surface, queryable across all persons and all record types.

## Address-as-Search-Key

TIMESTAMP established: 2026-05-10 22:45 UTC

An address in any record is a search key independent of the person being
researched. Searching a known address across record types and time ranges
surfaces people not being searched for -- neighbors, relatives, associates --
and solves cases that name-search cannot reach.

Name search has a ceiling: you can only find what you already know to look for.
Address search has no such ceiling.

Proof of concept documented in session SESSION-2026-05-10-2300-UTC.md:
A known Coney Island address belonging to Sam Klein was searched on
newspapers.com and surfaced a 1937 death notice for his sister Julia Klein,
previously unfindable by name. That notice named two previously unknown sisters
with addresses, leading to living cousins who had spent decades searching
for the New York Kleins. All from searching an address that belonged to
someone else.

## The Brick Wall Reframe

TIMESTAMP established: 2026-05-10 22:45 UTC

Most brick walls in genealogical research are not walls -- they are the edge
of the current search strategy. The records often exist. The data is frequently
there. What changes the outcome is not more searching by name, but a different
search key entirely: an address, a witness, a neighbor, a street.

This principle should surface in the Research Plan Builder when a stalled
investigation is detected, and in the Research Investigation workspace (Module 16)
as a framing prompt for open-ended research problems.

## Conversational Fact Extraction Protocol

TIMESTAMP established: 2026-05-10 22:45 UTC

When the researcher narrates -- tells a story, recounts a find, describes a
research path -- that narrative contains structured genealogical data embedded
in context and interpretation. Both are valuable. Neither should be lost.

Protocol:
- When the researcher tells a story containing genealogical data, Claude
  extracts the discrete facts and presents them as a structured list.
- The researcher confirms, corrects, or discards each item.
- Confirmed facts are entered into the appropriate module.
- The narrative itself stays in the session snapshot -- not the database.
  It belongs to the research journal, not the structured data.

The Steve Little Chat Conversation Abstractor engine is designed for this.
Wire it into Module 16 (Research Investigation) as a first-class feature.

## The Macro Vision: Research-to-Family Flywheel

TIMESTAMP noted: 2026-05-10 22:45 UTC
Status: named, not yet fully articulated. Will be developed into a
dedicated document when ready.

The platform is the engine room of a larger connected vision:

  Layer 1 -- Research platform (this software)
  GPS-compliant working layer. Structured data. Case studies. Evidence chains.
  Most of the family will never see this layer directly.

  Layer 2 -- Narrative layer
  Stories told in the researcher's voice, structured by AI, turned into
  case studies, research reports, and family narratives. The AI learns
  the researcher's voice over time. Output of Layer 1 becomes raw material
  for Layer 2.

  Layer 3 -- Family-facing layer
  A website or presentation layer built from Layer 2 output. Rich with
  stories, photos, maps, timelines. Designed to engage cousins, aunts,
  uncles -- people who have photos and documents and oral histories that
  feed back into Layer 1.

  The flywheel: research produces stories, stories produce engagement,
  engagement produces new documents and oral histories, those feed back
  into research. The whole thing compounds.

Architectural implication: design clean output interfaces on every module
now. The data model built for the research platform is the same data model
that generates family website pages. If the data is clean and well-structured,
the family website layer is a rendering problem later, not a data problem.

---

# Project: Personal Genealogy Operations Platform

## What This Is

A personal, private web application for serious genealogical research and
professional development toward BCG certification. Built for one user only.
Never distributed or sold. A working and documentation layer on top of
Ancestry.com and FamilyTreeMaker -- not a replacement for either.

Everything in this system follows the Genealogical Proof Standard (GPS),
translated into plain language.

---

## The Case Study Builder Prototype -- What It Actually Is

IMPORTANT: Read this before assuming anything about build order or schema work.

The Case Study Builder v2 prototype (prototypes/case_study_builder_v2.html)
is NOT a wireframe. It is a fully functional, production-quality HTML
application with real Singer/Springer research data throughout.

What is built and proven in the prototype:
- Complete 5-stage GPS workflow, all stages implemented and navigable
- 17 real sources with full EE citations, short footnote forms, and
  Three-Layer analysis for every source (12 Green / 2 Yellow / 3 Red)
- 7 evidence chain links with weight color-coding and footnote references
- 2 conflicts with full researcher analysis and live textarea validation
- Complete proof argument with inline superscript footnotes and rendered
  footnote section
- Full CSS design system (Playfair Display, Source Serif 4, JetBrains Mono)

The JavaScript data structures in the prototype (SOURCES, EVIDENCE,
CONFLICTS, PROOF_PARAGRAPHS, FOOTNOTE_DEFS) ARE the schema design.
Every field in the Supabase tables was derived from them. The prototype
did not just prove the UX -- it answered the schema questions.

The prototype's design system is the canonical visual reference for
all Phase 3 module builds. Colors, typography, and component patterns
must match it.

NOTE: The production build uses 6 stages, not 5. A Reasonably Exhaustive Search
Checklist stage was added between Evidence Chain and Conflict Analysis as required
by GPS. The prototype has 5 stages; the production app has 6.

---

## The Modules: Status and Build Order

16 modules. Design docs in /docs/modules/. Build order reflects dependencies.
Do not start a module before its prerequisites are complete.

Status: NOT STARTED / IN DESIGN / PROTOTYPE / BUILD READY / COMPLETE

BUILD STRATEGY: Build Case Study Builder as a real application as fast
as possible, then build outward. Citation Builder is built first because
Case Study Builder's Stage 2 pulls from it -- but do not wait for Citation
Builder to be 100% complete before starting Case Study Builder. Build
them in close succession and wire them together when both exist.
GEDCOM Bridge comes last -- it is onboarding convenience, not core workflow.

PHASE 3 BUILD ORDER:

1.  Citation Builder (Module 4) -- COMPLETE
    Committed: 2026-05-10 03:25 UTC.

2.  Case Study Builder (Module 10) -- COMPLETE
    Committed: 2026-05-09 17:38 UTC. 6-stage GPS workflow.

3.  Document Analysis Worksheet (Module 5) -- COMPLETE
    Committed: 2026-05-10 06:00 UTC.

4.  Research Log (Module 3) -- COMPLETE
    Committed: 2026-05-09 15:42 UTC.

5.  Research To-Do Tracker (Module 15) -- COMPLETE
    Committed: 2026-05-09 16:10 UTC.
    origin_module field supports future automated aggregation from other modules.

6.  Research Plan Builder (Module 2) -- COMPLETE
    Committed: 2026-05-10 17:00 UTC.
    research_plans + research_plan_items tables. AI strategy generation
    (Research Agent Assignment v2.1 pattern). research_plan_id FK added to
    research_sessions. Dashboard breadcrumb navigation on all three pages.
    SQL migration: sql/006-add-research-plans.sql.

7.  Source Conflict Resolver (Module 6) -- COMPLETE
    Committed: 2026-05-10 20:30 UTC.
    source_conflicts table (standalone -- NOT the case-study-scoped conflicts table).
    References global sources directly. GPS-aware AI analysis via /analyze route.
    Fact types: birth_date, birth_place, name, age, death_date, death_place,
    residence, immigration, marriage, occupation, other.
    SQL migration: sql/007-add-source-conflicts.sql.
    Pages: list, new, detail (with side-by-side source comparison + AI Analyze).

8.  Timeline Builder (Module 7) -- BUILD READY
    TIMESTAMP: 2026-05-10 22:45 UTC
    Design doc committed: docs/modules/07-timeline-builder.md
    Schema designed: addresses (first-class table) + timeline_events
    SQL migration: sql/008-add-timeline-addresses.sql
    Address-as-Evidence is the spine-level principle driving this module.
    Addresses are a first-class research surface, not profile metadata.
    The addresses table is queryable across all persons and all record types.
    Wires to: Module 5 (fact extraction), Module 8 (spatial FAN mapping),
    Module 16 (narrative fact extraction).
    USER FOCUS NOTE (TIMESTAMP: 2026-05-10 20:22 UTC):
    Address and residence data is a first-class fact type throughout.
    Do not treat addresses as an afterthought in any module.

9.  Research Investigation (Module 16) -- IN DESIGN
    Design doc committed: 2026-05-10 19:30 UTC.
    Emerged from EXPLORE session -- Barnholtz disambiguation use case.
    Persistent AI-collaborative workspace for open-ended research problems.
    Sits upstream of Case Study Builder. Build order TBD -- strong candidate
    for early build given utility across the full workflow.
    Requires: Citation Builder (04), persons API, 5 new Supabase tables.
    See /docs/modules/16-research-investigation.md.

10. Research Report Writer (Module 9) -- NOT STARTED
    Requires: most modules above.

11. GEDCOM Bridge (Module 1) -- NOT STARTED
    Onboarding layer. Build after core app is working.

12. Family Group Sheet Builder (Module 11) -- NOT STARTED

13. FAN Club Mapper (Module 8) -- NOT STARTED
    NOTE: Should eventually be redesigned as a spatial FAN map using the
    addresses table as its primary data source. See Address-as-Evidence
    principle and Module 7 design doc.

14. DNA Evidence Tracker (Module 14) -- NOT STARTED

15. Correspondence Log (Module 12) -- NOT STARTED.

16. File Naming System (Module 13) -- NOT STARTED.

---

## Prompt Engines (Third-Party)

Steve Little's Open-Genealogy project (github.com/DigitalArchivst/Open-Genealogy)
License: CC BY-NC-SA 4.0. Personal non-commercial research only.

- OCR-HTR Transcription Tool v08 -- document transcription on upload
- Fact Extractor v4 -- extracts discrete factual claims from documents
- Fact Narrator v4 -- turns extracted facts into narrative prose
- GEDCOM Analysis assistant -- powers the GEDCOM Bridge parsing layer
- Image Citation Builder v2 -- citation generation for uploaded images
- Chat Conversation Abstractor v2 -- Research Log session summaries;
  also powers conversational fact extraction in Module 16
- Research Agent Assignment v2.1 -- Research Plan Builder logic
- GRA v8.5c -- GPS enforcement layer across all modules

---

## Tech Stack

- Frontend: Next.js 15 with React 19, App Router, Tailwind CSS
- Backend: Next.js API route handlers (routes live at src/app/api/, not src/api/)
- Database: Supabase (PostgreSQL)
- AI: Anthropic Claude API (claude-sonnet-4-6 -- update when newer model available)
- File storage: Supabase storage bucket
- PowerPoint export: python-pptx via lightweight Python endpoint
- Deployment: Vercel

---

## Build Path

Phase 1: Documentation and architecture -- COMPLETE
Phase 2: Prototype artifacts to test interview logic -- COMPLETE
Phase 3: Full web app built module by module -- ACTIVE
  7 of 16 modules complete:
  Module 4 (Citation Builder), Module 10 (Case Study Builder),
  Module 5 (Document Analysis Worksheet), Module 3 (Research Log),
  Module 15 (Research To-Do Tracker), Module 2 (Research Plan Builder),
  Module 6 (Source Conflict Resolver)
  Module 7 (Timeline Builder) -- BUILD READY
Phase 4: GEDCOM Bridge built as onboarding layer
Phase 5: Case Study Builder with PowerPoint export as flagship

---

## Coding Standards

- Never fabricate genealogical data, citations, sources, people, dates, or places
- GPS terminology strictly enforced throughout UI and all generated text
- Sources: Original, Derivative, or Authored only -- never "primary source"
- Evidence: Direct, Indirect, or Negative only -- never "primary evidence"
- Primary and Secondary apply only to Information (informant's knowledge)
- Every fact must have a source citation attached
- Components are modular -- self-contained, shared data layers
- Supabase is the single source of truth for all person and source data
- All citations follow Evidence Explained (EE) format
- Every source carries both a full citation and a short footnote form
- Every factual claim in a proof argument carries an inline footnote. No naked claims.
- The prototype design system is the visual standard. Match it.
- API routes live at src/app/api/ -- never src/api/ (wrong for Next.js App Router)
- All new module pages include a back-to-dashboard breadcrumb link
- Next.js 15 / React 19: params in [id] pages are a Promise. Always unwrap with use(params).
  Pattern: import { use } from 'react'; const { id } = use(params)
  Never access params.id directly -- it generates warnings and will break in future Next.js versions.

---

## Platform Output Types

RESEARCHER / PROFESSIONAL OUTPUT
GPS-compliant language, EE citations, full footnotes, Three-Layer analysis visible.
For BCG submissions, peer review, and professional correspondence.

CLIENT OUTPUT
Plain English narrative. Methodology invisible. No GPS or EE terminology.
Warm and readable. For family members and paying clients.

Both outputs are generated from the same underlying data.

---

## Source and Citation Rules

GEDCOM FILES are infrastructure only. Never cited. Never appear in researcher-facing
output. GEDCOM IDs are internal plumbing. Never surface them in any output.

ANCESTRY TREE LINKS are not sources. Must be flagged and replaced with the
underlying original source. Never cite them as evidence.

FAMILYSEARCH ARK IDENTIFIERS are valuable. Preserve in all citations alongside
the full record description.

INTERNAL PLATFORM IDs are plumbing. Never surface in researcher-facing output.

---

## Local Environment Rules

TIMESTAMP established: 2026-05-10 21:30 UTC

The one true local path is `/Users/dave/Project-G-Live/`.
The dev server must always run from this directory.

RULES FOR CLAUDE CODE SESSIONS:
- Never run `git clone` inside a Claude Code session. The repo already exists
  at `/Users/dave/Project-G-Live/`. Running clone creates a second copy that
  causes the dev server to run from the wrong directory.
- Before running the dev server, confirm the current directory is
  `/Users/dave/Project-G-Live/` with `pwd`.
- If the app looks wrong at localhost:3000 (wrong module status, missing pages,
  routes returning 404), run `pwd` before anything else. If the path is not
  `/Users/dave/Project-G-Live/`, that is the problem -- not a code bug.
- The dev server runs once. Do not start a second instance on a different port.
  If port 3000 is occupied, kill the old process first: `pkill -f "next dev"`
  then restart from `/Users/dave/Project-G-Live/`.
- All repo reads and writes use the GitHub connector directly.
  Claude Code handles local execution only (npm, running the app, git operations).
- After any GitHub connector push, pull locally before assuming files are current:
  `cd /Users/dave/Project-G-Live && git pull`

---

## Repository Structure

/sessions/          -- Session snapshots and index. Never deleted.
/prototypes/        -- HTML prototype files
/docs/research/     -- Research output files
/docs/modules/      -- Module design documents (16 files, one per module)
/docs/architecture.md -- Supabase schema reference
/sql/               -- SQL migration files. Run in Supabase SQL Editor in order.
  001-create-tables.sql     -- Full schema: all 9 tables + RLS policies
  002-add-res-checklist.sql -- RES checklist table
  003-add-documents.sql     -- documents + document_facts
  004-add-research-log.sql  -- research_sessions + session_sources
  005-add-todos.sql         -- todos table
  006-add-research-plans.sql -- research_plans + research_plan_items +
                               ALTER research_sessions ADD research_plan_id
  007-add-source-conflicts.sql -- source_conflicts table (Module 6)
  008-add-timeline-addresses.sql -- addresses + timeline_events (Module 7)
/src/               -- Application source code
  /src/app/         -- Next.js App Router pages
    /citation-builder/
    /case-study/
    /document-analysis/
    /research-log/
    /todos/
    /research-plans/
    /conflict-resolver/
    /timeline/              -- Module 7 (to be built)
    /api/citation-builder/
    /api/case-study/
    /api/document-analysis/
    /api/research-log/
    /api/todos/
    /api/research-plans/
    /api/conflict-resolver/
    /api/timeline/          -- Module 7 (to be built)
    /api/persons/              -- Shared persons list + create
  /src/components/case-study/
  /src/lib/
  /src/types/
wip/ branch         -- Partially built work, committed even if broken

Claude Code local path: /Users/dave/Project-G-Live/
Use Claude Code only for tasks requiring local execution (running the app, npm, etc.).
All repo reads and writes use the GitHub connector directly.

---

## Static Rules

These do not change session to session. No AI may revise them without explicit
instruction from the user.

- The Greene/Greenspun family line is an active unsolved research project.
  Do not use it as a test case. Do not make assumptions about its data.

- Ancestry.com stays the tree. This platform is the working layer on top of it.
  Do not attempt to replace or replicate the Ancestry tree.

- GEDCOM files are infrastructure. Never cite them. Never surface GEDCOM IDs.

- Ancestry tree links are not sources. Flag them. Replace with original source.

- The platform integrates with an existing Ashkenazi Jewish DNA genealogy workflow.

- The user has years of existing research in Ancestry.com and FamilyTreeMaker.
  This platform sits on top of that work; it does not replace it.

---

## Project State

TIMESTAMP last updated: 2026-05-10 23:00 UTC by Claude

Build phase: Phase 3 ACTIVE -- 7 of 16 modules complete, Module 7 BUILD READY

Committed and clean:
- sql/001 through sql/008 -- all migrations
- docs/modules/07-timeline-builder.md -- Module 7 design doc
- src/types/index.ts -- all entity interfaces including SourceConflict
- All Module 4, 10, 5, 3, 15, 2, 6 source files (see CHANGELOG for full list)
- src/app/api/persons/route.ts -- shared persons endpoint
- src/lib/supabase.ts -- createServerSupabaseClient alias added
- src/lib/ai.ts -- model string updated to claude-sonnet-4-6
- prototypes/case_study_builder_v1.html and v2.html
- docs/architecture.md -- updated with todos, research_plans, source_conflicts,
  addresses, timeline_events specs
- docs/modules/16-research-investigation.md -- design doc, IN DESIGN
- src/app/layout.tsx, page.tsx (dashboard updated), globals.css
- src/lib/ai.ts
- package.json, next.config.ts, tsconfig.json, tailwind.config.ts, postcss.config.js
- .env.local.example, .gitignore, CHANGELOG.md
- All [id] pages updated to Next.js 15 params Promise pattern (use(params))

What does not exist yet:
- Module 7 source code (schema designed, SQL written, ready to build)
- Steve Little prompt engines not integrated
- Supabase seed data (Singer/Springer sources)
- PowerPoint export endpoint
- File upload to Supabase storage (deferred)
- Module 16 Supabase tables (5 new tables -- see design doc)
- Modules 9, 1, 11, 8, 14, 12, 13, 16 (8 modules remaining after Module 7)

Next immediate action:
  TIMESTAMP: 2026-05-10 23:00 UTC
  EXPLORE session complete. Module 7 design committed. AGENT.md v2.7.2.
  Next: declare BUILD and build Module 7 (Timeline Builder).
  Before starting code: run sql/008 in Supabase SQL Editor first.

---

## Backlog

SETTINGS / ADMIN MODULE
- API configuration panel: surface active model + health check; confirm Sonnet vs Opus
- Model selection: make MODEL string a config value, not a hardcoded literal in ai.ts
- Multi-provider support: design ai.ts to be provider-agnostic (Gemini, OpenAI, etc.)
- User preferences panel
- Autocomplete on forms for persons and places already in system

SUPABASE SEED DATA
After smoke tests pass, seed with the 17 Singer/Springer sources from the prototype.

TODO AGGREGATION FEEDS
Module 15 has an origin_module field to support automated aggregation from Research Log,
Source Conflict Resolver, Timeline, and Correspondence Log. Wire as upstream modules ship.

DOCUMENT VIEWER
Source images render inline in the source record panel. Needs Supabase storage bucket.

POWERPOINT EXPORT ENDPOINT
Design the python-pptx endpoint when beginning the PowerPoint export feature.

STEVE LITTLE PROMPT INTEGRATION
Load engine prompts from /prompts/ directory into src/lib/ai.ts callWithEngine().
Research Agent Assignment v2.1 is approximated inline in the generate route for now.

FILE UPLOAD + OCR-HTR TRANSCRIPTION
Module 5 v1 uses manual transcription entry. Deferred until Supabase storage bucket is set up.

CONFLICT FORM VALIDATION
The new conflict form does not currently warn when Source B has incomplete GPS data
(e.g., info_type N/A). A quality-of-life improvement: warn or block submission if
either selected source is missing GPS classification. Low priority -- real sources
from Citation Builder will always be properly classified.

ADDRESS GEOCODING
The addresses table has lat/lng fields. Geocoding historical addresses is imperfect
but workable -- even approximate coordinates produce meaningful maps. Wire a geocoding
step into address entry when the map view is built.

ADDRESS-AS-SEARCH-KEY QUERY
Cross-person address proximity query: "who else in this database lived near this
address in this time range?" Surface automatically in Module 16 and Research Plan Builder.

FAN CLUB MAPPER REDESIGN NOTE
Module 8 should eventually be a spatial FAN map using the addresses table as its
primary data source, not a relationship diagram.

STANDALONE / SHAREABLE PRODUCT VISION
TIMESTAMP noted: 2026-05-10 19:45 UTC. Long-range idea only. Not a build concern now.

The platform is built modular by design. That modularity means individual modules
could one day be extracted and packaged as standalone tools. Research Investigation
(Module 16) is a strong early candidate -- self-contained, solves a universal
genealogical problem, and its AI-collaborative workspace pattern is broadly applicable.

The broader vision: a version of this platform -- or individual modules from it --
shared with other serious researchers or organizations in the genealogical community.
Steve Little's Open-Genealogy project is one example of a potential collaborator
or distribution partner. The GPS and EE machinery would remain underneath; branding,
data model, and configuration would be flexible enough for another researcher or
organization to run their own instance.

This is not a pivot. The platform remains personal and private as built.
The architecture decisions being made now -- modular design, clean API boundaries,
GPS enforcement as a layer -- are the same decisions that make a future shared
version possible. When this idea matures, it belongs in a dedicated product
vision document. For now it lives here as a named, timestamped intention.

PLATFORM NAME
TIMESTAMP noted: 2026-05-10 22:45 UTC.
The application needs a real name -- something that could appear on a webpage
or presentation without sounding like a GitHub slug. Name is pending.
Ask the user about this from time to time.
