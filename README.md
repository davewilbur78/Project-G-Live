# Project-G-Live

Personal Genealogy Operations Platform

A modular web application supporting serious genealogical research
and professional development toward BCG certification. Built for
one user. Not a replacement for Ancestry.com or FamilyTreeMaker --
a working and documentation layer on top of them.

---

## If You Are an AI Starting a Session

Do these things first. In this order. Before anything else.

**1. Fetch AGENT.md via the GitHub API:**
```
https://api.github.com/repos/davewilbur78/Project-G-Live/contents/AGENT.md
```
Decode the base64 content field. Read the full file.

**2. Fetch the session index:**
```
https://api.github.com/repos/davewilbur78/Project-G-Live/contents/sessions/SESSIONS-INDEX.md
```

**3. Fetch the most recent session snapshot from /sessions/**
The filename is in SESSIONS-INDEX.md. Fetch it. Read it.
This tells you what was happening when the last session ended.

**4. Ask the user what posture this session is.**
Do not infer from project state. Do not begin building.
Wait for confirmation before doing any work.

Do not use raw.githubusercontent.com -- CDN-cached, unreliable.
The API endpoint always returns the current committed version.

---

## Operating Model

This project is AI-agnostic by design. Any AI -- Perplexity,
Claude, Claude Code, or any future platform -- can read, write,
build, and commit. The user chooses freely. No AI owns this project.

**GitHub is the persistent memory.** AI platforms are stateless.
The repo is always the current truth. Nothing lives only in a
context window. Everything is committed.

**Three session postures:**
- BUILD -- moving the project forward
- FIX -- something is broken, stay in the problem boundary
- EXPLORE -- thinking and designing, no build output

Postures are not locks. Transitions are allowed with a declared
statement and TIMESTAMP. Transitions do not require new threads.

**TIMESTAMP is non-negotiable.** Every artifact, decision, commit,
snapshot, and signal event carries YYYY-MM-DD HH:MM UTC.
A fact without a timestamp is a rumor.

**Signal vocabulary.** Certain phrases from the user trigger
immediate protocol execution. Full dictionary:
/docs/architecture/SIGNAL-VOCABULARY.md

**Session snapshots.** Every session commits at least one snapshot
to /sessions/. Snapshots are never deleted, never overwritten.
They are the project's memory.

---

## Key Documents

| Document | Purpose |
|---|---|
| AGENT.md | Single source of truth. All operating rules. |
| CHANGELOG.md | Session history. What changed and why. |
| /sessions/SESSIONS-INDEX.md | Session archive index. |
| /docs/architecture/OPERATING-MODEL.md | Full operating model design. |
| /docs/architecture/SESSION-MEMORY.md | Session memory system design. |
| /docs/architecture/SIGNAL-VOCABULARY.md | Full signal phrase dictionary. |
| /prompts/BOOT-ANY-AI.md | Platform-neutral session boot prompt. |
| /prompts/perplexity-space-instructions.md | Perplexity Space boot prompt. |

---

## What This Platform Does

Enforces the Genealogical Proof Standard (GPS) in plain language.
Structures research to produce defensible conclusions.
Integrates with an existing Ashkenazi Jewish genealogy and DNA
research workflow.

Built for one user working toward BCG (Board for Certification
of Genealogists) certification.

---

## Tech Stack

Next.js · React · Tailwind CSS · Supabase · Anthropic Claude API · Vercel

---

## Repository Structure

```
/sessions/          -- Session snapshots and index. Never deleted.
/prototypes/        -- HTML prototype files
/docs/research/     -- Research output files
/docs/modules/      -- Module design documents
/docs/architecture/ -- Operating model design documents
/prompts/           -- Session boot prompts for all AI platforms
/src/               -- Application source code
wip/ branch         -- Partially built work, committed even broken
```

---

## Current Build Status

- Phase 1: Documentation and architecture -- **complete**
- Phase 2: Prototype artifacts -- **active**
  - Module 10 Case Study Builder prototype v2 complete
  - Test case: Jacob Singer / Yankel Springer identity proof
- Phases 3-5: Full web app -- pending
