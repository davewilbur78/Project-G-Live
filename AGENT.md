Project-G-Live AGENT.md
Version: 1.3.0
Last updated: 2026-05-08 07:00 UTC
Last updated by: Claude

FETCH METHOD: GitHub API only.
https://api.github.com/repos/davewilbur78/Project-G-Live/contents/AGENT.md
The response is JSON. Decode the base64 content field to read this file.
Never use raw.githubusercontent.com -- CDN-cached and unreliable.

---

## TABLE OF CONTENTS

1. What This File Is
2. Why This Repo Exists
3. AI Platform Hierarchy and Resource Discipline
4. Persistent Memory Architecture
5. Session Start Protocol and Boot Handshake
6. Session Posture System
7. Signal Vocabulary
8. Session Memory Architecture
9. Restoration Prompt
10. Handoff Protocol
11. Session Close Protocol
12. Versioning
13. Project-G-Live: What This Is
14. The Modules: Status and Build Order
15. Prompt Engines
16. Tech Stack
17. Build Path
18. Coding Standards
19. Platform Output Types
20. Source and Citation Rules
21. Repository Structure
22. Static Rules
23. Project State (Dynamic -- updated each session close)
24. Backlog

---

## What This File Is

This is the single source of truth for Project-G-Live. One file. One authority.
Everything an AI needs to operate on this project lives here. No other file
overrides this one. No architecture docs, no supplementary rules files, no
platform-specific instruction sets. Here and only here.

Any AI beginning a session must read this file completely before doing anything
else. Nothing in any AI platform's memory, project instructions, or cached
context overrides what is written here.

At session start, also fetch the sessions index and most recent snapshot using
the literal URLs in the README.md Boot URLs section. Use those URLs exactly as
written. Do not construct URLs from decoded content.

---

## Why This Repo Exists

Project-G was the original development repo. It used CLAUDE.md as its
instruction set -- a name that implied ownership by one AI platform. It also
accumulated rules, architecture docs, and supplementary files that created
confusion about what was authoritative.

Project-G-Live replaces that model with three key changes:

1. AI-agnostic by design. Any AI can do anything on this project at any time.
   The user chooses freely. No restructuring required when switching platforms.

2. GitHub as persistent memory. AI platforms are stateless. The repo solves
   this. Everything is committed. The repo is always the current truth.
   Nothing lives only in a context window.

3. One file, one authority. All operating rules live in AGENT.md. No sprawl.
   No hierarchy confusion. An AI reading this file has everything it needs.

All content from Project-G v3.0.4 was preserved.

---

## AI Platform Hierarchy and Resource Discipline

### Platform Hierarchy

Claude (claude.ai) is the primary platform for this project. Claude handles:
- All application build work
- Deep reasoning on research problems
- Module design and architecture decisions
- Complex proof analysis
- Any work requiring sustained context across a long session

Perplexity is the designated fallback when Claude session limits are hit.
Perplexity also handles repo maintenance work when appropriate:
- Committing session snapshots
- Updating AGENT.md
- Writing CHANGELOG entries
- Any session where the primary need is GitHub read/write

Claude Code handles local build work when required: running the application,
testing, file system operations.

No platform is forbidden from any task. These are guidelines for efficient
resource use, not restrictions. The user decides which platform to use at
any moment.

### Resource Discipline

Claude has strict session limits. Do not burn Claude session budget on work
other tools do better or cheaper.

The rule: if the primary work of a task is GitHub read/write or repo
maintenance, prefer Perplexity. If the primary work requires deep reasoning,
sustained context, or application building, use Claude.

Do not feed large amounts of text back and forth in chat when a file or
committed artifact would be more efficient. The exception is the boot
handshake, which requires a paste or file attachment by design.

### Important Note on Claude and GitHub

Claude's GitHub connector in claude.ai is subject to caching issues. Live
reads of recently updated files cannot be guaranteed. For Claude sessions,
AGENT.md must be delivered by one of two methods:

Option 1 (preferred): File attachment. Upload the current AGENT.md as a file
at session start. Claude reads it natively. No network call required.

Option 2: Paste. Paste the full AGENT.md content into the chat at session start.

The claude.ai project/Space instructions must tell Claude: "Wait for the user
to provide AGENT.md as a file attachment or paste before doing anything.
Execute the boot handshake immediately upon receiving it."

---

## Persistent Memory Architecture

This project uses GitHub as its persistent memory system. AI platforms have
no memory between sessions. The repo solves this.

The loop:
  1. AI reads AGENT.md at session start (via file attachment, paste, or API fetch)
  2. AI fetches SESSIONS-INDEX.md and most recent session snapshot using the
     literal URLs in README.md Boot URLs section
  3. AI reads additional repo files as needed for context
  4. AI does work -- planning, writing, building
  5. AI commits all work products to GitHub before session ends
  6. Next session: any AI starts at step 1 and picks up exactly where the
     last session left off

Nothing lives only in an AI's context window. Everything is committed.
The repo is always the current truth.

---

## Session Start Protocol and Boot Handshake

Every session -- regardless of which AI is running it -- must follow this
protocol in order before doing anything else.

Step 1: Read AGENT.md completely.
TIMESTAMP the receipt: YYYY-MM-DD HH:MM UTC

Step 2: Fetch SESSIONS-INDEX.md and the most recent session snapshot using
the literal URLs in README.md Boot URLs section. Read both.

Step 3: Execute the boot handshake. State exactly this, nothing else:

  "AGENT.md received. Version [X.X.X], last updated [YYYY-MM-DD HH:MM UTC]
  by [AI name]. Ready for posture confirmation."

Do not summarize. Do not begin work. Do not ask questions. State the version
and timestamp exactly as written in this file, then stop and wait.

Step 4: Wait for the user to confirm the handshake. If the user says the
version or timestamp is wrong, stop. Ask them to provide the correct file.
Do not proceed with a stale or incorrect version under any circumstances.

Step 5: Ask the user for session posture.
List the three postures. Wait for confirmation.
Do not proceed until the user explicitly confirms a posture.

THE AI MUST NOT INFER SESSION DIRECTION FROM PROJECT STATE. Do not look at
the build path, see a phase marked active, and begin building. Do not assume.
Ask. Wait. This rule exists because an AI that boots and immediately tries
to build the next thing will mix build output into a session meant to fix
something broken, making the problem worse.

---

## Session Posture System

Every session declares a posture before any work begins. Postures are not
locks. A session may contain multiple phases. Transitions are always
permitted with an explicit declaration and TIMESTAMP.

### The Three Postures

BUILD -- Moving the project forward. New code, new files, new prototypes,
new specs, committed artifacts of any kind.

FIX -- Something is wrong. Do not touch anything outside the problem
boundary until the problem is resolved. Do not add features. Do not continue
build work. Diagnose and fix only.

EXPLORE -- Thinking, designing, deciding. No build output. Specs, design
documents, and AGENT.md updates are permitted. This is the right posture
when direction is uncertain or when architectural decisions need to be made
before building.

### Posture Transitions

Declare every transition explicitly with a TIMESTAMP. Format:

  POSTURE TRANSITION -- TIMESTAMP: YYYY-MM-DD HH:MM UTC
  FROM: [posture]
  TO: [posture]
  REASON: [one sentence]

When transitioning OUT of BUILD, commit all work produced in that phase
before the transition is declared. Do not carry uncommitted build work
across a posture boundary.

Transitions do not require opening a new thread. Continuity is the point.
Stay in the session. Declare and continue.

---

## Signal Vocabulary

Certain phrases from the user are system signals, not instructions. Any AI
on this project must recognize these and execute the corresponding protocol
immediately -- before any other response. Execute first. Do not comment first.

### Exit Signals
Phrases: "i have to go" / "going to bed" / "leaving for dinner" /
"stepping away" / "brb" / "i have to leave" / "gotta run" /
"have to go to bed now" / "leaving for dinner now"

Execute immediately in this order -- no questions asked:
1. TIMESTAMP the signal event
2. Name exactly what work was in motion at this moment
3. Commit all uncommitted work to wip/ branch
4. Write full session snapshot to /sessions/ with TIMESTAMP
5. Generate restoration prompt
6. Confirm: "Session preserved. [filename] committed.
   Restoration prompt ready when you return."

### Distress Signals
Phrases: "something is wrong" / "this isn't working" /
"you're going in circles" / "are you okay" / "context window" /
"you're losing it" / "something is off" / "start over"

Execute immediately in this order:
1. TIMESTAMP the signal event
2. STOP all forward work. Name exactly what was in motion at this moment.
   Do not let the frame drop.
3. Commit all in-progress work to wip/ branch with TIMESTAMP
4. Write full session snapshot to /sessions/
5. Generate restoration prompt
6. Report context window status honestly
7. Ask the user to describe what feels wrong
8. Do not resume forward work until user confirms direction

### Health Check Signals
Phrases: "how are we doing" / "check yourself" / "context check" /
"where are we" / "status"

Execute:
1. TIMESTAMP the check
2. Report: estimated context load, what has been done this session with
   TIMESTAMPs, anything that feels degraded, recommendation -- continue
   or checkpoint

### Transcript Signals
Phrases: "save this conversation" / "preserve this" /
"pull the transcript" / "this is important, log it"

Execute:
1. Write the most detailed possible session log -- not a summary. A full
   reconstruction with complete decision trail, all reasoning, all rejected
   options, all open threads. With TIMESTAMPs on every element.
2. Commit to /sessions/ immediately
3. Confirm with filename and TIMESTAMP

### wip/ Branch Signal
Phrases: "wip is getting messy" / "clean up the branch" / "merge wip"

Execute:
1. TIMESTAMP the signal event
2. Review what is currently in wip/ branch
3. Identify what is complete and ready to merge to main
4. Propose a merge plan to the user
5. Wait for confirmation before merging anything
6. After confirmed merge: note in CHANGELOG, reset wip/ branch

---

## Session Memory Architecture

### TIMESTAMP Is Non-Negotiable

Every artifact, decision, commit, snapshot, signal event, and restoration
prompt carries a full datetime to the minute in UTC.
Format: YYYY-MM-DD HH:MM UTC. No exceptions.
A fact without a TIMESTAMP is a rumor.

### /sessions/ Folder

Every session produces at least one snapshot file committed to /sessions/.
Files are named by datetime: SESSION-YYYY-MM-DD-HHMM-UTC.md

Session snapshots are NEVER deleted. NEVER overwritten. The full archive
is a first-class project artifact. It is the project's memory.

SESSIONS-INDEX.md maintains a one-line entry per session:
TIMESTAMP | Posture | AI | one-sentence summary.
Update it every time a new snapshot is committed.

### Session Snapshot Format

  --- SESSION SNAPSHOT ---
  TIMESTAMP: YYYY-MM-DD HH:MM UTC
  Captured by: [AI name and platform]
  Posture at capture: [BUILD / FIX / EXPLORE]
  Trigger: [context checkpoint / exit signal / distress signal /
            transcript request / session close]

  WHAT THIS SESSION WAS DOING
  [2-4 sentences. Not what the project is. What this specific session
  was working on from the moment it opened.]

  STATE AT CAPTURE -- TIMESTAMP: YYYY-MM-DD HH:MM UTC
  [Exact state. What is committed. What exists only in context.
  What is half-built. Reference wip/ branch commit if applicable.]

  DECISIONS MADE THIS SESSION
  TIMESTAMP: YYYY-MM-DD HH:MM UTC -- [decision and reason]
  TIMESTAMP: YYYY-MM-DD HH:MM UTC -- [rejected option and why]

  OPEN THREADS -- TIMESTAMP: YYYY-MM-DD HH:MM UTC
  [Questions mid-air. Tensions unresolved. Things that were about
  to be decided. Be specific.]

  PARTIALLY BUILT WORK
  [If anything exists only in the context window and cannot be committed
  to wip/ branch: reconstruct it fully and completely here. Not a summary.
  Not a description. The actual work -- full draft, complete logic, entire
  structure -- so a future session can continue it, not reverse-engineer it.
  If it can be committed to wip/, do that and reference the commit here.]

  DO NOT DO THIS
  [Explicit list. Wrong turns already taken. Things that look tempting
  but were ruled out. Questions already closed that must not be re-opened.]

  NEXT IMMEDIATE ACTION
  TIMESTAMP: YYYY-MM-DD HH:MM UTC
  [One thing. Specific. Actionable.]
  --- END SNAPSHOT ---

### /wip/ Branch

Any partially built code that exists only in the context window must be
committed to the wip/ branch before session close or any checkpoint.
Even if broken. Even if incomplete.

Broken code in a branch is recoverable.
A description of broken code is archaeology.

Commit message format:
  wip: [what it is] -- TIMESTAMP: YYYY-MM-DD HH:MM UTC

Lifecycle: wip/ commits are picked up in the next BUILD session that
addresses that work. When the work is complete, the user triggers a merge
using the wip/ Branch Signal. After confirmed merge: note in CHANGELOG,
reset wip/ branch. wip/ is always a working scratch space, never permanent.

### Context Window Pulse

Context window health is monitored actively throughout every session.
The AI does not wait until the window is full.

At approximately 60% context consumption:
Write a session snapshot to /sessions/. Commit it. Continue if healthy.
Note the checkpoint in the next response to the user.

At approximately 80% context consumption:
Write another snapshot. Commit everything including wip/ branch.
Present context status explicitly to user.
Ask: "Context window is at approximately 80%. Continue or checkpoint and close?"

If the window is critically full:
Execute the full distress protocol immediately. Do not wait for a signal.

Important: AI self-reporting of context fill percentage is unreliable.
Err toward early checkpoints. The user's health check signals are more
reliable indicators of context degradation than AI self-assessment.

---

## Restoration Prompt

The restoration prompt is the most critical artifact produced by any
checkpoint or distress protocol. It is written carefully and precisely --
not quickly. It is the last thing produced in a capture sequence, after
all commits are done.

A new thread receiving a restoration prompt must not proceed until the user
confirms it is accurate. The final lines of every restoration prompt are a
confirmation gate. The AI does not move until the user says yes.

### Restoration Prompt Format

  --- RESTORATION PROMPT ---
  TIMESTAMP: YYYY-MM-DD HH:MM UTC
  Generated by: [AI name and platform]
  Restoring from: [/sessions/SESSION-filename.md]

  PROJECT STATE
  Version: [current AGENT.md version]
  Build phase: [current phase]
  Last clean commit: [TIMESTAMP] -- [commit message]
  WIP branch commit: [TIMESTAMP and description, or "none"]

  WHAT THIS SESSION WAS DOING
  [Precise statement of the session's work. Specific enough to re-enter
  without re-reading everything.]

  DECISION TRAIL -- this session only, chronological
  TIMESTAMP: [time] -- [decision and reason]
  TIMESTAMP: [time] -- [rejected option and why]

  OPEN THREADS
  [Every question mid-air at time of capture. Specific. Do not summarize
  -- name each thread distinctly.]

  PARTIALLY BUILT WORK
  [Reference to wip/ branch commit with TIMESTAMP, or full reconstruction
  if not committed. Complete work, not descriptions.]

  DO NOT DO THIS
  [What has already been tried and ruled out. What questions are already
  closed. What tempting wrong turns exist in this context.]

  NEXT IMMEDIATE ACTION
  [One thing. Specific. Not a list.]

  CONFIRMATION REQUIRED
  Does this match your understanding of where we were?
  Do not take any action until the user confirms.
  --- END RESTORATION PROMPT ---

---

## Handoff Protocol

When a session ends and the next session may use a different AI, produce
a handoff block. Always include a pointer to the session snapshot so the
receiving AI can read full context rather than relying on the summary.

  --- HANDOFF ---
  Session closed by: [AI name and platform]
  TIMESTAMP: YYYY-MM-DD HH:MM UTC
  Posture(s) this session: [postures used, in order]
  Version after this session: [version number]
  Session snapshot: [/sessions/SESSION-filename.md]
  What was done: [2-4 sentence summary]
  What is next: [the single most important next action]
  Claude Code instructions: [explicit step-by-step terminal/git commands
    if the next step requires local build work -- OMIT THIS FIELD ENTIRELY
    if local build work is not required. Do not write "N/A".]
  --- END HANDOFF ---

---

## Session Close Protocol

Mandatory at the end of every session. No exceptions.

Step 1:  Declare session close with TIMESTAMP.
Step 2:  Commit all work products to GitHub.
Step 3:  Commit wip/ branch if any partially built work exists.
Step 4:  Write final session snapshot to /sessions/.
Step 5:  Update SESSIONS-INDEX.md with this session's entry.
Step 6:  Update AGENT.md version number and last updated datetime.
Step 7:  Write a CHANGELOG.md entry for this session.
Step 8:  Commit AGENT.md, CHANGELOG.md, and session files.
Step 9:  Update README.md Boot URLs section with the literal API URL
         of this session's snapshot file. This is mandatory. The next
         AI to boot needs this URL to retrieve the snapshot.
Step 10: Produce the handoff block.
Step 11: Verify the committed version by fetching AGENT.md via API.
         Confirm the version number matches before declaring closed.

---

## Versioning

Semantic versioning: MAJOR.MINOR.PATCH
- PATCH: small fixes, doc updates within a session
- MINOR: completed prototype, significant new feature, or meaningful
  architectural change to the operating model
- MAJOR: named product launch

Datetime format for all timestamps: YYYY-MM-DD HH:MM UTC
Date-only stamps are not permitted. Every timestamp must include time
to the minute in UTC.

Current version: 1.3.0

---

# Project-G-Live: Personal Genealogy Operations Platform

## What This Is

Project-G-Live is a personal, private web application supporting serious
genealogical research and professional development toward BCG certification.
Built for one user only. Never to be distributed or sold. A working and
documentation layer that sits on top of existing tools like Ancestry.com
and FamilyTreeMaker -- not a replacement for them.

The platform is a suite of modular research tools that help an aspiring
professional genealogist apply professional-grade methodology in daily
research practice. Everything in this system follows the Genealogical
Proof Standard (GPS), translated into plain language.

---

## The Modules: Status and Build Order

The platform has 15 modules. Each has a design document in /docs/modules/.
Build order reflects dependencies -- earlier modules are prerequisites for
later ones. Do not start a module before its prerequisites are complete.

Status tags: NOT STARTED / IN DESIGN / PROTOTYPE / BUILD READY / COMPLETE

BUILD STRATEGY

The Case Study Builder prototype (v2) is complete and proven. It is the
flagship. The build strategy for Phase 3 is to get Case Study Builder
running as a real application as fast as possible, then build outward
from there. Every module built before it serves it directly.

The GEDCOM Bridge is intentionally placed later. It is an onboarding
convenience -- it pre-populates data from existing research. It is not
required for the core research workflow. Build the working app first;
bring existing data in after the core is proven.

RECOMMENDED BUILD ORDER FOR PHASE 3:

1.  Citation Builder (Module 4) -- NOT STARTED
    Foundation. Manages all sources, EE citations, Three-Layer analysis.
    Required by Case Study Builder and every module that touches sources.
    Build first. No other module can function without it.

2.  Case Study Builder (Module 10) -- PROTOTYPE COMPLETE (v2)
    Prototype completed 2026-05-07. Test case: Jacob Singer / Yankel
    Springer identity proof. Prototype file: /prototypes/case_study_builder_v2.html
    This is the flagship. Build the real app version immediately after
    Citation Builder. The prototype proves the UX -- translate it to
    the full Next.js / Supabase stack.

3.  Document Analysis Worksheet (Module 5) -- NOT STARTED
    Feeds sources into Case Study Builder. Requires: Citation Builder.

4.  Research Log (Module 3) -- NOT STARTED
    Tracks research activity. Requires: Citation Builder.

5.  Research Plan Builder (Module 2) -- NOT STARTED
    Planning layer on top of a working research system.
    Requires: Citation Builder.

6.  Source Conflict Resolver (Module 6) -- NOT STARTED
    Requires: Citation Builder, sources in Supabase.

7.  Timeline Builder (Module 7) -- NOT STARTED
    Requires: Citation Builder, facts and sources in Supabase.

8.  Research Report Writer (Module 9) -- NOT STARTED
    Requires: most modules above.

9.  GEDCOM Bridge (Module 1) -- NOT STARTED
    Onboarding layer. Pre-populates persons and sources from
    FamilyTreeMaker GEDCOM exports. Build after the core app is
    working -- not before. The working app does not depend on it.

10. Family Group Sheet Builder (Module 11) -- NOT STARTED
    Requires: Citation Builder, persons in Supabase.

11. FAN Club Mapper (Module 8) -- NOT STARTED
    Requires: Citation Builder, persons in Supabase.

12. DNA Evidence Tracker (Module 14) -- NOT STARTED
    Requires: Citation Builder, persons in Supabase.

13. Correspondence Log (Module 12) -- NOT STARTED
    Largely standalone.

14. File Naming System (Module 13) -- NOT STARTED
    Standalone.

15. Research To-Do Tracker (Module 15) -- NOT STARTED
    Standalone.

---

## Prompt Engines (Third-Party)

Open-source prompts from Steve Little's Open-Genealogy project
(github.com/DigitalArchivst/Open-Genealogy), CC BY-NC-SA 4.0,
used here for personal non-commercial research only.

Prompts in use:
- OCR-HTR Transcription Tool v08
- Fact Extractor v4
- Fact Narrator v4
- GEDCOM Analysis assistant
- Image Citation Builder v2
- Chat Conversation Abstractor v2
- Research Agent Assignment v2.1
- GRA v8.5c (GPS enforcement layer)

---

## Tech Stack

- Frontend: Next.js with React and Tailwind CSS
- Backend: Next.js API routes
- Database: Supabase (PostgreSQL)
- AI: Anthropic Claude API
  Use the current Sonnet model at time of build.
  Do not hardcode a specific model string without noting it as a
  reference point that will require updating.
- File storage: Supabase storage bucket
- PowerPoint export: python-pptx via lightweight Python endpoint
- Deployment: Vercel

---

## Build Path

Phase 1: Documentation and architecture -- COMPLETE

Phase 2: Prototype artifacts to test interview logic -- ACTIVE
  - Case Study Builder prototype v2 complete (2026-05-07)
  - Seed additional prototypes as needed before Phase 3 begins

Phase 3: Full web app built module by module
  Supabase schema reference: /docs/architecture.md contains the current
  table definitions. Review and expand before building any data-touching
  module. Follow the module build order above.

Phase 4: GEDCOM Bridge built as onboarding layer

Phase 5: Case Study Builder with PowerPoint export as flagship

---

## Coding Standards

- Never fabricate genealogical data, citations, sources, people,
  dates, or places
- GPS terminology strictly enforced throughout UI and output
- Sources: Original, Derivative, or Authored only
- Evidence: Direct, Indirect, or Negative only
- Primary/Secondary apply only to Information (informant's knowledge),
  never to sources or evidence
- Every fact must have a source citation attached
- Components are modular -- self-contained, shared data layers
- Supabase schema is the single source of truth for all person and
  source data
- All citations follow Evidence Explained (EE) format
- Every source carries both full citation and short footnote
- Every factual claim in a proof argument carries an inline footnote.
  No naked claims.

---

## Platform Output Types

RESEARCHER / PROFESSIONAL OUTPUT
GPS-compliant language, EE citations, full footnotes, Three-Layer
analysis visible. For BCG submissions, peer review, professional
correspondence.

CLIENT OUTPUT
Plain English narrative. Methodology invisible. No GPS or EE
terminology. Warm and readable. For family members and paying clients.

Both outputs are generated from the same data.

---

## Source and Citation Rules (Firm)

GEDCOM FILES are infrastructure only. Never cited. Never appear in
researcher-facing output. GEDCOM IDs are internal plumbing only.

ANCESTRY TREE LINKS are not sources. Must be flagged and replaced
with the underlying original source.

FAMILYSEARCH ARK IDENTIFIERS are valuable. Preserve in citations
alongside full record description.

INTERNAL PLATFORM IDs are plumbing. Never surface in
researcher-facing output.

---

## Repository Structure

/sessions/        -- Session snapshots and index. Never deleted.
/prototypes/      -- HTML prototype files
/docs/research/   -- Research output files
/docs/modules/    -- Module design documents (15 files, one per module)
/src/             -- Application source code
wip/ branch       -- Partially built work, committed even if broken

Note: /docs/architecture/ and /prompts/ have been retired as of v1.3.0.
All operating model content now lives in AGENT.md. All boot instructions
now live in README.md. If those folders still exist in the repo, their
contents are historical reference only and do not override AGENT.md.

---

## Static Rules

These rules do not change session to session. They are not subject to
revision by any AI without explicit instruction from the user.

- The Greene/Greenspun family line is an active unsolved research
  project. Do not use it as a test case for any module. Do not make
  assumptions about its data. Research decisions on this line belong
  entirely to the user.

- Ancestry.com stays the tree. This platform is the working and
  documentation layer on top of it. Do not attempt to replace or
  replicate the Ancestry tree.

- GEDCOM files are infrastructure. Never cite them. Never surface
  GEDCOM IDs in any output.

- Ancestry tree links are not sources. Flag them. Replace them with
  the underlying original source.

- The platform integrates with an existing Ashkenazi Jewish DNA
  genealogy workflow.

- The user has years of existing research in Ancestry.com and
  FamilyTreeMaker. This platform sits on top of that work, it does
  not replace it.

---

## Project State

This section is updated at every session close. It reflects current
dynamic status only. Do not confuse these facts with the static rules
above.

TIMESTAMP last updated: 2026-05-08 07:00 UTC by Claude

Build phase: Phase 2 active
Last committed work: Case Study Builder prototype v2 -- 2026-05-07
Module 10 test case: Jacob Singer / Yankel Springer identity proof
  -- research record produced 2026-05-07
  -- prototype file: /prototypes/case_study_builder_v2.html
AGENT.md: v1.3.0 pending commit by Perplexity this session
Supabase schema: /docs/architecture.md contains current table definitions
Claude Code local path: /Users/dave/Project-G-Live/
README.md Boot URLs: requires update after this session's snapshot
  is committed

---

## Backlog

Real requirements waiting to be built or resolved. Not ideas -- these
are committed features or necessary infrastructure.

DOCUMENT VIEWER
Source images render inline in the source record panel. Stored in
Supabase, displayed alongside citation. Add to Module 5
(Document Analysis Worksheet) or Module 4 (Citation Builder) design doc.

REASONABLY EXHAUSTIVE SEARCH CHECKLIST
Dedicated stage in Case Study Builder between Evidence Chain and
Conflict Analysis. Add to Module 10 design doc before full build begins.

EXPAND SUPABASE SCHEMA
/docs/architecture.md has the current table list. Before Phase 3
begins, this should be expanded to full column-level specification
for each table. First task of first Phase 3 BUILD session.

SOURCE CONFLICT RESOLVER SCHEMA
The `conflicts` table is listed as TBD in the old architecture.
Needs to be designed and added to /docs/architecture.md before
Module 06 (Source Conflict Resolver) can be built.

CASE STUDY BUILDER SCHEMA
The case study storage table is also TBD. Needs design before
the full production build of Module 10 begins.

RESEARCH RECORD MIGRATION
Singer_Springer_Research_Record.docx exists in the old Project-G
repo at /docs/research/ and must be committed to the same path
in Project-G-Live. This is the primary research artifact for the
Module 10 test case.

CLAUDE.AI PROJECT INSTRUCTIONS
The canonical text instructing Claude to wait for AGENT.md delivery
and execute the boot handshake. Must be saved in the claude.ai project
settings for this project. Draft text:

  "This is Project-G-Live, a personal genealogy operations platform.
  Before doing anything in this session, wait for the user to provide
  AGENT.md -- either as a file attachment or pasted text. When you
  receive it, your first and only response must be:
  'AGENT.md received. Version [X.X.X], last updated
  [YYYY-MM-DD HH:MM UTC] by [AI name]. Ready for posture confirmation.'
  Do not summarize. Do not begin work. Do not ask questions. State the
  version and timestamp exactly as written in the file, then stop and
  wait. When the user confirms the handshake, ask for session posture:
  BUILD, FIX, or EXPLORE. Do not begin any work until posture is
  confirmed."
