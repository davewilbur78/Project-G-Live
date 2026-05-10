Project-G-Live AGENT.md
Version: 2.6.0
Last updated: 2026-05-10 17:00 UTC
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
Use this when direction is uncertain before building.

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

Current version: 2.6.0

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

15 modules. Design docs in /docs/modules/. Build order reflects dependencies.
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
    Awaiting: user runs sql/006 and smoke tests.

7.  Source Conflict Resolver (Module 6) -- NOT STARTED
    Requires: Citation Builder, sources in Supabase.

8.  Timeline Builder (Module 7) -- NOT STARTED
    Requires: Citation Builder, facts in Supabase.

9.  Research Report Writer (Module 9) -- NOT STARTED
    Requires: most modules above.

10. GEDCOM Bridge (Module 1) -- NOT STARTED
    Onboarding layer. Build after core app is working.

11. Family Group Sheet Builder (Module 11) -- NOT STARTED

12. FAN Club Mapper (Module 8) -- NOT STARTED

13. DNA Evidence Tracker (Module 14) -- NOT STARTED

14. Correspondence Log (Module 12) -- NOT STARTED.

15. File Naming System (Module 13) -- NOT STARTED.

---

## Prompt Engines (Third-Party)

Steve Little's Open-Genealogy project (github.com/DigitalArchivst/Open-Genealogy)
License: CC BY-NC-SA 4.0. Personal non-commercial research only.

- OCR-HTR Transcription Tool v08 -- document transcription on upload
- Fact Extractor v4 -- extracts discrete factual claims from documents
- Fact Narrator v4 -- turns extracted facts into narrative prose
- GEDCOM Analysis assistant -- powers the GEDCOM Bridge parsing layer
- Image Citation Builder v2 -- citation generation for uploaded images
- Chat Conversation Abstractor v2 -- Research Log session summaries
- Research Agent Assignment v2.1 -- Research Plan Builder logic
- GRA v8.5c -- GPS enforcement layer across all modules

---

## Tech Stack

- Frontend: Next.js 15 with React 19, App Router, Tailwind CSS
- Backend: Next.js API route handlers (routes live at src/app/api/, not src/api/)
- Database: Supabase (PostgreSQL)
- AI: Anthropic Claude API (claude-sonnet-4-20250514 -- update when newer model available)
- File storage: Supabase storage bucket
- PowerPoint export: python-pptx via lightweight Python endpoint
- Deployment: Vercel

---

## Build Path

Phase 1: Documentation and architecture -- COMPLETE
Phase 2: Prototype artifacts to test interview logic -- COMPLETE
Phase 3: Full web app built module by module -- ACTIVE
  6 of 15 modules complete:
  Module 4 (Citation Builder), Module 10 (Case Study Builder),
  Module 5 (Document Analysis Worksheet), Module 3 (Research Log),
  Module 15 (Research To-Do Tracker), Module 2 (Research Plan Builder)
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

## Repository Structure

/sessions/          -- Session snapshots and index. Never deleted.
/prototypes/        -- HTML prototype files
/docs/research/     -- Research output files
/docs/modules/      -- Module design documents (15 files, one per module)
/docs/architecture.md -- Supabase schema reference
/sql/               -- SQL migration files. Run in Supabase SQL editor in order.
  001-create-tables.sql     -- Full schema: all 9 tables + RLS policies
  002-add-res-checklist.sql -- RES checklist table
  003-add-documents.sql     -- documents + document_facts
  004-add-research-log.sql  -- research_sessions + session_sources
  005-add-todos.sql         -- todos table
  006-add-research-plans.sql -- research_plans + research_plan_items +
                               ALTER research_sessions ADD research_plan_id
/src/               -- Application source code
  /src/app/         -- Next.js App Router pages
    /citation-builder/
    /case-study/
    /document-analysis/
    /research-log/
    /todos/
    /research-plans/
    /api/citation-builder/
    /api/case-study/
    /api/document-analysis/
    /api/research-log/
    /api/todos/
    /api/research-plans/
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

TIMESTAMP last updated: 2026-05-10 17:00 UTC by Claude

Build phase: Phase 3 ACTIVE -- 6 of 15 modules complete

Committed and clean:
- sql/001 through sql/006 -- all migrations
- src/types/index.ts -- all entity interfaces
- All Module 4, 10, 5, 3, 15, 2 source files (see CHANGELOG for full list)
- src/app/api/persons/route.ts -- shared persons endpoint
- prototypes/case_study_builder_v1.html and v2.html
- docs/architecture.md
- src/app/layout.tsx, page.tsx (dashboard updated), globals.css
- src/lib/supabase.ts, src/lib/ai.ts
- package.json, next.config.ts, tsconfig.json, tailwind.config.ts, postcss.config.js
- .env.local.example, .gitignore, CHANGELOG.md

What does not exist yet:
- Supabase migrations 003 through 006 may not yet be run by user.
  User must run sql/003, sql/004, sql/005, sql/006 in Supabase SQL editor (in order).
- Steve Little prompt engines not integrated
- Supabase seed data (Singer/Springer sources)
- PowerPoint export endpoint
- File upload to Supabase storage (deferred)
- Modules 6, 7, 9, 1, 11, 8, 14, 12, 13 (9 modules remaining)
- Dashboard breadcrumb not yet added to pre-Module-2 pages (Citation Builder,
  Case Study Builder, Document Analysis, Research Log, Todos) -- backlog item

Next immediate action:
  TIMESTAMP: 2026-05-10 17:00 UTC
  User: pull main, run sql/006-add-research-plans.sql (and any of 003-005 not yet run),
  smoke test /research-plans. Then declare posture for next session.

---

## Backlog

SETTINGS / ADMIN MODULE
- Dashboard back-navigation on all module screens (breadcrumb pattern; added to Module 2
  pages; not yet added to pre-existing modules -- Citation Builder, Case Study,
  Document Analysis, Research Log, Todos)
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
