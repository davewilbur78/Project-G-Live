Project-G-Live AGENT.md
Version: 2.15.0
Last updated: 2026-05-15 UTC
Last updated by: Claude (claude.ai)

# What This Is

Single source of truth for Project-G-Live. One file. One authority.
All operating rules and project context live here. No other file overrides this one.

Claude has a direct GitHub connector. Use it for all repo reads and writes.
No workarounds, no raw URLs, no base64 decoding required.

At session start: read this file, confirm version number and last-updated date in natural language,
then navigate to /sessions/: read SESSIONS-INDEX.md, take the filename from the first field of the
first entry (index is ordered most-recent-first), and read that snapshot file in full to orient.
If SESSIONS-INDEX.md is missing or the filename does not resolve, fall back to scanning the
directory and opening the most recent SESSION-*.md file by name. Ask for posture: BUILD, FIX, or EXPLORE.
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
Format: FILENAME | TIMESTAMP | Posture | AI | one-sentence summary.
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
5. Update SESSIONS-INDEX.md: prepend the snapshot filename as the first field, then TIMESTAMP | Posture | AI | one-sentence summary
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

Current version: 2.15.0

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

## Media-as-Unanalyzed-Evidence

TIMESTAMP established: 2026-05-16 UTC

Every media file attached to a person in FTM is a document that has never been
seen by the AI pipeline. The 3,752 files in the synchronized tree are not a
storage problem -- they are unanalyzed evidence. Census images, ship manifests,
draft cards, death certificates, naturalization documents, photographs -- each
one is a candidate for the Document Analysis Worksheet pipeline.

The import run inventory is the basis for deciding which files to run through
the pipeline first. Selective on-demand import is the architecture: pull a file,
analyze it via Deep Look v2 + OCR-HTR + Fact Extractor, write extracted facts
into assertions with source_id attached. The file does not need to live in
Supabase permanently for this to work.

This principle connects directly to the Brick Wall Reframe: a census image
sitting inert in Ancestry has a ceiling. The same image run through the AI
pipeline surfaces every name on the page, every neighbor, every address
discrepancy -- and that is address-search territory.

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

16 original modules + Module 17 (FTM Bridge, added 2026-05-13).
Design docs in /docs/modules/. Build order reflects dependencies.
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

7.  Source Conflict Resolver (Module 6) -- COMPLETE
    Committed: 2026-05-10 20:30 UTC.

8.  Timeline Builder (Module 7) -- COMPLETE
    Committed: 2026-05-11 00:25 UTC.

9.  Research Investigation (Module 16) -- COMPLETE
    TIMESTAMP: 2026-05-11 22:00 UTC.

10. Correspondence Log (Module 12) -- COMPLETE
    TIMESTAMP: 2026-05-12 (dinner session) UTC.

11. DNA Evidence Tracker (Module 14) -- COMPLETE
    TIMESTAMP: 2026-05-13 UTC.

12. File Naming System (Module 13) -- COMPLETE
    TIMESTAMP: 2026-05-13 UTC.

13. FTM Bridge (Module 17) -- COMPLETE (all phases)
    Phase 1+2 commit: 291f786. Phase 3 UI: dc15d06 + a4b1fca. TIMESTAMP: 2026-05-14 UTC.
    Full synchronized tree import: COMPLETE 2026-05-16 UTC.
    1,576 persons, 5,983 timeline events, 87.6% source-wired.

14. Research Report Writer (Module 9) -- NOT STARTED
    Requires voice profile discussion first.

15. GEDCOM Bridge (Module 1) -- NOT STARTED

16. Family Group Sheet Builder (Module 11) -- NOT STARTED

17. FAN Club Mapper (Module 8) -- NOT STARTED

---

## FTM Bridge -- Encryption, Import Pipeline, and Roadmap

TIMESTAMP established: 2026-05-13 UTC
TIMESTAMP Phase 3 extractor scope decided: 2026-05-16 UTC

### The Breakthrough

FTM .ftm files use SQLite SEE (SQLite Encryption Extension), NOT SQLCipher.
Reverse-engineered by Claude Code (claude-opus-4-7) in a single session.

### Encryption Details

  File format:    SQLite SEE (not SQLCipher)
  Activation key: 7bb07b8d471d642e
  DB password:    aes256:ViDfwQnOAX8IGG5T5xs3yyBOryIqfPu6
  Schema version: 20200615 (FTM 2024 current schema)
  Framework path: DYLD_FRAMEWORK_PATH=/Applications/Family Tree Maker 2024.app/Contents/Frameworks
  Compile:        clang -arch arm64 -o scripts/ftm-extractor scripts/ftm-extractor.c

### Current Import State (Phase 2 -- synced tree)

  Persons: 1,576 | Families: 625 | Timeline events: 5,983
  Source-wired: 5,237 (87.6%) | Sources: 1,930 | Repositories: 4
  Tree: KLEIN-SINGER and WILBUR-DALIMORE 2025
  Idempotency: FULLY SAFE. SourceLink: WIRED. Alt names: IMPORTED.

### Phase 3 Extractor Scope -- DECIDED 2026-05-16 UTC

  Priority 1: PersonExternal -- COMPLETE 2026-05-15 UTC.
    PersonExternal table in .ftm is empty. Ancestry IDs live in Sync_Person.AmtId.
    All 1,576 persons have AmtId populated. FSIDs universally NULL (not FamilySearch-linked).
    Extractor updated (commit 97d1f36). Migration 019 live. Importer Phase 7 live.
    person_external_ids: 1,576 rows, all provider='ancestry', idempotent.
    Pagination fix applied (commit 9886492): fetch was silently capped at 1000 rows. Fixed.
  Priority 2: MediaFile + MediaLink -- after storage bucket decision.
  Priority 3: Marker (places) -- after PersonExternal is complete.

### Notes Pipeline -- DECIDED 2026-05-16 UTC

  44 substantive RTF research notes in synced tree currently thrown away by importer.
  New table: ftm_notes (id, person_id FK, source_id FK nullable, ftm_note_id int,
    content text [RTF stripped], imported_at timestamptz).
  RTF stripped to plain text at import time. URLs preserved. Unicode preserved.
  Discrete entries -- not merged into person_research_notes.
  "Send to Source Conflict Resolver" action on Research Notes panel (future).

### Fact-Type Normalizer -- DECIDED 2026-05-16 UTC

  Category A (standard tags): add to TAG_TO_EVENT.
    ARVL -> arrival, DPRT -> departure (keep distinct, not folded into immigration).
    Naturalization sub-tags: kept granular (petition, declaration, oath, certificate,
      deposition -- each is a distinct legal document).
    _MILT, ADDR, CHR, PROB, DIVF also added.
    .trim() on all factTypeTag and factTypeName fields -- mandatory.
  Category B (narrative custom facts): regex normalizer.
    Collapse ~140 unique types to: obituary, marriage_announcement, marriage_license,
    birth_announcement, wedding_announcement, newspaper_mention, other.
    Original fact name preserved in description field.

### Known FTM Data Quality Issues

  Quote characters in display names -- FTM data-entry artifact. Not a code bug.
  Non-ASCII character corruption -- encoding mismatch for Yiddish names. Not a code bug.
  Alt names include primary name -- 22 persons. Fix in next importer session.
  Smart/curly quotes in 2 names -- present in synced tree, not test file.
  36 persons missing FamilyName -- pre-emancipation Ashkenazi naming. Not a bug.
  12 persons missing GivenName -- placeholder entries. Not a bug.

### Idempotency Status -- FULLY SAFE

  Persons: SAFE (upsert by ancestry_id = "ftm:[ID]")
  Repositories: SAFE (upsert by name)
  Sources: SAFE (skips if "FTM Import" marker exists)
  Families: SAFE (delete-then-reinsert)
  Timeline events: SAFE (delete-then-reinsert)

### Running the Importer

  Compile:  clang -arch arm64 -o scripts/ftm-extractor scripts/ftm-extractor.c
  Run:      node scripts/import-ftm.mjs [path-to-ftm-file]
  Dry run:  node scripts/import-ftm.mjs --dry-run [path]
  Default path: /Users/dave/ftm playground/Mom plus 1 generation.ftm
  Do NOT use --skip-extract after recompiling.
  Do NOT use git add -A.

### Person Detail Page

  Status: COMPLETE AND CLEAN. 9 panels. tsc clean. /persons/[id] live.
  See Project State section for full detail.

---

## Prompt Engine Library

TIMESTAMP established: 2026-05-11 19:15 UTC
TIMESTAMP last updated: 2026-05-12 00:35 UTC

All 15 engines committed and live. No files remaining to fetch from upstream.
See /prompts/UPSTREAM-SYNC.md for version tracking and sync protocol.

Engine Registry Pattern:
  All AI calls use callWithEngine(engine, message, context) in src/lib/ai.ts.
  callWithEngineAndHistory(engine, history, context) for conversation threads.
  No engine prompt is hardcoded inline in any API route.

Current engine inventory -- ALL 15 COMMITTED AND LIVE:
  research/gra-v8.5.2c.md
  research/research-agent-assignment-v2.1.md
  research/research-assistant-v8.md
  transcription/ocr-htr-v08.md
  transcription/jewish-transcription-v2.md
  image-analysis/deep-look-v2.md
  image-analysis/hebrew-headstone-helper-v9.md
  writing/fact-extractor-v4.md
  writing/fact-narrator-v4.md
  writing/narrative-assistant-v3.md
  writing/linguistic-profiler-v3.md
  writing/lingua-maven-v9.md
  writing/conversation-abstractor-v2.md
  writing/document-distiller-v2.md
  writing/image-citation-builder-v2.md

---

## Assertions Table

TIMESTAMP established: 2026-05-11 18:50 UTC
SQL migration: sql/015-assertions.sql -- LIVE in Supabase.
Design spec: docs/architecture/assertions-table.md

Live but no upstream writers yet. Planned first writers:
- FTM Bridge (SourceLink -> assertion per fact-source connection)
- Document Analysis Worksheet v2 (AI extraction -> assertion per extracted fact)
- Research Investigation (evidence confirmed -> assertion)

---

## Tech Stack

- Frontend: Next.js 15 with React 19, App Router, Tailwind CSS
- Backend: Next.js API route handlers (routes live at src/app/api/)
- Database: Supabase (PostgreSQL)
- AI: Anthropic Claude API (claude-sonnet-4-6 -- update when newer model available)
- File storage: Supabase storage bucket (not yet provisioned)
- PowerPoint export: python-pptx via lightweight Python endpoint
- Deployment: Vercel (not yet deployed -- local only)
- FTM import: C extractor + Node.js importer running locally on Dave's Mac

---

## Build Path

Phase 1: Documentation and architecture -- COMPLETE
Phase 2: Prototype artifacts -- COMPLETE
Phase 3: Full web app built module by module -- ACTIVE
  13 of 17 modules complete + person detail page COMPLETE
  Full synchronized tree live in Supabase as of 2026-05-16 UTC
Phase 4: GEDCOM Bridge (Module 1)
Phase 5: Case Study Builder PowerPoint export as flagship

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
- Every factual claim in a proof argument carries an inline footnote
- The prototype design system is the visual standard. Match it.
- API routes live at src/app/api/ -- never src/api/
- All new module pages include a back-to-dashboard breadcrumb link
- Next.js 15 / React 19: params in [id] pages are a Promise.
  Client components: import { use } from 'react'; const { id } = use(params)
  API route handlers: const { id } = await params
  Never access params.id directly.
- No engine prompt is hardcoded inline in any API route. Use callWithEngine().
- NEVER use `git add -A`. Always use `git add <specific-path>`.

---

## Claude in Chrome -- SQL Editor Notes

TIMESTAMP established: 2026-05-11 10:30 UTC
MANDATORY RE-READ RULE: Before writing any plan involving Claude in Chrome or the
Supabase SQL editor, re-read this entire section. No exceptions.

- Use Monaco editor API: window.monaco.editor.getModels()[n].setValue(sql)
- Determine n at runtime -- do not assume n=0
- Supabase project ref: slqjooudyfvmnaoetdvi
- SQL editor URL: https://supabase.com/dashboard/project/slqjooudyfvmnaoetdvi/sql/new

---

## Platform Output Types

RESEARCHER / PROFESSIONAL OUTPUT
GPS-compliant language, EE citations, full footnotes, Three-Layer analysis visible.

CLIENT OUTPUT
Plain English narrative. Methodology invisible. Warm and readable.

---

## Dual-AI Workflow

TIMESTAMP established: 2026-05-12 (post-dinner) UTC

CLAUDE.AI -- Architecture, design, GitHub connector, session memory, SQL migrations
CLAUDE CODE -- Local execution, smoke tests, debugging, FTM import runs

Division of labor:
- When build is complete here, hand smoke test to Claude Code
- When Claude Code finds a local issue, it documents in /sessions/ and claude.ai picks up
- Neither interface duplicates the other's work
- Claude Code reads AGENT.md at session start. No re-briefing needed.

---

## MCP Infrastructure

NPX mode active. Manager: ~/.claude/mcp-manager.py
  python3 ~/.claude/mcp-manager.py use npx     -- current mode
  python3 ~/.claude/mcp-manager.py status      -- check active mode
After any mode switch: quit and reopen Claude Desktop.

---

## Local Environment Rules

One true local path: /Users/dave/Project-G-Live/
- Never run git clone inside a Claude Code session
- Confirm pwd before running dev server
- Check for stale dev server: lsof -iTCP:3000
- STALE CACHE: pkill -f "next dev" then rm -rf .next then npm run dev
- After GitHub connector push: git pull before assuming files are current
- NEVER use git add -A. Always stage specific paths.

---

## Repository Structure

/sessions/          -- Session snapshots and index
/prototypes/        -- HTML prototype files
/scripts/           -- Utility scripts
  ftm-extractor.c   -- C source (ARM64; compile before use)
  import-ftm.mjs    -- Node.js FTM -> Supabase importer
/docs/research/     -- Research output files
/docs/modules/      -- Module design documents
/docs/architecture/ -- Architecture decision records
/prompts/           -- AI engine library
/sql/               -- SQL migration files (001-019, all live)
/src/               -- Application source
  /src/app/         -- Next.js pages and API routes
  /src/lib/ai.ts    -- callWithEngine() -- 15 engines
  /src/lib/supabase.ts
  /src/lib/ftm-import.ts
  /src/types/index.ts
wip/                -- Partially built work scratch space

---

## Static Rules

- The Greene/Greenspun family line is an active unsolved research project.
  Do not use it as a test case. Do not make assumptions about its data.
- Ancestry.com stays the tree. This platform is the working layer on top.
- GEDCOM files are infrastructure. Never cite them. Never surface GEDCOM IDs.
- Ancestry tree links are not sources. Flag them. Replace with original source.
- The platform integrates with an existing Ashkenazi Jewish DNA genealogy workflow.
- Do NOT attempt direct writes to .ftm files without full mapping of all 109 tables.
- Connie Knox is a standing workflow reference. Ask whether there is a Connie Knox
  video worth reviewing before designing workflow features.
  Reference doc: docs/research/connie-knox-workflow-reference.md.
- Research Notes are NOT the Research Log (Module 3).
  Research Notes (person_research_notes): living narrative per person.
  Research Log (Module 3): log of research sessions and sources consulted.
- Full tree import protocol: Claude Code + Opus. Brief in claude.ai first.
  COMPLETE as of 2026-05-16 UTC.

---

## Known Technical Debt

TIMESTAMP: 2026-05-15 UTC

- Untracked files on main (left untouched, Dave to decide):
  package-lock.json, prototypes/dashboard-mockup-v1.html,
  scripts/import-gedcom.js, sessions/SESSION-2026-05-14-REVIEW-CLAUDECODE-UTC.md
- AGENT.md size: recognized concern, not yet actioned.
- stats query .in() chunking: RESOLVED 2026-05-16 UTC (commit e4e064c).
- Dry-run source wiring report: RESOLVED 2026-05-16 UTC (commit e4e064c).
- alt_names primary-name dedup: 22 persons. Fix in next importer session.
- git add -A staging incident: RESOLVED 2026-05-14 UTC.
- git divergence: RESOLVED 2026-05-14 UTC.
- Existing-persons fetch capped at 1000 rows: RESOLVED 2026-05-15 UTC (commit 9886492).
  Pagination loop added to import-ftm.mjs.
- families.partner1_id / partner2_id use ON DELETE SET NULL, not CASCADE.
  Caused 1,088 orphan families during persons cleanup 2026-05-15 UTC.
  Orphans deleted manually. Schema behavior now documented.
  Consider changing to CASCADE in a future migration.

---

## Project State

TIMESTAMP last updated: 2026-05-15 UTC by Claude (claude.ai) -- v2.15.0

Build phase: Phase 3 ACTIVE -- 13 of 17 modules complete + person detail page COMPLETE

Genealogical data foundation: COMPLETE and LIVE.
  Migrations 001-019 all run in Supabase. Migration 019 live 2026-05-15 UTC.
  1,576 persons from full synchronized tree live in Supabase.
  5,237 of 5,983 timeline events have source_id wired (87.6%).
  Importer fully idempotent. Safe to re-run.

person_external_ids: LIVE. 1,576 rows, all provider='ancestry'. Idempotent. 2026-05-15 UTC.

src/lib/ai.ts: COMPLETE. 15 engines registered and live.
src/types/index.ts: COMPLETE. tsc clean.
Prompt engine library: COMPLETE.

FTM Bridge: COMPLETE AND SMOKE TESTED (all phases).
  Full synchronized tree import: COMPLETE 2026-05-16 UTC.

Person detail page: COMPLETE AND CLEAN. 9 panels.

git repo: CLEAN at session close commit (this commit).

What still needs to happen (priority order):
1. Notes pipeline: ftm_notes table + importer extension.
2. Fact-type normalizer: TAG_TO_EVENT additions + Category B regex pass.
3. Vercel deployment.
4. Supabase backups.
5. Voice profile discussion (gates Module 9).
6. Modules 9, 1, 11, 8.

Next immediate action:
  TIMESTAMP: 2026-05-15 UTC
  Notes pipeline: design ftm_notes table migration and importer extension.
  Decisions are locked in AGENT.md. Claude Code or claude.ai.

---

## Backlog

FTM BRIDGE FUTURE
- PersonExternal: COMPLETE 2026-05-15 UTC (migration 019, importer Phase 7, pagination fix).
- Notes pipeline: ftm_notes table, RTF stripping, importer extension
- Fact-type normalizer: Category A TAG_TO_EVENT additions + Category B regex pass
- alt_names primary-name dedup: fix in next importer session
- Living flag: compute heuristically from death date + birth year
- Media import: selective on-demand pipeline (future Module 18)
  Architecture: pull file -> Document Analysis pipeline -> assertions
  Storage: R2/B2 when the time comes. Not Supabase Storage for bulk.
- MediaLink relationships: needs extractor update
- stats query chunking: RESOLVED (e4e064c)
- Dry-run reporting: RESOLVED (e4e064c)

DEPLOYMENT AND INFRASTRUCTURE
- Vercel deployment: not yet done
- Production environment variables: set in Vercel dashboard
- Supabase backups: configure point-in-time recovery

VOICE PROFILE
- Capture researcher's writing style via Linguistic Profiler v3
- Discussion scheduled -- provide corpus of writing
- Required before Module 9 begins

MODULE 16 ENHANCEMENTS (v2)
- Orientation block auto-maintained by AI
- Address editing from investigation evidence
- Candidate promotion to persons table
- Handoff packet to Case Study Builder
- Source push to Citation Builder

ASSERTIONS TABLE UPSTREAM WRITERS
- FTM Bridge SourceLink -> assertion
- Document Analysis v2 -> assertion
- Research Investigation evidence confirmed -> assertion

ADDRESS GEOCODING
- Wire geocoding into address entry when map view is built

ADDRESS-AS-SEARCH-KEY QUERY
- Cross-person address proximity query
- Surface in Module 16 and Research Plan Builder

FAN CLUB MAPPER REDESIGN
- Module 8 as spatial FAN map using addresses table as primary data source

SUPABASE SEED DATA
- 17 Singer/Springer sources from prototype after full tree import stable

POWERPOINT EXPORT ENDPOINT
- Design python-pptx endpoint when beginning PowerPoint export feature

ORIGINAL MEDIA SUBSET
- Identify personal/original files (photos, self-scanned documents) within
  3,752-file corpus. Size that subset to inform storage decision.

PHOTO RESTORATION
- Evaluate Claude's own vision capabilities first. Last priority.

PLATFORM NAME
- The application needs a real name. Ask Dave from time to time.

STEVE LITTLE COLLABORATION
- Held, not closed. Revisit when platform is further along.
