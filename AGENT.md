Project-G-Live AGENT.md
Version: 2.8.0
Last updated: 2026-05-11 22:00 UTC
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
  4. After confirmed merge: note in CHANGELOG, reset wip/. The branch is always a working scratch space, never permanent.

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

Current version: 2.8.0

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
  for Layer 2. Powered by the Narrative Assistant v3 + Linguistic Profiler v3
  + voice profile system (discussion scheduled, not yet implemented).

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

8.  Timeline Builder (Module 7) -- COMPLETE
    Committed: 2026-05-11 00:25 UTC.
    addresses (first-class table) + timeline_events.
    4 API routes: /api/timeline (GET+POST), /api/timeline/[id] (GET+PATCH+DELETE),
    /api/timeline/addresses (GET+POST), /api/timeline/normalize-address (POST AI).
    3 pages: list (person selector, filter tabs, timeline dot visual),
    new (address section expands for residence, AI Normalize button),
    detail (read-only + edit toggle, two-step delete).
    Address-as-Evidence is the spine-level principle driving this module.
    SQL migration: sql/008-add-timeline-addresses.sql.

9.  Research Investigation (Module 16) -- COMPLETE
    TIMESTAMP: 2026-05-11 22:00 UTC.
    Persistent AI-collaborative workspace for open-ended research problems.
    Sits upstream of Case Study Builder. Entry: conversation, not a form.
    SQL migration: sql/016-investigations.sql (written; not yet run in Supabase).
    5 tables: investigations, investigation_messages, investigation_evidence,
    investigation_candidates, investigation_matrix_cells.
    7 API routes: /api/investigation (list+create), /api/investigation/[id]
    (GET+PATCH), /api/investigation/[id]/messages (GET+POST with AI context
    pre-loading), /api/investigation/[id]/evidence (GET+POST),
    /api/investigation/[id]/candidates (GET+POST),
    /api/investigation/[id]/candidates/[candidateId] (PATCH),
    /api/investigation/[id]/matrix (GET+POST upsert).
    3 pages: catalog (list), new investigation, workbench (4 tabs:
    Conversation | Evidence | People & Matrix | Conclusions).
    AI context pre-loading: every conversation turn loads full investigation
    state (problem statement, evidence, candidates, orientation) into the
    system prompt so the AI partner is fully oriented on every response.
    NOTE: sql/015-assertions.sql and sql/016-investigations.sql must be run
    in Supabase before Module 16 is usable. Use Claude in Chrome + Monaco
    setValue() method. Run 015 first, then 016.

10. Research Report Writer (Module 9) -- NOT STARTED
    Requires: most modules above. Will use Narrative Assistant v3 + Linguistic
    Profiler v3 + voice profile system. Voice profile discussion scheduled.

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

## Prompt Engine Library

TIMESTAMP established: 2026-05-11 19:15 UTC
Sync tracking: prompts/UPSTREAM-SYNC.md (authoritative -- read this before
any prompt-related work; it tracks versions, download dates, and sync protocol)

Steve Little's Open-Genealogy (github.com/DigitalArchivst/Open-Genealogy) prompts
are committed to /prompts/ under CC BY-NC-SA 4.0. Project-G-Live is personal and
non-commercial. All Steve Little prompts are used in strict accordance with license terms.

Steve Little is the AI Program Director at the National Genealogical Society, co-host
of The Family History AI Show, and author of the Vibe Genealogy Substack (2000+
subscribers). Background: computational linguistics, NLP, information systems, pastor.

His repo contains 120+ files / 16,500+ lines of prompt engineering. His January 2026
PRD (genealogy-record-analysis-prd.md) specifies GPS-grade AI record analysis and
names assertion atomization as the core architectural move -- the same insight that
drives the assertions table design in Project-G-Live.

Steve's prompts are the AI engine layer. Project-G-Live is the application and
persistence layer. The assertions table is where they meet.

Engine Registry Pattern:
  All AI calls use callWithEngine(engine, message, context) in src/lib/ai.ts.
  callWithEngineAndHistory(engine, history, context) for conversation threads.
  No engine prompt is hardcoded inline in any API route.
  The GRA is the base GPS enforcement layer -- composed into all research-facing routes.
  Prompts load from /prompts/ directory via filesystem read at runtime.

Current engine inventory (/prompts/):
  research/gra-v8.5.2c.md                    GPS enforcement base layer
  research/research-agent-assignment-v2.1.md  Research Plan Builder
  transcription/ocr-htr-v08.md               General diplomatic transcription
  transcription/jewish-transcription-v2.md    Jewish document transcription (critical for Ashkenazi research)
  image-analysis/deep-look-v2.md              9-layer forensic image analysis
  image-analysis/hebrew-headstone-helper-v9.md 10-phase headstone analysis with gematria dating
  writing/fact-extractor-v4.md               LABEL: Value extraction from documents
  writing/fact-narrator-v4.md                Assertions to narrative prose
  writing/narrative-assistant-v3.md          GPS-informed narrative (3 modes: new/revision/edit)
  writing/linguistic-profiler-v3.md          Writer voice fingerprinting (powers Layer 2 flywheel)
  writing/conversation-abstractor-v2.md      Session/interview summarization
  writing/document-distiller-v2.md           Document summarization and action extraction
  writing/image-citation-builder-v2.md       Image provenance citation (layered model)

Still to fetch from upstream (see prompts/UPSTREAM-SYNC.md for fetch instructions):
  research/research-assistant-v8.md          700-line full research assistant
  writing/lingua-maven-v9.md                 AHD-style language advisor

Module-Engine Mapping:
  Module 2 Research Plan Builder      research-agent-assignment-v2.1, gra
  Module 3 Research Log               conversation-abstractor-v2, gra
  Module 4 Citation Builder           image-citation-builder-v2, gra
  Module 5 Document Analysis          ocr-htr-v08, jewish-transcription-v2, deep-look-v2,
                                      hebrew-headstone-v9, fact-extractor-v4, gra
  Module 6 Source Conflict Resolver   gra
  Module 7 Timeline Builder           gra
  Module 9 Research Report Writer     narrative-assistant-v3, linguistic-profiler-v3,
                                      fact-narrator-v4, document-distiller-v2, gra
  Module 10 Case Study Builder        gra
  Module 16 Research Investigation    gra, conversation-abstractor-v2

Photo Restoration (future, last priority):
  Claude's own vision and image capabilities for photo restoration should be
  evaluated FIRST before committing to any third-party API. Strong restoration
  results have been achieved using Claude directly with good prompts. Do not
  undersell Claude here. To be discussed at appropriate time.

Steve Little collaboration:
  Held, not closed. Dave has interfaced with Steve online and is interested
  in eventual collaboration. Not ready to approach formally. Revisit when
  the platform is further along and there is more to show.

---

## Assertions Table

TIMESTAMP established: 2026-05-11 18:50 UTC
Design spec: docs/architecture/assertions-table.md
SQL migration: sql/015-assertions.sql (WRITTEN -- not yet run in Supabase)

The assertions table is the connective tissue between sources and conclusions.
Every GPS-classified, source-located atomic fact extracted from any document
produces an assertion record.

Three tables:
- assertions (core: person_id, source_id, predicate, value_as_stated,
  value_normalized, where_within, information_type, evidence_type,
  confidence_score, extraction_method, engine_version)
- assertion_case_study_links (evidence_type override per case study)
- assertion_conflict_links (assertion-level conflict precision)

Design decisions:
- Forward-only: no retrofitting existing data
- Evidence type stored as default on assertion; overridable per case study
- extraction_method + engine_version track AI vs. human provenance
- Predicate controlled vocabulary (born_in, died_in, resided_at, married, etc.)

Must be run before Module 16 is usable in production.
Run sql/015-assertions.sql first, then sql/016-investigations.sql.
Use Claude in Chrome + Supabase SQL editor + Monaco setValue() method.

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
  9 of 16 modules complete:
  Module 4 (Citation Builder), Module 10 (Case Study Builder),
  Module 5 (Document Analysis Worksheet), Module 3 (Research Log),
  Module 15 (Research To-Do Tracker), Module 2 (Research Plan Builder),
  Module 6 (Source Conflict Resolver), Module 7 (Timeline Builder),
  Module 16 (Research Investigation)
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
- Next.js 15 / React 19: params in [id] pages are a Promise.
  In React client components (use client): import { use } from 'react'; const { id } = use(params)
  In API route handlers (async functions): const { id } = await params
  Never access params.id directly. Never use the React use() hook in API route handlers.
- No engine prompt is hardcoded inline in any API route. Use callWithEngine().

---

## Claude in Chrome -- SQL Editor Notes

TIMESTAMP established: 2026-05-11 10:30 UTC

When running SQL migrations via Claude in Chrome against the Supabase SQL editor:
- DO NOT type long SQL strings into the Monaco editor. The editor's auto-closing
  brackets and autocomplete will corrupt the SQL (doubled parentheses, dropped characters).
- USE the Monaco editor API instead:
    window.monaco.editor.getModels()[n].setValue(sql)
  This sets the editor content directly, bypassing all autocomplete interference.
- After setValue(), click in the editor area and use cmd+Return to run.
- The Supabase project reference ID for Project G: slqjooudyfvmnaoetdvi
  SQL editor direct URL: https://supabase.com/dashboard/project/slqjooudyfvmnaoetdvi/sql/new

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
/docs/architecture/ -- Architecture decision records
  architecture.md              -- Supabase schema reference (through migration 014)
  assertions-table.md          -- Assertions table design spec (migration 015)
/prompts/           -- AI engine library (Steve Little CC BY-NC-SA 4.0 + future originals)
  README.md                    -- Engine registry overview, module-engine mapping
  UPSTREAM-SYNC.md             -- Steve Little sync tracking, version history, fetch protocol
  /research/                   -- GPS research prompts
  /transcription/              -- Document transcription prompts
  /image-analysis/             -- Image and headstone analysis prompts
  /writing/                    -- Writing and fact extraction prompts
/sql/               -- SQL migration files. Run in Supabase SQL Editor in order.
  001-create-tables.sql        -- Full schema: all 9 tables + RLS policies
  002-add-res-checklist.sql    -- RES checklist table
  003-add-documents.sql        -- documents + document_facts
  004-add-research-log.sql     -- research_sessions + session_sources
  005-add-todos.sql            -- todos table
  006-add-research-plans.sql   -- research_plans + research_plan_items
  007-add-source-conflicts.sql -- source_conflicts table (Module 6)
  008-add-timeline-addresses.sql -- addresses + timeline_events (Module 7)
  009-persons-foundation.sql   -- ALTER persons: name components, sex, flags, dual-date sort
  010-families.sql             -- families + family_members
  011-repositories.sql         -- repositories + repository_id FK on sources
  012-associations.sql         -- associations (FAN Club data model)
  013-event-types.sql          -- event_types lookup + FK on timeline_events
  014-dual-date-audit.sql      -- dual-date pattern audit (no DDL)
  015-assertions.sql           -- assertions + assertion_case_study_links + assertion_conflict_links
                                  WRITTEN -- NOT YET RUN IN SUPABASE
  016-investigations.sql       -- investigations + investigation_messages + investigation_evidence
                                  + investigation_candidates + investigation_matrix_cells
                                  WRITTEN -- NOT YET RUN IN SUPABASE
/src/               -- Application source code
  /src/app/         -- Next.js App Router pages
    /citation-builder/
    /case-study/
    /document-analysis/
    /research-log/
    /todos/
    /research-plans/
    /conflict-resolver/
    /timeline/
    /investigation/             -- Module 16 COMPLETE
    /investigation/new/
    /investigation/[id]/
    /api/citation-builder/
    /api/case-study/
    /api/document-analysis/
    /api/research-log/
    /api/todos/
    /api/research-plans/
    /api/conflict-resolver/
    /api/timeline/
    /api/investigation/         -- Module 16 COMPLETE
    /api/investigation/[id]/
    /api/investigation/[id]/messages/
    /api/investigation/[id]/evidence/
    /api/investigation/[id]/candidates/
    /api/investigation/[id]/candidates/[candidateId]/
    /api/investigation/[id]/matrix/
    /api/persons/               -- Shared persons list + create
  /src/components/case-study/
  /src/lib/
    ai.ts                       -- callWithEngine() + callWithEngineAndHistory() -- COMPLETE
    supabase.ts
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

TIMESTAMP last updated: 2026-05-11 22:00 UTC by Claude

Build phase: Phase 3 ACTIVE -- 9 of 16 modules complete

Genealogical data foundation: COMPLETE and LIVE as of 2026-05-11 10:30 UTC.
  Migrations 001-014 have been run in Supabase SQL editor.
  persons, families, repositories, associations, event_types tables live.
  Dual-date pattern confirmed complete across all tables (migration 014 audit).

src/types/index.ts: FULLY CURRENT as of 2026-05-11 17:00 UTC.
  All entity interfaces through migration 014. Investigation types not yet added.

src/lib/ai.ts: COMPLETE as of 2026-05-11 21:00 UTC.
  callWithEngine() and callWithEngineAndHistory() fully implemented.
  13 engines registered. GRA composed as base layer for research-facing engines.
  Prompts load from /prompts/ via filesystem read.

Prompt engine library: COMMITTED as of 2026-05-11 19:15 UTC.
  13 Steve Little engine files in /prompts/.
  prompts/UPSTREAM-SYNC.md -- sync tracking and protocol committed.
  Two prompts still to fetch: research-assistant-v8.md, lingua-maven-v9.md.
  See prompts/UPSTREAM-SYNC.md for exact fetch instructions.

SQL migrations written but NOT YET RUN:
  sql/015-assertions.sql -- run this first
  sql/016-investigations.sql -- run after 015

Committed and clean (all modules 4, 10, 5, 3, 15, 2, 6, 7, 16 source files):
- All /src/app/investigation/ pages
- All /src/app/api/investigation/ routes
- src/lib/ai.ts (callWithEngine complete)
- sql/015-assertions.sql
- sql/016-investigations.sql
- prompts/UPSTREAM-SYNC.md
- src/app/page.tsx (dashboard -- Module 16 added)
- CHANGELOG.md (this session)
- AGENT.md v2.8.0

What does not exist yet:
- sql/015 and sql/016 NOT YET RUN in Supabase (immediate next action)
- src/types/index.ts: investigation types not added (defer until needed)
- research-assistant-v8.md and lingua-maven-v9.md (fetch locally from Steve's repo)
- ENGINE_FILES in ai.ts: two commented entries need uncommenting after files fetched
- /api/persons endpoint may need updating for new person fields (defer until a module uses them)
- Supabase seed data (Singer/Springer sources)
- PowerPoint export endpoint
- File upload to Supabase storage (deferred)
- Module 5 upgrade: full input pipeline (Fact Extractor -> assertions table)
- Module 9 Research Report Writer
- Voice profile discussion (scheduled, not yet had)
- Modules 9, 1, 11, 8, 14, 12, 13 (7 modules remaining)

Next immediate action:
  TIMESTAMP: 2026-05-11 22:00 UTC
  Run sql/015-assertions.sql in Supabase via Claude in Chrome (Monaco setValue method).
  Then run sql/016-investigations.sql the same way.
  Then: git pull locally, start dev server, smoke test Module 16 at /investigation.
  Then: fetch research-assistant-v8.md and lingua-maven-v9.md from Steve's repo locally
  and commit them (see prompts/UPSTREAM-SYNC.md for exact commands).

---

## Backlog

SETTINGS / ADMIN MODULE
- API configuration panel: surface active model + health check; confirm Sonnet vs Opus
- Model selection: make MODEL string a config value, not a hardcoded literal in ai.ts
- Multi-provider support: design ai.ts to be provider-agnostic (Gemini, OpenAI, etc.)
- User preferences panel
- Autocomplete on forms for persons and places already in system
- Voice profile: capture researcher's writing style via Linguistic Profiler v3.
  Store as application-level setting. Feed into all narrative-generating API calls.
  Discussion scheduled -- provide corpus of writing to generate the profile.

SUPABASE SEED DATA
After smoke tests pass, seed with the 17 Singer/Springer sources from the prototype.

TODO AGGREGATION FEEDS
Module 15 has an origin_module field to support automated aggregation from Research Log,
Source Conflict Resolver, Timeline, and Correspondence Log. Wire as upstream modules ship.

MODULE 16 ENHANCEMENTS (v2)
- Orientation block auto-maintained by AI (currently static -- shows problem statement)
- Address editing from investigation evidence (link to addresses table)
- Candidate promotion to persons table (UI for confirmed candidates)
- Handoff packet to Case Study Builder (formal handoff flow)
- Source push to Citation Builder from investigation evidence

DOCUMENT VIEWER
Source images render inline in the source record panel. Needs Supabase storage bucket.

POWERPOINT EXPORT ENDPOINT
Design the python-pptx endpoint when beginning the PowerPoint export feature.

FILE UPLOAD + OCR-HTR TRANSCRIPTION
Module 5 v1 uses manual transcription entry. Deferred until Supabase storage bucket is set up.
When storage is ready: document upload -> OCR-HTR v08 -> Fact Extractor v4 -> assertions table.

ADDRESS GEOCODING
The addresses table has lat/lng fields. Wire a geocoding step into address entry
when the map view is built.

ADDRESS-AS-SEARCH-KEY QUERY
Cross-person address proximity query: "who else in this database lived near this
address in this time range?" Surface automatically in Module 16 and Research Plan Builder.

ADDRESS EDITING FROM DETAIL PAGE
Module 7 v1 shows address read-only on the event detail page. FIX session when needed.

FAN CLUB MAPPER REDESIGN NOTE
Module 8 should eventually be a spatial FAN map using the addresses table as its
primary data source, not a relationship diagram.

PHOTO RESTORATION
Evaluate Claude's own vision capabilities first. Strong restoration results achieved
using Claude directly with good prompts. Do not default to a third-party API.
Last priority.

ORAL HISTORY PIPELINE
Whisper API transcription -> Conversation Abstractor v2 -> Fact Extractor v4 ->
assertions table. Plan alongside PowerPoint export endpoint.

KNOWN SCHEMA ISSUES (minor, non-urgent)
- gps_stage_reached on case_studies: check constraint says between 1 and 5.
  Production app has 6 stages. Fix in a future migration.
- Dual-date naming inconsistency: migration 008 uses event_date + date_display.
  Migrations 009+ use _display + _sort. Both work. Future cosmetic cleanup.

STANDALONE / SHAREABLE PRODUCT VISION
TIMESTAMP noted: 2026-05-10 19:45 UTC. Long-range idea only. Not a build concern now.

The platform is built modular by design. Research Investigation (Module 16) is a
strong candidate for extraction as a standalone tool -- self-contained, solves a
universal genealogical problem. The broader vision: a version shareable with other
serious researchers or organizations. Steve Little's Open-Genealogy project is a
potential collaborator. This is not a pivot. When this idea matures, it belongs in a
dedicated product vision document. For now it lives here as a named, timestamped intention.

Steve collaboration is held, not closed. Revisit when platform is further along.

PLATFORM NAME
TIMESTAMP noted: 2026-05-10 22:45 UTC.
The application needs a real name. Name is pending. Ask the user about this from time to time.
