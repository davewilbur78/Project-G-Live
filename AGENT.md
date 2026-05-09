Project-G-Live AGENT.md
Version: 1.2.0
Last updated: 2026-05-08 23:31 UTC
Last updated by: Perplexity

FETCH METHOD: GitHub API only.
https://api.github.com/repos/davewilbur78/Project-G-Live/contents/AGENT.md
The response is JSON. Decode the base64 content field to read this file.
Never use raw.githubusercontent.com -- it is CDN-cached and unreliable.

---

## TABLE OF CONTENTS

1. What This File Is
2. Why This Repo Exists
3. AI-Agnostic Operating Principle
4. Persistent Memory Architecture
5. Session Start Protocol
6. Session Posture System
7. Signal Vocabulary
8. Session Memory Architecture
9. Restoration Prompt
10. Handoff Protocol
11. Session Close Protocol
12. Versioning
13. Project-G-Live: What This Is
14. The Modules
15. Prompt Engines
16. Tech Stack
17. Build Path
18. Coding Standards
19. Platform Output Types
20. Source and Citation Rules
21. Repository Structure
22. Important Context
23. Wishlist Items

---

## What This File Is

This is the boot file for Project-G-Live. Any AI agent beginning
a session on this project must fetch this file first using the
GitHub API endpoint above. It is the single source of truth for
the project. Nothing in any AI platform's memory, project
instructions, or cached context overrides what is written here.

This file was previously named CLAUDE.md in a repo called
Project-G. It has been renamed AGENT.md and moved to a new
repo called Project-G-Live because this project is now
AI-agnostic. Any AI platform capable of reading from and
writing to GitHub is a full participant. No AI owns this
project. No AI's preferences are baked into the operating
model. The repo is the brain.

Also fetch /sessions/SESSIONS-INDEX.md and the most recent
session snapshot from /sessions/ at boot. These are required
reading alongside AGENT.md.

---

## Why This Repo Exists

Project-G was the original development repo. It used a file
called CLAUDE.md as its instruction set -- a name that implied
ownership by one AI platform. The operating model also assumed
Claude Code as the primary build agent and the user's local
machine as the primary workspace.

Project-G-Live replaces that model with three key changes:

1. AI-agnostic by design. Any AI -- Perplexity, Claude,
   Claude Code, or any future platform -- can do anything
   on this project at any time. The user chooses freely.
   No restructuring required when switching.

2. GitHub as persistent memory. AI platforms have no memory
   between sessions. The repo solves this. Everything is
   committed. The repo is always the current truth. No work
   lives only in a context window.

3. Perplexity as a direct participant. Perplexity can read
   from and write directly to this GitHub repo via the GitHub
   API -- without needing Claude Code or the user's local
   machine as an intermediary. This means planning, design,
   documentation, and AGENT.md updates can all happen in a
   Perplexity session and be committed directly. Claude Code
   is reserved for local build work that requires it.

All content from Project-G v3.0.4 was preserved in full.

---

## AI-Agnostic Operating Principle

Any AI can do anything on this project:
- Read, plan, design, write specs
- Create or update files and commit to GitHub
- Build, test, and deploy the application
- Advise the user on decisions

There are no role restrictions between AI platforms. The user
chooses which AI to work with at any moment. That choice can
change at any time without restructuring the project.

Commit attribution: every commit must identify the AI that made
it in the commit author or commit message. This is for
record-keeping only, not restriction.

Examples:
  commit message: "feat: add citation builder stage [Perplexity]"
  commit message: "fix: resolve footnote rendering bug [Claude Code]"

---

## Persistent Memory Architecture

This project uses GitHub as its persistent memory system. AI
platforms have no memory between sessions. The repo solves this.

The loop:
  1. AI fetches AGENT.md fresh via GitHub API at session start
  2. AI fetches SESSIONS-INDEX.md and most recent session snapshot
  3. AI reads the full repo as needed for context
  4. AI does work -- planning, writing, building
  5. AI commits all work products to GitHub before session ends
  6. Next session: any AI starts at step 1 and picks up exactly
     where the last session left off

Nothing lives only in an AI's context window. Everything is
committed. The repo is always the current truth.

---

## Session Start Protocol

Every session -- regardless of which AI is running it -- must:

1. Fetch this file via the GitHub API endpoint above
   TIMESTAMP the fetch: YYYY-MM-DD HH:MM UTC

2. Fetch /sessions/SESSIONS-INDEX.md and the most recent
   session snapshot from /sessions/

3. Confirm the version number and last updated datetime out loud

4. State which AI is running the session

5. Ask the user: what is the posture for this session?
   List the three postures. Wait for confirmation.
   Do not proceed until the user confirms.

THE AI MUST NOT INFER SESSION DIRECTION FROM PROJECT STATE.
Do not look at the build path, see Phase 2 active, and begin
building. Do not assume. Ask. Wait. This rule exists because
defaulting to build posture compounds problems. An AI that
boots and immediately tries to build the next module will mix
build output into a session meant to fix something broken,
making the problem worse.

---

## Session Posture System

Every session declares a posture before any work begins.
Postures are not locks. A session may contain multiple phases.
Transitions are always permitted with an explicit declaration.

### The Three Postures

BUILD -- Moving the project forward. New code, new files,
new prototypes, new specs, committed artifacts of any kind.

FIX -- Something is wrong. Do not touch anything outside
the problem boundary until the problem is resolved. Do not
add features. Do not continue build work. Diagnose and fix
only.

EXPLORE -- Thinking, designing, deciding. No build output.
Specs, design documents, and AGENT.md updates are permitted.
This is the right posture when direction is uncertain or when
architecture decisions need to be made before building.

### Posture Transitions

Declare every transition explicitly with a TIMESTAMP.
Format:

  POSTURE TRANSITION -- TIMESTAMP: YYYY-MM-DD HH:MM UTC
  FROM: [posture]
  TO: [posture]
  REASON: [one sentence]

When transitioning OUT of BUILD, commit all work produced
in that phase before the transition is declared. Do not carry
uncommitted build work across a posture boundary.

Transitions do not require opening a new thread. Continuity
is the point. Stay in the session. Declare and continue.

---

## Signal Vocabulary

Certain phrases from the user are system signals, not
instructions. Any AI on this project must recognize these
and execute the corresponding protocol immediately -- before
any other response. Do not comment first. Execute first.

The full signal dictionary is in:
/docs/architecture/SIGNAL-VOCABULARY.md

Summary of signal categories and immediate responses:

### Exit Signals
Phrases: "i have to go" / "going to bed" / "leaving for
dinner" / "stepping away" / "brb" / "i have to leave" /
"gotta run" / "have to go to bed now" / "leaving for dinner now"

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
2. STOP all forward work -- but first: name exactly what
   was in motion at this moment. Do not let the frame drop.
3. Commit all in-progress work to wip/ branch with TIMESTAMP
4. Write full session snapshot to /sessions/
5. Generate restoration prompt
6. Report context window status honestly
7. Ask the user to describe what feels wrong
8. Do not resume forward work until user confirms direction

### Health Check Signals
Phrases: "how are we doing" / "check yourself" /
"context check" / "where are we" / "status"

Execute:
1. TIMESTAMP the check
2. Report: estimated context load, what has been done this
   session with TIMESTAMPs, anything that feels degraded,
   recommendation -- continue or checkpoint

### Transcript Signals
Phrases: "save this conversation" / "preserve this" /
"pull the transcript" / "this is important, log it"

Execute:
1. Write the most detailed possible session log -- not a
   summary. A full reconstruction with complete decision
   trail, all reasoning, all rejected options, all open
   threads. With TIMESTAMPs on every element.
2. Commit to /sessions/ immediately
3. Confirm with filename and TIMESTAMP

---

## Session Memory Architecture

### TIMESTAMP Is Non-Negotiable

Every artifact, decision, commit, snapshot, signal event,
and restoration prompt carries a full datetime to the minute
in UTC. Format: YYYY-MM-DD HH:MM UTC. No exceptions.
A fact without a TIMESTAMP is a rumor.

### /sessions/ Folder

Every session produces at least one snapshot file committed
to /sessions/. Files are named by datetime:
SESSION-YYYY-MM-DD-HHMM-UTC.md

Session snapshots are NEVER deleted. NEVER overwritten.
The full archive of session snapshots is a first-class
project artifact. It is the project's memory and mind.

SESSIONS-INDEX.md in /sessions/ maintains a one-line entry
per session: TIMESTAMP, posture, one-sentence summary.
Update it every time a new snapshot is committed.

### Session Snapshot Format

Every field carries a TIMESTAMP.

  --- SESSION SNAPSHOT ---
  TIMESTAMP: YYYY-MM-DD HH:MM UTC
  Captured by: [AI name and platform]
  Posture at capture: [BUILD / FIX / EXPLORE]
  Trigger: [context checkpoint / exit signal / distress
            signal / transcript request / session close]

  WHAT THIS SESSION WAS DOING
  [2-4 sentences. Not what the project is. What this
  specific session was working on from the moment it opened.]

  STATE AT CAPTURE -- TIMESTAMP: YYYY-MM-DD HH:MM UTC
  [Exact state. What is committed. What exists only in
  context. What is half-built. Reference wip/ branch
  commit if applicable.]

  DECISIONS MADE THIS SESSION
  [Each decision on its own line with its own TIMESTAMP]
  TIMESTAMP: YYYY-MM-DD HH:MM UTC -- [decision and reason]
  TIMESTAMP: YYYY-MM-DD HH:MM UTC -- [rejected option and why]

  OPEN THREADS -- TIMESTAMP: YYYY-MM-DD HH:MM UTC
  [Questions mid-air. Tensions unresolved. Things that were
  about to be decided. Be specific.]

  PARTIALLY BUILT WORK
  [If anything exists only in the context window and cannot
  be committed to wip/ branch: reconstruct it fully and
  completely here. Not a summary. Not a description of what
  it does. The actual work -- the full draft, the complete
  logic, the entire structure -- written out so a future
  session can continue it, not reverse-engineer it.
  If it can be committed to wip/, do that and reference
  the commit here instead.]

  DO NOT DO THIS
  [Explicit list. Wrong turns already taken. Things that
  look tempting but were ruled out. Questions already closed
  that must not be re-opened.]

  NEXT IMMEDIATE ACTION
  TIMESTAMP: YYYY-MM-DD HH:MM UTC
  [One thing. Specific. Actionable.]
  --- END SNAPSHOT ---

### /wip/ Branch

Any partially built code that exists only in the context
window must be committed to the wip/ branch before session
close or any checkpoint. Even if broken. Even if incomplete.

Broken code in a branch is recoverable.
A description of broken code is archaeology.

Commit message format:
  wip: [what it is] -- TIMESTAMP: YYYY-MM-DD HH:MM UTC

Lifecycle: wip/ commits are picked up in the next BUILD
session that addresses that work. Once the work is complete
and merged to main, the wip/ commit is noted in CHANGELOG
and the branch is reset. wip/ is always a working scratch
space, never a permanent branch.

### Context Window Pulse

Context window health is monitored actively throughout every
session. The AI does not wait until the window is full.

At approximately 60% context consumption:
  Write a session snapshot to /sessions/. Commit it.
  Continue if the session is healthy.
  Note the checkpoint in the next response to the user.

At approximately 80% context consumption:
  Write another snapshot. Commit everything including
  wip/ branch. Present context status explicitly to user.
  Ask: "Context window is at approximately 80%. Continue
  or checkpoint and close?"

If the window is critically full:
  Execute the full distress protocol immediately.
  Do not wait for a signal from the user.

---

## Restoration Prompt

The restoration prompt is the most critical artifact produced
by any checkpoint or distress protocol. It is written
carefully and precisely -- not quickly. It is the last thing
produced in a capture sequence, after all commits are done.

A new thread receiving a restoration prompt must not proceed
until the user confirms it is accurate. The final line of
every restoration prompt is a confirmation gate. The AI does
not move until the user says yes.

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
  [Precise statement of the session's work. Specific enough
  to re-enter without re-reading everything.]

  DECISION TRAIL -- this session only, chronological
  TIMESTAMP: [time] -- [decision and reason]
  TIMESTAMP: [time] -- [decision and reason]
  TIMESTAMP: [time] -- [rejected option and why]

  OPEN THREADS
  [Every question mid-air at time of capture. Specific.
  Do not summarize -- name each thread distinctly.]

  PARTIALLY BUILT WORK
  [Reference to wip/ branch commit with TIMESTAMP, or full
  reconstruction if not committed. See Session Snapshot
  format for the standard: complete work, not descriptions.]

  DO NOT DO THIS
  [Explicit. What has already been tried and ruled out.
  What questions are already closed. What tempting wrong
  turns exist in this context.]

  NEXT IMMEDIATE ACTION
  [One thing. Specific. Not a list.]

  CONFIRMATION REQUIRED
  Does this match your understanding of where we were?
  Do not take any action until the user confirms.
  --- END RESTORATION PROMPT ---

---

## Handoff Protocol

This project may switch between AI platforms at any time.
When a session ends and the next session may use a different
AI, the current AI must produce a handoff block.

The handoff block always includes a pointer to the session
snapshot committed this session, so the receiving AI can
read the full context rather than relying on the summary.

Handoff block format:

  --- HANDOFF ---
  Session closed by: [AI name and platform]
  TIMESTAMP: YYYY-MM-DD HH:MM UTC
  Posture(s) this session: [postures used, in order]
  Version after this session: [version number]
  Session snapshot: [/sessions/SESSION-filename.md]
  What was done: [2-4 sentence summary]
  What is next: [the single most important next action]
  Claude Code instructions: [explicit step-by-step terminal/git
    commands if the next step requires local build work]
  --- END HANDOFF ---

The Claude Code instructions block is mandatory whenever the
next step involves local development. It must be specific
enough that the user can paste commands directly without
interpretation. Never assume the user knows what to do next.

---

## Session Close Protocol

Mandatory at the end of every session. No exceptions.

Step 1: Declare session close with TIMESTAMP.
Step 2: Commit all work products to GitHub.
Step 3: Commit wip/ branch if any partially built work exists.
Step 4: Write final session snapshot to /sessions/.
Step 5: Update SESSIONS-INDEX.md with this session's entry.
Step 6: Update AGENT.md version number and last updated datetime.
Step 7: Write a CHANGELOG.md entry for this session.
Step 8: Commit AGENT.md, CHANGELOG.md, and session files.
Step 9: Produce the handoff block (see Handoff Protocol).
Step 10: Verify the committed version by fetching:
  https://api.github.com/repos/davewilbur78/Project-G-Live/contents/AGENT.md
  Confirm the version number matches before declaring closed.

---

## Versioning

Semantic versioning: MAJOR.MINOR.PATCH
- PATCH: small fixes, doc updates within a session
- MINOR: completed prototype, significant new feature, or
  meaningful architectural change to the operating model
- MAJOR: named product launch

Datetime format for all timestamps: YYYY-MM-DD HH:MM UTC
Date-only stamps are not permitted. Every timestamp must
include time to the minute in UTC.

Current version: 1.2.0
The AI running each session decides which increment applies
based on what was accomplished.

---

# Project-G-Live: Personal Genealogy Operations Platform

## What This Is

Project-G-Live is a personal, private web application supporting
serious genealogical research and professional development.
It is built for one user only and will never be distributed
or sold. It is a working layer that sits on top of existing
tools like Ancestry.com and FamilyTreeMaker -- not a
replacement for them.

The platform is a suite of modular research tools that help
an aspiring professional genealogist actively working toward
BCG (Board for Certification of Genealogists) certification
apply professional-grade methodology in daily research
practice. Everything in this system follows the Genealogical
Proof Standard (GPS), translated into plain language.

---

## The Modules

The platform has 15 modules. Each has a design document
in docs/modules/.

1.  GEDCOM Bridge
2.  Research Plan Builder
3.  Research Log
4.  Citation Builder
5.  Document Analysis Worksheet
6.  Source Conflict Resolver
7.  Timeline Builder
8.  FAN Club Mapper
9.  Research Report Writer
10. Case Study Builder -- PROTOTYPE COMPLETE (v2) as of 2026-05-07
    Test case: Jacob Singer / Yankel Springer identity proof.
11. Family Group Sheet Builder
12. Correspondence Log
13. File Naming System
14. DNA Evidence Tracker
15. Research To-Do Tracker

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
- AI: Anthropic Claude API (claude-sonnet-4-5)
- File storage: Supabase storage bucket
- PowerPoint export: python-pptx via lightweight Python endpoint
- Deployment: Vercel

---

## Build Path

Phase 1: Documentation and architecture (complete)
Phase 2: Prototype artifacts to test interview logic (active)
         -- Case Study Builder prototype v2 complete
Phase 3: Full web app built module by module
Phase 4: GEDCOM Bridge built as onboarding layer
Phase 5: Case Study Builder with PowerPoint export as flagship

---

## Coding Standards

- Never fabricate genealogical data, citations, sources,
  people, dates, or places
- GPS terminology strictly enforced throughout UI and output
- Sources: Original, Derivative, or Authored only
- Evidence: Direct, Indirect, or Negative only
- Primary/Secondary apply only to Information (informant's
  knowledge), never to sources or evidence
- Every fact must have a source citation attached
- Components are modular -- self-contained, shared data layers
- Supabase schema is the single source of truth for all
  person and source data
- All citations follow Evidence Explained (EE) format
- Every source carries both full citation and short footnote
- Every factual claim in a proof argument carries an inline
  footnote. No naked claims.

---

## Platform Output Types

RESEARCHER / PROFESSIONAL OUTPUT -- GPS-compliant language,
EE citations, full footnotes, Three-Layer analysis visible.
For BCG submissions, peer review, professional correspondence.

CLIENT OUTPUT -- Plain English narrative. Methodology invisible.
No GPS or EE terminology. Warm and readable. For family members
and paying clients.

Both outputs are generated from the same data.

---

## Source and Citation Rules (Firm)

GEDCOM FILES are infrastructure only. Never cited. Never
appear in researcher-facing output. GEDCOM IDs are internal
plumbing only.

ANCESTRY TREE LINKS are not sources. Must be flagged and
replaced with the underlying original source.

FAMILYSEARCH ARK IDENTIFIERS are valuable. Preserve in
citations alongside full record description.

INTERNAL PLATFORM IDs are plumbing. Never surface in
researcher-facing output.

---

## Repository Structure

/sessions/          -- Session snapshots and index. Never deleted.
/prototypes/        -- All HTML prototype files
/docs/research/     -- All research output files
/docs/modules/      -- Module design documents
/docs/architecture/ -- Operating model design documents
/prompts/           -- Canonical session starter prompts
/src/               -- Application source code
wip/ branch         -- Partially built work, committed even broken

---

## Important Context

- User has years of existing research in Ancestry.com and
  FamilyTreeMaker
- User is an aspiring professional genealogist working toward
  BCG certification
- Ancestry stays the tree; this platform is the working and
  documentation layer
- The Greene/Greenspun family line is an active unsolved
  research project -- do not use as a test case
- Platform integrates with an existing Ashkenazi DNA
  genealogy workflow
- The Singer/Springer identity proof (Jacob Singer / Yankel
  Springer) is the Module 10 test case. Full research record
  produced 2026-05-07.

---

## Wishlist Items

DOCUMENT VIEWER -- Source images render inline in the source
record panel. Stored in Supabase, displayed alongside citation.

REASONABLY EXHAUSTIVE SEARCH CHECKLIST -- Dedicated stage in
Case Study Builder between Evidence Chain and Conflict Analysis.

CANONICAL BOOT PROMPT -- A versioned, copy-pasteable session
starter prompt committed to /prompts/ so any new thread on
any platform starts correctly without the user having to
remember or reconstruct the opening instruction.
