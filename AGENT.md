Project-G-Live AGENT.md
Version: 1.0.0
Last updated: 2026-05-08 UTC
Last updated by: Perplexity

FETCH METHOD: GitHub API only.
https://api.github.com/repos/davewilbur78/Project-G-Live/contents/AGENT.md
The response is JSON. Decode the base64 content field to read this file.
Never use raw.githubusercontent.com -- it is CDN-cached and unreliable.

## What This File Is

This is the boot file for Project-G-Live. Any AI agent beginning
a session on this project must fetch this file first using the
GitHub API endpoint above. It is the single source of truth for
the project. Nothing in any AI platform's memory, project
instructions, or cached context overrides what is written here.

This file was previously named CLAUDE.md. It has been renamed
AGENT.md because this project is AI-agnostic. Any AI platform
capable of reading from and writing to GitHub is a full
participant. No AI owns this project. No AI's preferences are
baked into the operating model. The repo is the brain.

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

## Persistent Memory Architecture

This project uses GitHub as its persistent memory system. AI
platforms have no memory between sessions. The repo solves this.

The loop:
  1. AI fetches AGENT.md fresh via GitHub API at session start
  2. AI reads the full repo as needed for context
  3. AI does work -- planning, writing, building
  4. AI commits all work products to GitHub before session ends
  5. Next session: any AI starts at step 1 and picks up exactly
     where the last session left off

Nothing lives only in an AI's context window. Everything is
committed. The repo is always the current truth.

## Session Start Protocol

Every session -- regardless of which AI is running it -- must:

1. Fetch this file via the GitHub API endpoint above
2. Confirm the version number and last updated date out loud
3. State which AI is running the session
4. Ask the user: what is the mode for this session?

Modes:
  BUILD   -- active prototyping or development
  DEBUG   -- diagnosing system, process, or tooling problems
  PLAN    -- architecture and design discussion, no build output
  MODIFY  -- changing something that already exists
  REVIEW  -- reading and evaluating existing work, no output
  TEST    -- running or evaluating a prototype

The AI waits for mode confirmation before doing anything else.

## Mode System

Note: The full behavioral rules for each mode -- what each
permits, restricts, and requires -- have not yet been fully
designed. This is the first agenda item for the next PLAN
session. Do not remove this notice until the full mode design
is written and committed.

What is known so far:
- PLAN mode: discussion and documentation only. No code files
  created. Specs and AGENT.md updates are permitted outputs.
- BUILD mode: code files, prototypes, and application source
  may be created. All output must be committed before session end.
- MODIFY mode: the AI must read the current file before touching
  it. No modifications from memory.
- REVIEW mode: read-only. No commits.

## Handoff Protocol

This project may switch between AI platforms at any time. When
a session ends and the next session will use a different AI
(or the same AI on a different platform), the current AI must
produce a handoff block before closing.

Handoff block format:

  --- HANDOFF ---
  Session closed by: [AI name and platform]
  Date: [UTC]
  Mode: [mode used this session]
  Version after this session: [version number]
  What was done: [2-4 sentence summary]
  What is next: [the single most important next action]
  Claude Code instructions: [explicit step-by-step terminal/git
    commands if the next step requires local build work]
  --- END HANDOFF ---

The Claude Code instructions block is mandatory whenever the
next step involves local development. It must be specific enough
that the user can paste commands directly without interpretation.
Never assume the user knows what to do next.

## Session Close Protocol

Mandatory at the end of every session. No exceptions.

Step 1: Commit all work products to GitHub.
Step 2: Update AGENT.md version number and last updated date.
Step 3: Write a CHANGELOG.md entry for this session.
Step 4: Commit AGENT.md and CHANGELOG.md.
Step 5: Produce the handoff block (see Handoff Protocol above).
Step 6: Verify the committed version by fetching:
  https://api.github.com/repos/davewilbur78/Project-G-Live/contents/AGENT.md
  Confirm the version number matches before declaring session closed.

## Versioning

Semantic versioning: MAJOR.MINOR.PATCH
- PATCH: small fixes, doc updates within a session
- MINOR: completed prototype or significant new feature
- MAJOR: named product launch

Current version: 1.0.0
The AI running each session decides which increment applies
based on what was accomplished.

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

## Tech Stack

- Frontend: Next.js with React and Tailwind CSS
- Backend: Next.js API routes
- Database: Supabase (PostgreSQL)
- AI: Anthropic Claude API (claude-sonnet-4-5)
- File storage: Supabase storage bucket
- PowerPoint export: python-pptx via lightweight Python endpoint
- Deployment: Vercel

## Build Path

Phase 1: Documentation and architecture (complete)
Phase 2: Prototype artifacts to test interview logic (active)
         -- Case Study Builder prototype v2 complete
Phase 3: Full web app built module by module
Phase 4: GEDCOM Bridge built as onboarding layer
Phase 5: Case Study Builder with PowerPoint export as flagship

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

## Platform Output Types

RESEARCHER / PROFESSIONAL OUTPUT -- GPS-compliant language,
EE citations, full footnotes, Three-Layer analysis visible.
For BCG submissions, peer review, professional correspondence.

CLIENT OUTPUT -- Plain English narrative. Methodology invisible.
No GPS or EE terminology. Warm and readable. For family members
and paying clients.

Both outputs are generated from the same data.

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

## Repository Structure

/prototypes/        -- All HTML prototype files
/docs/research/     -- All research output files
/docs/modules/      -- Module design documents
/src/               -- Application source code

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

## Wishlist Items

DOCUMENT VIEWER -- Source images render inline in the source
record panel. Stored in Supabase, displayed alongside citation.

REASONABLY EXHAUSTIVE SEARCH CHECKLIST -- Dedicated stage in
Case Study Builder between Evidence Chain and Conflict Analysis.
