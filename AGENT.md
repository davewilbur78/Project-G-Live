Project-G-Live AGENT.md
Version: 2.10.0
Last updated: 2026-05-13 UTC
Last updated by: Claude (claude.ai)

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

Current version: 2.10.0

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
    SQL migrations run in Supabase: 2026-05-12 00:10 UTC.
    Dev server verified clean: 2026-05-12 01:10 UTC (Claude Code cache-fix session).
    Functional smoke test passed: 2026-05-12 (dinner session) by Dave.
    Bug fix 2026-05-13 UTC: persons join used wrong column names (name_given/name_surname)
    instead of actual schema (given_name/surname). List page silently showed empty.
    Fixed in 5 files. Commit: v2.9.1.
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

10. Correspondence Log (Module 12) -- COMPLETE
    TIMESTAMP: 2026-05-12 (dinner session) UTC.
    Tracks all outgoing research inquiries and responses. GPS element 1
    (reasonably exhaustive search). No AI calls in v1.
    correspondence table: recipient_type check constraint, outcome_status check
    constraint, follow_up_needed boolean, FKs to repositories/persons/sources.
    SQL migration: sql/017-correspondence.sql -- LIVE in Supabase.
    2 API routes: /api/correspondence (GET+POST), /api/correspondence/[id]
    (GET+PATCH+DELETE).
    3 pages: list (summary bar, status filter tabs), new, detail (edit toggle,
    two-step delete).
    Smoke test: PASSED 2026-05-13 UTC by Claude Code. All pages 200. API confirmed live.

11. DNA Evidence Tracker (Module 14) -- COMPLETE
    sql/018-dna-tracker.sql LIVE in Supabase.
    2 API routes: /api/dna-matches (GET list, POST create),
                  /api/dna-matches/[id] (GET detail, PATCH update, DELETE).
    3 pages: /dna-matches (list), /dna-matches/new (create), /dna-matches/[id] (detail/edit).
    GPS note enforced: DNA is always corroborating indirect evidence, never standalone proof.
    Designed for Ashkenazi Jewish endogamy context. cM + segments + largest segment tracked.
    Smoke test: PASSED 2026-05-13 UTC by Claude Code.

12. File Naming System (Module 13) -- COMPLETE
    Generator page at /file-naming. No DB (stateless utility).
    1 page: generates GPS-compliant filenames from source metadata fields.
    Smoke test: PASSED 2026-05-13 UTC by Claude Code.

13. FTM Bridge (Module 17) -- PHASE 2 COMPLETE
    Phase 1 commit: f0e3708. Phase 2 commit: 291f786. TIMESTAMP: 2026-05-13 UTC.
    Smoke test: PASSED 2026-05-13 UTC by Claude Code.
      144 persons clean, 0 raw ftm: in visible fields, 0 pipes/slashes in names.
      Aaron Jacob Klein: 19/20 events sourced. Stanley Samuel Kwass: 13/13 sourced.
      Source citations human-readable ("1900 United States Federal Census", etc.).
      Known data quality notes (FTM source artifacts, not code issues):
        "Avraham" -- one person has literal quote characters in display name.
          Source: FTM data-entry artifact. Not a code bug.
        *igdor Gr?er -- one person has mangled name with * and ? characters.
          Source: character encoding artifact for non-ASCII (Yiddish) name in FTM.
          Not a code bug.
        Alt names include primary name -- FTM stores a NAME fact matching the primary.
          Functionally harmless. Not a code bug.
    Direct import pipeline from Family Tree Maker .ftm files into Supabase.
    No GEDCOM intermediate. Uses FTM's own SQLite SEE library to read the
    encrypted database directly.
    Scripts: scripts/ftm-extractor.c (C extractor), scripts/import-ftm.mjs (Node importer).
    Phase 2 live in Supabase: 144 persons, 96 families, 1189 timeline events
    (1117 sourced = 93.8%), 371 sources, 5 repositories.
    Idempotency: FULLY SAFE. Delete-then-reinsert. Zero duplicates on re-run confirmed.
    SourceLink: WIRED. LinkTableID=2 confirmed. GPS evidence chain active in timeline UI.
    Alternate names: IMPORTED. GEDCOM slashes stripped, duplicates removed.
    IsLiving: does NOT exist in FTM 2024 schema (20200615). living=false correct.
    Full tree (~1500 persons): READY TO RUN when synchronized .ftm file is provided.
    Phase 3 (UI here): /ftm-import page with import trigger, status, diff view.

14. Research Report Writer (Module 9) -- NOT STARTED
    Requires: most modules above. Will use Narrative Assistant v3 + Linguistic
    Profiler v3 + voice profile system. Voice profile discussion scheduled.

15. GEDCOM Bridge (Module 1) -- NOT STARTED
    Kept distinct from FTM Bridge (Module 17). Use case: client-provided GEDCOM
    files, data sharing with other researchers, import from tools other than FTM.
    GEDCOM is lossy compared to direct FTM access but remains essential for
    interoperability with clients and external researchers.
    Build after FTM Bridge Phase 2 is stable.

16. Family Group Sheet Builder (Module 11) -- NOT STARTED

17. FAN Club Mapper (Module 8) -- NOT STARTED
    NOTE: Should eventually be redesigned as a spatial FAN map using the
    addresses table as its primary data source. See Address-as-Evidence
    principle and Module 7 design doc.

---

## FTM Bridge -- Encryption, Import Pipeline, and Roadmap

TIMESTAMP established: 2026-05-13 UTC
Reverse-engineered by: Claude Code (claude-opus-4-7)
Session snapshot: sessions/SESSION-2026-05-13-2212-UTC.md

### The Breakthrough

FTM .ftm files use SQLite SEE (SQLite Encryption Extension), NOT SQLCipher.
This is why every prior community attempt to open .ftm files with SQLCipher
tools failed. The encryption was fully reverse-engineered from the
FTMDatabaseFoundation ARM64 binary in a single Claude Code session.

### Encryption Details

  File format:    SQLite SEE (not SQLCipher)
  Activation key: 7bb07b8d471d642e
                  (passed to sqlite3_activate_see() before opening)
  DB password:    aes256:ViDfwQnOAX8IGG5T5xs3yyBOryIqfPu6
                  (39 chars; derived from schema version "20200615" via
                   XOR decode of FTMDataModel binary)
  Schema version: 20200615 (FTM 2024 current schema)
  SQLite source:  Must use FTMDatabaseFoundation.framework's own SQLite/SEE.
                  System sqlite3 and sqlcipher both fail -- wrong engine.
  Framework path: DYLD_FRAMEWORK_PATH=/Applications/Family Tree Maker 2024.app/Contents/Frameworks
  Compile:        clang -arch arm64 -o scripts/ftm-extractor scripts/ftm-extractor.c

  Password is tied to SCHEMA VERSION, not app version. Any file created or
  last saved with FTM 2024 uses the 20200615 password. Older schemas differ:
    Schema >= 20200615: aes256:ViDfwQnOAX8IGG5T5xs3yyBOryIqfPu6  (current)
    Schema >= 20160500: aes256:Ud1lo0OtDABLU63tRhUlLuzAJA8hNZAE
    Schema >= 20160317: aes128:DScnaANSEN6uvDLr3HNN+0VfrPK6YODJ
    Older schemas: offsets documented in SESSION-2026-05-13-2212-UTC.md

### FTM Internal Schema (key tables, 109 total)

  Person, Relationship, ChildRelationship -- core genealogy data
  Fact, FactType -- all events and attributes (polymorphic via LinkTableID)
  Place -- place names in two formats (pipe-delimited and slash-hierarchy)
  MasterSource -- source records (title, author, publisher, repository)
  SourceLink -- GPS evidence chain: connects each Fact to its MasterSource
                with citation detail (page, comment, footnote). WIRED in Phase 2.
                LinkTableID=2 is FTM's internal Fact table ID (confirmed empirically).
  Repository -- repositories
  Note -- RTF-formatted notes linked polymorphically
  MediaFile, MediaLink -- media references (not yet imported)
  PersonExternal -- Ancestry and FamilySearch person IDs (empty in unsync'd trees)

  Date encoding: JDN * 512 + precision_flags. Fully decoded.
  FTM stores attributes (name, sex, cause of death, etc.) as FactClass=257.
  Standard events (birth, death, residence, etc.) are FactClass=263.

### What Is Imported (Phase 2 -- current state)

  Repositories, Persons (with notes, dates, alternate names), Sources (MasterSources),
  Families (with marriage dates/places), Family members (children + partners),
  Timeline events (person facts: birth, death, residence, immigration, etc.)
    with source_id wired via SourceLink (93.8% coverage on test file -- the 6.2%
    without source_id had no SourceLink in FTM itself, not an import gap).

### What Is NOT Imported -- Future Work

  Living flag -- IsLiving column does not exist in FTM 2024 schema (20200615).
    FTM computes it at runtime from death date and birth year. Cannot import directly.
    Future: compute heuristically (no death date + birth year within living range).
  Cause of death (_DCAUSE) -- not yet imported.
  Media files -- needs Supabase storage bucket first.
  PersonExternal (Ancestry/FamilySearch IDs) -- empty in test file (unsynchronized tree).
    Will populate when full synchronized tree is imported. Requires migration 019.

### Known FTM Data Quality Issues (source artifacts, not code bugs)

  TIMESTAMP confirmed: 2026-05-13 UTC (Phase 2 smoke test).
  These exist in the FTM source data and will be present in the full tree import too.

  Quote characters in display names -- e.g., "Avraham" with literal quotes.
    Cause: FTM data-entry artifact. The quotes were typed into FTM directly.
    Impact: cosmetic only. Not a code bug. Do not attempt to strip in importer
    without explicit instruction (could corrupt legitimate data).

  Non-ASCII character corruption -- e.g., *igdor Gr?er.
    Cause: Yiddish or other non-ASCII name stored in FTM with encoding mismatch.
    Impact: cosmetic only. Not a code bug.

  Alt names include primary name -- FTM stores a NAME fact matching the primary name.
    Cause: FTM structure. Harmless. Not a code bug.

### Idempotency Status -- FULLY SAFE AS OF PHASE 2

  Strategy: delete-then-reinsert for FTM-sourced families and timeline_events.
  FTM is always authoritative. Persons use upsert (keyed on ancestry_id).

  Persons:          SAFE (upsert by ancestry_id = "ftm:[ID]")
  Repositories:     SAFE (upsert by name)
  Sources:          SAFE (skips if "FTM Import" marker exists)
  Families:         SAFE (delete-then-reinsert for FTM persons' families)
  Timeline events:  SAFE (delete-then-reinsert for FTM persons' events)

  Acceptance test passed 2026-05-13 UTC: Run 1 and Run 2 produce identical counts.
  96 families, 238 members, 1189 events, 1117 sourced -- identical both runs.

### Running the Importer

  Prerequisites:
    1. Compile: clang -arch arm64 -o scripts/ftm-extractor scripts/ftm-extractor.c
    2. .env.local must have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

  Standard run:
    node scripts/import-ftm.mjs [path-to-ftm-file]
    Default path if omitted: /Users/dave/ftm playground /Mom plus 1 generation.ftm

  Dry run (no writes):    node scripts/import-ftm.mjs --dry-run [path]
  Reuse cached JSON:      node scripts/import-ftm.mjs --skip-extract

  NOTE: Do NOT use --skip-extract after recompiling ftm-extractor.c.
  Always do a fresh extract after any C source change.

### External IDs -- Future Schema (migration 019)

  PersonExternal in FTM stores Ancestry and FamilySearch person IDs for
  synchronized trees. First-class identifiers:
    Ancestry person ID: direct URL into ancestry.com tree profile
    FamilySearch person ID (FSID): short alphanumeric like XXXX-XXX,
      permanent globally unique ID on the FamilySearch world family tree.
      Direct URL: https://www.familysearch.org/tree/person/details/XXXX-XXX

  These will be present when the full synchronized tree is imported.
  Do not confuse FamilySearch ARK IDs (record/document level) with FSIDs
  (person level on the world tree). Both are valuable; they are different things.

  Schema to add when ready (migration 019):
    CREATE TABLE person_external_ids (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      person_id   uuid NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
      provider    text NOT NULL,  -- 'ancestry', 'familysearch', etc.
      external_id text NOT NULL,
      profile_url text,
      created_at  timestamptz DEFAULT now()
    );
    CREATE UNIQUE INDEX ON person_external_ids (person_id, provider);

  Do not add this migration until the full synchronized tree is available.

### Bidirectional Sync -- Long-Range Vision

  TIMESTAMP noted: 2026-05-13 UTC. Status: named, approach TBD. Not near-term.

  The vision: research discoveries made in this platform (document analysis,
  AI fact extraction, case study work) flow back into FTM and ultimately into
  the Ancestry tree. The full loop: FTM in -> research + AI -> discoveries
  -> back into FTM -> sync to Ancestry.

  CRITICAL CONSTRAINT: Do NOT attempt direct writes to .ftm files without
  complete mapping of all 109 internal tables and FTM's integrity constraints.
  Writing behind FTM's back risks corrupting the TreeSync/Ancestry sync state.
  A write that looks correct at the row level could silently break sync.

  Safer paths to explore first:
    1. FTM GEDCOM import -- export changes as GEDCOM, import via FTM's own UI.
       Lossy but safe. Works now. Good for structured data.
    2. FTM media import -- add documents and images via FTM's own interface.
    3. MacKiev API -- MacKiev has worked with partners before (RootsMagic).
       A formal API is not impossible. Monitor.
    4. Full schema mapping -- map all 109 FTM tables before writing anything.

  Key insight: every field imported clean is a field that could potentially
  be written back clean. Preserve FTM field names and values where possible.
  GEDCOM pruning/grafting is known to be lossy -- approach with caution.

### Person Detail Page

  TIMESTAMP noted: 2026-05-13 UTC.
  Status: NEXT BUILD TARGET as of 2026-05-13 UTC.

  No person detail page exists. With 144 real people in Supabase this is now
  a visible gap. Should show: name/dates/places, timeline with sourced events,
  family connections, sources list, external links (when available),
  basic/advanced field toggle.
  Not a numbered module -- a core platform UI component.
  Route: /persons/[id]

---

## Prompt Engine Library

TIMESTAMP established: 2026-05-11 19:15 UTC
TIMESTAMP last updated: 2026-05-12 00:35 UTC
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

Current engine inventory (/prompts/) -- ALL 15 COMMITTED AND LIVE as of 2026-05-12:
  research/gra-v8.5.2c.md                    GPS enforcement base layer
  research/research-agent-assignment-v2.1.md  Research Plan Builder
  research/research-assistant-v8.md           700-line comprehensive GPS research assistant
  transcription/ocr-htr-v08.md               General diplomatic transcription
  transcription/jewish-transcription-v2.md    Jewish document transcription (critical for Ashkenazi research)
  image-analysis/deep-look-v2.md              9-layer forensic image analysis
  image-analysis/hebrew-headstone-helper-v9.md 10-phase headstone analysis with gematria dating
  writing/fact-extractor-v4.md               LABEL: Value extraction from documents
  writing/fact-narrator-v4.md                Assertions to narrative prose
  writing/narrative-assistant-v3.md          GPS-informed narrative (3 modes: new/revision/edit)
  writing/linguistic-profiler-v3.md          Writer voice fingerprinting (powers Layer 2 flywheel)
  writing/lingua-maven-v9.md                 AHD-style language advisor (writing quality)
  writing/conversation-abstractor-v2.md      Session/interview summarization
  writing/document-distiller-v2.md           Document summarization and action extraction
  writing/image-citation-builder-v2.md       Image provenance citation (layered model)

No prompts remain to fetch from upstream. Library is complete.

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
  Module 17 FTM Bridge                no AI engine in v1 (pure data pipeline)

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
TIMESTAMP migrations run in Supabase: 2026-05-12 00:10 UTC
Design spec: docs/architecture/assertions-table.md
SQL migration: sql/015-assertions.sql -- LIVE in Supabase as of 2026-05-12 00:10 UTC.

The assertions table is the connective tissue between sources and conclusions.
Every GPS-classified, source-located atomic fact extracted from any document
produces an assertion record.

Three tables (all live):
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

Note: assertions table is live but has no upstream writers yet.
FTM Bridge Phase 2 (SourceLink wiring) and Document Analysis v2 (AI extraction)
are the intended first writers. When Claude analyzes a scanned document and
extracts facts, those facts should flow into assertions with source_id,
predicate, and extraction_method set.

---

## Tech Stack

- Frontend: Next.js 15 with React 19, App Router, Tailwind CSS
- Backend: Next.js API route handlers (routes live at src/app/api/, not src/api/)
- Database: Supabase (PostgreSQL)
- AI: Anthropic Claude API (claude-sonnet-4-6 -- update when newer model available)
- File storage: Supabase storage bucket
- PowerPoint export: python-pptx via lightweight Python endpoint
- Deployment: Vercel (not yet deployed -- local only as of 2026-05-13)
- FTM import: C extractor + Node.js importer running locally on Dave's Mac
  (ARM64 binary using FTM's own SQLite/SEE -- cannot run on Vercel)

---

## Build Path

Phase 1: Documentation and architecture -- COMPLETE
Phase 2: Prototype artifacts to test interview logic -- COMPLETE
Phase 3: Full web app built module by module -- ACTIVE
  12 of 16 original modules complete + Module 17 Phase 2 (FTM Bridge, fully idempotent, sourced):
  Module 4 (Citation Builder), Module 10 (Case Study Builder),
  Module 5 (Document Analysis Worksheet), Module 3 (Research Log),
  Module 15 (Research To-Do Tracker), Module 2 (Research Plan Builder),
  Module 6 (Source Conflict Resolver), Module 7 (Timeline Builder),
  Module 16 (Research Investigation), Module 12 (Correspondence Log),
  Module 14 (DNA Evidence Tracker), Module 13 (File Naming System),
  Module 17 FTM Bridge Phase 2 (scripts + live data, idempotent, sourced, smoke tested)
Phase 4: GEDCOM Bridge built as onboarding layer (Module 1)
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
- After setValue(), use find() to locate the Run button by ref, then click via ref.
  Do NOT rely on coordinate clicks for the Run button -- coordinates shift.
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

FAMILYSEARCH ARK IDENTIFIERS are record/document-level identifiers.
Preserve in all citations alongside the full record description.
Do not confuse with FamilySearch Person IDs (see below).

FAMILYSEARCH PERSON IDs (FSID) are person-level identifiers on the FamilySearch
world family tree -- short alphanumeric like XXXX-XXX. Permanent and globally unique.
Surface as direct profile links when available via person_external_ids table.

ANCESTRY PERSON IDs are person-level identifiers within a specific Ancestry tree.
Surface as direct profile links when available via person_external_ids table.

INTERNAL PLATFORM IDs are plumbing. Never surface in researcher-facing output.

---

## Dual-AI Workflow

TIMESTAMP established: 2026-05-12 (post-dinner) UTC

Two AI interfaces are active on this project. They share the repo as the
single source of truth. AGENT.md and /sessions/ are the handoff layer.

CLAUDE.AI (this interface)
- Architecture, design decisions, writing new modules
- GitHub connector: reads and writes repo directly
- Session memory system: AGENT.md + /sessions/ snapshots
- Supabase SQL migrations via Claude in Chrome
- Any task requiring cross-session project state

CLAUDE CODE
- Local execution: git pull, npm, TypeScript checks, dev server
- Smoke tests and debugging in the running app
- Diagnosing local environment issues (stale cache, port conflicts, etc.)
- Anything requiring bash or direct filesystem access
- FTM extractor compilation and import runs (local Mac only)
- Reads AGENT.md and /sessions/ at session start for full orientation
- Writes session snapshots to /sessions/ for handoff back to claude.ai

DIVISION OF LABOR IN PRACTICE:
- When a build is complete here, hand smoke test to Claude Code -- do NOT
  give Dave a list of terminal commands to run himself.
- When Claude Code finds a local issue, it documents it in /sessions/ and
  claude.ai picks it up at next session start.
- Neither interface duplicates the other's work.
- Claude Code is fully aware of the project via AGENT.md. No re-briefing needed.

---

## MCP Infrastructure

TIMESTAMP established: 2026-05-12 (post-dinner) UTC
Migrated by: Claude Code (happy accident session)

GitHub MCP now runs via NPX (Node.js directly). No Docker. No GitHub Copilot
subscription required. First run downloads a small package; subsequent runs
use the cache. This replaced the Docker container that was going to sleep
and killing the connector mid-session.

Manager script: ~/.claude/mcp-manager.py
  python3 ~/.claude/mcp-manager.py use npx     -- current mode (recommended)
  python3 ~/.claude/mcp-manager.py use docker  -- original Docker setup (still available)
  python3 ~/.claude/mcp-manager.py use http    -- GitHub HTTP endpoint (not usable, no subscription)
  python3 ~/.claude/mcp-manager.py status      -- check what is active

Config files controlled by the manager:
  ~/Library/Application Support/Claude/claude_desktop_config.json  (claude.ai desktop)
  ~/.claude/settings.json                                           (Claude Code)

The PAT is read from the original Docker backup -- the manager never needs to
ask for it again.

Backup and restore:
  Backup: claude_desktop_config.BACKUP.json (same folder as config)
  To restore: python3 ~/.claude/mcp-manager.py use docker

Full migration plan: ~/.claude/projects/-Users-dave-Project-G-Live/memory/mcp_migration_plan.md

After any mode switch: quit and reopen Claude Desktop for config to take effect.

If the connector goes down: run status check first, then verify the desktop
app was restarted after the last mode switch. No Docker process should be
required for NPX mode.

---

## Local Environment Rules

TIMESTAMP established: 2026-05-10 21:30 UTC
TIMESTAMP stale-cache rule added: 2026-05-12 01:10 UTC

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
- Check for a stale dev server before starting one: `lsof -iTCP:3000`
  If port 3000 is occupied, kill the old process first: `pkill -f "next dev"`
  then restart from `/Users/dave/Project-G-Live/`.
- STALE CACHE RULE: A long-running dev server will serve stale CSS asset hashes
  after new routes, styles, or prompts are added in a separate session. Symptom:
  UI renders as unstyled text or raw HTML; GET on CSS asset returns 404.
  Before assuming a code regression, curl the CSS asset URL from the HTML source.
  If it 404s, the cache is stale -- not a code bug.
  Fix: `pkill -f "next dev"` then `rm -rf .next` then `npm run dev`.
- All repo reads and writes use the GitHub connector directly.
  Claude Code handles local execution only (npm, running the app, git operations).
- After any GitHub connector push, pull locally before assuming files are current:
  `cd /Users/dave/Project-G-Live && git pull`

---

## Repository Structure

/sessions/          -- Session snapshots and index. Never deleted.
/prototypes/        -- HTML prototype files
/scripts/           -- Utility scripts
  ftm-extractor.c   -- C source for FTM SQLite SEE extractor (ARM64; compile before use)
  ftm-extractor     -- Compiled binary (gitignored; rebuild from .c)
  import-ftm.mjs    -- Node.js FTM -> Supabase importer (recurring sync tool, fully idempotent)
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
  015-assertions.sql           -- LIVE in Supabase as of 2026-05-12 00:10 UTC
  016-investigations.sql       -- LIVE in Supabase as of 2026-05-12 00:15 UTC
  017-correspondence.sql       -- LIVE in Supabase as of 2026-05-12 (dinner session) UTC
  018-dna-tracker.sql          -- LIVE in Supabase as of 2026-05-13 UTC
  019-person-external-ids.sql  -- NOT YET WRITTEN -- add when synchronized tree ready
/src/               -- Application source code
  /src/app/         -- Next.js App Router pages and API routes (see module list above)
  /src/lib/
    ai.ts                       -- callWithEngine() + callWithEngineAndHistory() -- 15 engines
    supabase.ts
  /src/types/
    index.ts                    -- COMPLETE as of 2026-05-12 (Claude Code session, commit 25693a7)
                                   Investigation (5 types), Correspondence, DnaMatch all added.
                                   tsc --noEmit clean. tsconfig.json also committed same session.
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

- Do NOT attempt direct writes to .ftm files without explicit decision and full
  mapping of all 109 internal FTM tables. Risk of corrupting TreeSync. See
  FTM Bridge -- Bidirectional Sync section above.

---

## Project State

TIMESTAMP last updated: 2026-05-13 UTC by Claude (claude.ai) -- v2.10.0

Build phase: Phase 3 ACTIVE -- 12 of 16 original modules complete + Module 17 Phase 2

Genealogical data foundation: COMPLETE and LIVE.
  Migrations 001-018 all run in Supabase.
  144 real persons from Dave's family tree live in Supabase (FTM import, smoke tested).
  1117 of 1189 timeline events have source_id wired (GPS evidence chain live, confirmed).
  Importer is fully idempotent. Safe to re-run against any .ftm file.

src/lib/ai.ts: COMPLETE. 15 engines registered and live.

src/types/index.ts: COMPLETE. Investigation (5 types), Correspondence, DnaMatch added.
  tsc --noEmit clean. tsconfig.json committed. All in commit 25693a7.

Prompt engine library: COMPLETE. No files remaining to fetch from upstream.

Module 16 smoke test: PASSED by Dave, 2026-05-12 (dinner session).

MCP infrastructure: NPX mode active. Manager script at ~/.claude/mcp-manager.py.
  Docker removed from active config. Connector stable.

FTM Bridge Phase 2: COMPLETE and SMOKE TESTED. Commit 291f786.
  Idempotency: FULLY SAFE. SourceLink: WIRED. Alt names: IMPORTED. Smoke test: PASSED.
  Full tree (~1500 persons): READY when synchronized .ftm file is provided.

What still needs to happen (priority order):
1. Person detail page -- /persons/[id]. Core UI component. NEXT BUILD TARGET.
2. Run full synchronized tree when .ftm file is provided.
3. FTM Bridge Phase 3 UI: /ftm-import page.
4. Deployment: Vercel setup, production environment variables, deployment config.
5. Supabase backups: point-in-time recovery or periodic export snapshots.
6. Voice profile discussion (required before Module 9 begins).
7. Modules 9, 1, 11, 8 (4 original modules remaining).
8. migration 019 (person_external_ids) after synchronized tree import.
9. Supabase seed data (Singer/Springer sources from prototype).

Next immediate action:
  TIMESTAMP: 2026-05-13 UTC
  BUILD person detail page (/persons/[id]): name/dates/places panel, timeline
  with sourced events, family connections, sources list.
  claude.ai BUILD session.

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

FTM BRIDGE PHASE 3 (UI -- claude.ai)
- /ftm-import page: trigger import, show last import timestamp and record counts.
- Import diff view: what was added vs updated since last run.
- Basic / Advanced person field view: GPS-critical fields prominent,
  FTM-rich fields (cause of death, custom facts, etc.) behind expand.

FTM BRIDGE FUTURE
- Living flag: compute heuristically from death date absence + birth year range.
  IsLiving does not exist in FTM 2024 schema -- must be derived.
- Scale testing: run against full ~1500-person synchronized tree.
- person_external_ids: migration 019, wire into importer for PersonExternal data.
  Deferred until synchronized tree is imported.

PERSON DETAIL PAGE
No person detail page exists. With 144 real persons in Supabase this is now visible.
Should show: name/dates/places panel, timeline with sourced events, family connections,
sources list, external links (Ancestry/FamilySearch when available), basic/advanced toggle.
Not a numbered module -- a core platform UI component. Route: /persons/[id]

DEPLOYMENT AND INFRASTRUCTURE
- Vercel deployment: not yet done. App runs locally only.
- Production environment variables: NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY -- set in Vercel dashboard.
- FTM extractor is ARM64 and tied to local FTM installation. It cannot
  deploy to Vercel. Only the import script (writing to Supabase) runs in cloud.
- Supabase backups: configure point-in-time recovery on Supabase Pro plan,
  or set up periodic export snapshots to a controlled location.

DATA PROVENANCE AND DEDUPLICATION
- Multiple data sources will coexist: FTM imports, GEDCOM imports, manual entries,
  AI-extracted assertions. Each needs a clear provenance marker.
- Current markers: ancestry_id="ftm:[ID]" for FTM persons; changedby="FTM Import".
- Deduplication strategy for full tree vs partial imports: persons keyed on
  ancestry_id, but families and events need stable keys. Design before full run.
- GEDCOM imports of the same person as FTM imports must not create duplicates.
  person_external_ids approach (provider + external_id as unique key) may solve this.

SUPABASE SEED DATA
After full tree import stable, seed with the 17 Singer/Springer sources
from the prototype. These are the real research sources that prove Case Study
Builder workflow with actual data.

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
Module 5 v1 uses manual transcription entry. Deferred until Supabase storage bucket.
When ready: document upload -> OCR-HTR v08 -> Fact Extractor v4 -> assertions table.
This is also the pipeline for populating FTM-rich fields from scanned documents --
part of the broader bidirectional vision (extracted facts -> back into FTM via GEDCOM).

ASSERTIONS TABLE UPSTREAM WRITERS
Assertions table is live but nothing writes to it. Planned first writers:
- FTM Bridge (SourceLink -> assertion per fact-source connection)
- Document Analysis Worksheet v2 (AI extraction -> assertion per extracted fact)
- Research Investigation (evidence confirmed -> assertion)

ADDRESS GEOCODING
The addresses table has lat/lng fields. Wire a geocoding step into address entry
when the map view is built.

ADDRESS-AS-SEARCH-KEY QUERY
Cross-person address proximity query: "who else in this database lived near this
address in this time range?" Surface in Module 16 and Research Plan Builder.

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
- gps_stage_reached on case_studies: CONFIRMED FIXED. sql/002 expanded the check
  constraint to 1-6 and was run in Supabase. Open thread was stale -- closed
  2026-05-12 (Claude Code session). No migration needed.
- Dual-date naming inconsistency: migration 008 uses event_date + date_display.
  Migrations 009+ use _display + _sort. Both work. Future cosmetic cleanup.

STANDALONE / SHAREABLE PRODUCT VISION
TIMESTAMP noted: 2026-05-10 19:45 UTC. Long-range idea only. Not a build concern now.

Steve collaboration is held, not closed. Revisit when platform is further along.

PLATFORM NAME
TIMESTAMP noted: 2026-05-10 22:45 UTC.
The application needs a real name. Name is pending. Ask the user about this from time to time.
