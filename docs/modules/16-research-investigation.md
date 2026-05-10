# Module 16: Research Investigation

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

A named, persistent, AI-collaborative workspace for open-ended research
problems that do not yet have a hypothesis -- where the problem drives
the shape of the work rather than a predefined structure.

## Status

NOT STARTED -- Design phase.
Design doc drafted: 2026-05-10 19:30 UTC via EXPLORE session.

---

## Description

The Research Investigation module is a workbench for problems you have
not yet framed. It sits upstream of Case Study Builder -- you investigate
until the problem is solved or until it crystallizes into a provable
claim, then hand it off to Case Study Builder to formalize.

The entry point is conversation, not a form. You open an investigation,
describe the problem to the built-in AI partner, and the workbench
emerges from that conversation. The AI is context-aware: it is loaded
with everything already captured in the investigation before you type a
single word, so returning to a six-month-old investigation does not
require re-explaining anything.

The classic use case is a disambiguation problem: multiple individuals
sharing a name, location, and time period, with conflicting records that
appear to describe the same person but belong to different people. The
module provides a structured place to work that problem to a conclusion
-- capturing the reasoning trail, the evidence, the disambiguation
matrix, and the final determination -- all in one place, all saved,
all findable.

The module replaces the combination of a separate chat thread, a
spreadsheet on the desktop, handwritten notes, and saved files scattered
across a computer -- none of which are connected to each other or to the
rest of the research platform.

---

## Three Entry Points

Investigations begin in one of three ways:

1. **Known problem from the start.** You have a situation that requires
   open-ended investigation before a hypothesis can be formed. Example:
   a DNA match you cannot identify who requires working matches-of-matches,
   obituaries, and directory records before the connection is clear.

2. **Problem crystallizes mid-research.** You are building a record for
   a person and realize mid-stream that you need to stop and investigate
   before continuing. Example: realizing partway through a tree build
   that there are likely multiple individuals with the same name in the
   same place and time.

3. **Conflict detection triggers the investigation.** The data itself
   signals that something is wrong -- a person appears in two places at
   once, birth approximations from the same period contradict each other,
   or address records conflict. A conflict too tangled to resolve within
   Source Conflict Resolver (06) or Case Study Builder (10) can be handed
   off to open a new investigation.

---

## The Workbench

### Conversation Is the Spine

The built-in AI chat interface is the primary workspace. You do not
configure the workbench before starting -- you start talking and the
workbench grows arms as the problem requires them. The AI helps you
articulate the conflict, asks clarifying questions, and begins building
structured outputs (the matrix, the evidence list, candidate persons)
as a byproduct of the conversation.

### AI Context Awareness

The AI partner is not a blank chat window. Every time a conversation is
opened inside an investigation, the AI is pre-loaded with:

- The investigation's problem statement
- Everything in the matrix so far
- All evidence captured
- All conclusions reached
- Where the investigation left off

The AI also has read access to existing platform data: persons in the
persons table, sources in Citation Builder, case studies in progress,
and research logs. It can cross-reference during the conversation -- for
example, flagging that an address in a newly captured directory entry
matches a source already in the database, or that a naturalization date
conflicts with a fact already recorded.

### Views (Tabs)

The investigation has multiple views of the same underlying data.
The researcher works primarily in Conversation but switches views to
inspect structured outputs without losing context.

**Conversation** -- The full chat thread. The reasoning trail, the dead
ends, the aha moments, the AI responses. Scrollable, searchable, and
permanent. Nothing is deleted.

**Evidence** -- All documents and records brought into the investigation,
organized by record type and date. Directory pages, census entries,
naturalization records, obituaries, and any other captured material.
The AI populates this view as evidence is discussed or uploaded in the
Conversation view.

**Matrix** -- The disambiguation table. Candidate individuals as rows,
record types as columns, data filled in as it is found. The AI updates
this view from the conversation -- the researcher does not fill it in
manually. For a name disambiguation problem, each row is a candidate
person; columns might include city directory years, census entries,
naturalization records, spouse names, and addresses.

**People** -- Candidate persons identified during the investigation,
with their attributes and record links. When the investigation resolves,
confirmed individuals can be pushed to the main persons table. Unconfirmed
candidates remain here until resolved.

**Conclusions** -- What has been resolved, what remains open, and what
has been handed off to Case Study Builder. The AI can draft a conclusion
summary from the conversation thread when the researcher is ready.

---

## Catalog View (Landing Page)

The module landing page is a catalog of all investigations -- open,
resolved, stalled, and handed off. Each investigation appears as a card
or row showing:

- **Name** -- researcher-assigned, plain English
- **Primary subject** -- the person or cluster at the center of it
- **Status** -- In Progress / Resolved / Stalled / Handed Off to Case Study
- **Opened** -- date and time
- **Last worked** -- date and time
- **One-line summary** -- the problem in plain English

Filters and lenses available in the catalog:

- By status
- By primary subject or surname cluster
- By entry point (DNA match / mid-research / conflict detection)
- By date opened or last worked
- By connection to another module (e.g. investigations that have
  handed off to a specific Case Study)

---

## Investigation Header (Re-orientation on Return)

The top of every open investigation shows a compact orientation block
so the researcher can re-enter after weeks or months without re-reading
the full conversation:

- Investigation name and primary subject
- Status and dates (opened, last worked)
- The problem statement in 1-2 sentences
- What has been determined so far (if anything)
- Where it left off -- the next open question or action

This header is maintained by the AI and updated automatically as the
investigation progresses.

---

## Key Inputs

- Researcher's description of the problem (free-form conversation)
- Captured documents and images (directory pages, census entries,
  naturalization records, obituaries, and similar)
- Existing platform data: persons, sources, case studies, research logs
- Handoff triggers from Source Conflict Resolver (06) or Case Study
  Builder (10)

## Key Outputs

- Named, persistent investigation record saved in Supabase
- Disambiguation matrix (structured table, AI-maintained)
- Evidence list with record types and dates
- Candidate persons list, linkable to the main persons table on resolution
- Conclusion summary, AI-drafted and researcher-approved
- Handoff packet to Case Study Builder when the problem crystallizes
  into a provable claim
- Sources surfaced during investigation pushed to Citation Builder

---

## GPS Touchpoints

- Supports reasonably exhaustive search (GPS element 2) by providing
  a structured workspace for working through a cluster of related records
- Disambiguation conclusions become documented reasoning that supports
  proof arguments in Case Study Builder
- All conflicting evidence surfaces and is addressed rather than ignored
- No conclusion is reached without a documented reasoning trail

---

## Prompt Engines Used

- **GRA v8.5c** -- GPS enforcement layer; governs all conclusion
  language and evidence classification during investigation
- **Research Agent Assignment v2.1** -- can be used to suggest next
  research steps during the investigation conversation
- **Fact Extractor v4** -- extracts discrete factual claims from
  documents captured during the investigation
- **Chat Conversation Abstractor v2** -- generates the investigation
  header summary and orientation block from the conversation thread

---

## Data Written to Supabase

Requires new tables -- not yet defined in architecture.md. Tables to
design before build:

- `investigations` -- one row per named investigation; stores problem
  statement, status, primary subject, entry point type, opened and
  last-worked timestamps
- `investigation_messages` -- the full conversation thread; one row
  per message with role (user / assistant), content, and timestamp
- `investigation_evidence` -- documents and records captured; links
  to sources in Citation Builder where applicable
- `investigation_candidates` -- candidate persons within an
  investigation; linkable to the main persons table on resolution
- `investigation_matrix_cells` -- the disambiguation matrix; keyed
  by investigation id, candidate id, and record type

These tables must be designed and added to /docs/architecture.md before
this module is built.

---

## Connection to Other Modules

- **Source Conflict Resolver (06)** -- conflicts too complex to resolve
  in that module can trigger a new investigation here
- **Case Study Builder (10)** -- resolved investigations hand off to
  Case Study Builder when the conclusion crystallizes into a provable
  claim; the investigation reasoning trail becomes supporting documentation
- **Citation Builder (04)** -- sources surfaced during an investigation
  are pushed to Citation Builder for formal citation
- **Research To-Do Tracker (15)** -- open threads and unresolved
  candidates surface as action items
- **Persons table** -- confirmed individuals are promoted from
  investigation_candidates to the main persons table on resolution
- **Research Log (03)** -- investigation sessions can be logged as
  research sessions

---

## Build Notes

Prerequisites:
- Citation Builder (04) complete -- sources surfaced during investigation
  must have a destination
- Persons table and persons API (src/app/api/persons/) complete --
  candidate promotion requires a target
- Architecture for investigation tables designed and added to
  /docs/architecture.md
- The AI context pre-loading pattern requires an API route that assembles
  the full investigation state into a system prompt on conversation open.
  This is the technically novel piece of this module -- design carefully.

Build order note: This module is not in the original 15-module build order.
It is an addition discovered during EXPLORE session on 2026-05-10.
Placement in the overall build sequence to be determined. It does not
block any currently planned module but is a strong candidate for early
build given its utility across the full research workflow.

Design origin: Emerged from a conversation about disambiguating multiple
individuals named Abe Barnholtz in St. Louis in the 1920s-1930s --
a real research problem that revealed the need for a persistent,
AI-collaborative investigation workspace not provided by any existing
module or external tool.
