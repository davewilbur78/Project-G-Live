Project-G-Live AGENT.md
Version: 2.0.0
Last updated: 2026-05-09 22:00 UTC
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

Current version: 2.0.0

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

## The Modules: Status and Build Order

15 modules. Design docs in /docs/modules/. Build order reflects dependencies.
Do not start a module before its prerequisites are complete.

Status: NOT STARTED / IN DESIGN / PROTOTYPE / BUILD READY / COMPLETE

BUILD STRATEGY: Get Case Study Builder running as a real application as fast
as possible, then build outward. GEDCOM Bridge comes last -- it is onboarding
convenience, not core workflow. The working app does not depend on it.

PHASE 3 BUILD ORDER:

1.  Citation Builder (Module 4) -- NOT STARTED
    Foundation. Manages all sources, EE citations, Three-Layer analysis.
    Required by every module that touches sources. Build first.

2.  Case Study Builder (Module 10) -- PROTOTYPE COMPLETE (v2)
    Prototype: /prototypes/case_study_builder_v2.html
    Test case: Jacob Singer / Yankel Springer identity proof (2026-05-07)
    Flagship. Build immediately after Citation Builder.

3.  Document Analysis Worksheet (Module 5) -- NOT STARTED
    Feeds sources into Case Study Builder. Requires: Citation Builder.

4.  Research Log (Module 3) -- NOT STARTED
    Requires: Citation Builder.

5.  Research Plan Builder (Module 2) -- NOT STARTED
    Requires: Citation Builder.

6.  Source Conflict Resolver (Module 6) -- NOT STARTED
    Requires: Citation Builder, sources in Supabase.

7.  Timeline Builder (Module 7) -- NOT STARTED
    Requires: Citation Builder, facts in Supabase.

8.  Research Report Writer (Module 9) -- NOT STARTED
    Requires: most modules above.

9.  GEDCOM Bridge (Module 1) -- NOT STARTED
    Onboarding layer. Build after core app is working.

10. Family Group Sheet Builder (Module 11) -- NOT STARTED
    Requires: Citation Builder, persons in Supabase.

11. FAN Club Mapper (Module 8) -- NOT STARTED
    Requires: Citation Builder, persons in Supabase.

12. DNA Evidence Tracker (Module 14) -- NOT STARTED
    Requires: Citation Builder, persons in Supabase.

13. Correspondence Log (Module 12) -- NOT STARTED. Largely standalone.

14. File Naming System (Module 13) -- NOT STARTED. Standalone.

15. Research To-Do Tracker (Module 15) -- NOT STARTED. Standalone.

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

- Frontend: Next.js with React and Tailwind CSS
- Backend: Next.js API routes
- Database: Supabase (PostgreSQL)
- AI: Anthropic Claude API (use current Sonnet model at time of build)
- File storage: Supabase storage bucket
- PowerPoint export: python-pptx via lightweight Python endpoint
- Deployment: Vercel

---

## Build Path

Phase 1: Documentation and architecture -- COMPLETE
Phase 2: Prototype artifacts to test interview logic -- ACTIVE
  Case Study Builder prototype v2 complete (2026-05-07)
Phase 3: Full web app built module by module
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
/src/               -- Application source code (unstubbed -- Phase 3 first task)
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

TIMESTAMP last updated: 2026-05-09 22:00 UTC by Claude

Build phase: Phase 2 active
Last committed substantive work: Case Study Builder prototype v2 -- 2026-05-07
Module 10 test case: Jacob Singer / Yankel Springer identity proof
  Research record: /docs/research/Singer_Springer_Research_Record.docx
  Prototype: /prototypes/case_study_builder_v2.html
Supabase schema: /docs/architecture.md (table names defined; expand to column-level before Phase 3)
AGENT.md: v2.0.0 -- lean Claude-native rewrite committed 2026-05-09

---

## Backlog

STUB src/ DIRECTORY
First task of first Phase 3 BUILD session. Run Next.js App Router scaffold,
add Supabase client configuration. Update architecture.md with folder conventions.

EXPAND SUPABASE SCHEMA
/docs/architecture.md has table names. Expand to full column-level specification
for all tables before building any data-touching module.

SOURCE CONFLICT RESOLVER SCHEMA
The `conflicts` table is TBD. Design before building Module 6.

CASE STUDY BUILDER SCHEMA
Case study storage table is TBD. Design before full production build of Module 10.

DOCUMENT VIEWER
Source images render inline in the source record panel.
Stored in Supabase, displayed alongside the citation and analysis.

REASONABLY EXHAUSTIVE SEARCH CHECKLIST
Dedicated stage in Case Study Builder between Evidence Chain and Conflict Analysis.
Add to Module 10 design doc before full build begins.

CLAUDE.AI PROJECT INSTRUCTIONS
Update the claude.ai project settings for Project-G-Live to read:
"This is Project-G-Live. At session start, read AGENT.md from the repo
(use the GitHub connector), confirm the version and date in your own words,
fetch the most recent session snapshot from /sessions/, then ask for session
posture: BUILD, FIX, or EXPLORE. Do not begin any work until posture is confirmed."
