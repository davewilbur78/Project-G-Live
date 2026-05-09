# Session Memory Architecture

TIMESTAMP: 2026-05-08 23:35 UTC
Authored by: Perplexity
Version: 1.0.0

This document describes the session memory system for
Project-G-Live in full. Procedures and formats are also
in AGENT.md. This document provides the design rationale.

---

## The Problem This Solves

A git commit saves files. It does not save:
- The reasoning behind a half-built decision
- The things considered and rejected
- The direction a partially built tool was heading
- The open questions that were mid-air when the session ended
- The momentum of what was alive in the session

When a context window fills or a session ends abruptly,
all of that evaporates. The next session reads committed
files and has no idea what was being thought -- only what
was finished. This system preserves the thinking, not just
the output.

---

## The Three Components

### 1. /sessions/ Archive

Location: /sessions/ folder at repo root
Naming: SESSION-YYYY-MM-DD-HHMM-UTC.md
Retention: PERMANENT. Never deleted. Never overwritten.

Every session produces at least one snapshot. Multiple
snapshots in one session are normal and expected -- at
checkpoints, on exit signals, on distress signals, and
at session close.

The index file SESSIONS-INDEX.md in /sessions/ maintains
one line per snapshot: TIMESTAMP, posture, one-sentence
summary. This makes the archive navigable as it grows.

### 2. wip/ Branch

Purpose: partially built code that is not yet ready for main.
Rule: commit here before any session close or checkpoint,
even if the code is broken or incomplete.

The principle: broken code in a branch is recoverable.
A description of broken code is archaeology.

Commit message format:
  wip: [what it is] -- TIMESTAMP: YYYY-MM-DD HH:MM UTC

Lifecycle:
  - Created during a BUILD or FIX session when work is
    incomplete at checkpoint or close time
  - Picked up in the next relevant BUILD session
  - Merged to main when complete
  - wip/ branch is reset (not deleted) after merge
  - The merge is noted in CHANGELOG

### 3. Context Window Pulse

The AI actively monitors context window health throughout
every session. It does not wait until the window is full.

60% threshold: write snapshot, commit, continue if healthy
80% threshold: write snapshot, commit everything, ask user
Critical: execute distress protocol without waiting for signal

The thresholds are estimates. The AI uses its judgment about
how content-heavy the session is. A session with many large
file reads fills faster than a discussion-only session.

---

## Transcripts vs. Snapshots

Snapshots are structured documents written by the AI
following the format in AGENT.md. They are always produced.

Transcripts are full conversation reconstructions -- every
decision, every rejected option, every thread of reasoning,
with TIMESTAMPs. They are produced on demand via transcript
signal, or when the AI judges that a session contains
reasoning complex enough to warrant full preservation.

The difference:
- Snapshot: structured state capture, always committed
- Transcript: full reasoning record, on demand

Transcripts are most valuable when:
- A context window became unhealthy and reasoning drifted
- A complex architectural decision was made
- A session explored and rejected multiple approaches
- The user explicitly requests it

---

## The Restoration Prompt

The restoration prompt is the artifact that makes recovery
possible after a session ends unexpectedly. It is produced
as the final step of any checkpoint or distress protocol,
after all commits are done.

It is written carefully, not quickly. It is a precise
reconstruction of session state designed to be pasted into
a new thread and restore working context without re-reading
everything.

The confirmation gate at the end is mandatory. The new
session does not proceed until the user confirms the
restoration is accurate. A bad restoration prompt acted
on without confirmation can compound a problem.

See AGENT.md for the full restoration prompt format.

---

## What a Good Snapshot Contains

The snapshot format is in AGENT.md. The design principles:

TIMESTAMPs on everything. A decision without a timestamp
is a rumor. The time of every decision matters because
multiple sessions can happen in one day.

Partially built work must be reconstructed fully. Not
summarized. Not described. The actual work, written out
completely, so a future session can continue it rather
than reverse-engineer it. If it can be committed to wip/,
do that instead and reference the commit.

The DO NOT DO THIS section is as important as the rest.
Wrong turns already taken, options already ruled out, and
questions already closed must be preserved explicitly so
the next session does not retrace them.
