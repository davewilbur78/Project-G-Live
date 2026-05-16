# App Design Exploration

TIMESTAMP started: 2026-05-16 UTC
Status: LIVING DOCUMENT -- updated as design decisions are made
Author: Dave + Claude (claude.ai)

This document captures the structural and navigational design thinking
for Project-G-Live as it emerges from exploration sessions. It is not
a build spec. It is a shared map of what we have, what needs to be
decided, and what we are holding for later.

---

## Why This Document Exists

After 13 modules and a full FTM tree import, the project reached a point
where the pieces exist but the overall shape of the app -- how a human
navigates it, what belongs where, what is a feature vs. infrastructure
-- had not been formally examined. This doc is that examination.

---

## The Module Taxonomy Problem

The 13 completed modules are not all the same kind of thing. Treating
them as a flat list produces a confusing and cluttered navigation. A
more honest sorting:

### User-facing destinations
Things you open and work in directly. These belong in main navigation.

- Case Study Builder -- GPS workflow engine, the flagship module
- Research Investigation -- open-ended investigation workspace
- Research Plan Builder -- structured attack on a research problem
- Research Log -- log of sessions, searches, sources consulted
- Source Conflict Resolver -- working through contradictions between sources
- Timeline Builder -- building and reviewing a person's timeline
- Research To-Do Tracker -- task list tied to research questions
- Correspondence Log -- tracking contacts and communications
- DNA Evidence Tracker -- GPS-compliant DNA evidence management
- Document Analysis Worksheet -- AI-assisted document and image analysis

### Infrastructure / settings-level components
Things that serve other modules but are not user-facing destinations.

- File Naming System -- runs in background; configure in Settings,
  not a module you open
- FTM Bridge -- import pipeline; belongs in Settings > Data > Import,
  not main navigation
- Citation Builder -- dual nature: callable from within other modules
  (primary role) and accessible standalone (secondary). May deserve
  a Settings-adjacent location rather than main nav.

### Implication
Working navigation is probably 8-10 genuine destinations, not 13.
The app should not feel like a list of tools. It should feel like
a research environment with a clear front door.

---

## The Person Hub Problem

The Person Detail Page is arguably the most important surface in the
entire app. Every module -- timeline events, sources, DNA, notes,
investigations, conflicts -- connects back to a person. But currently:

- It is not listed as a navigable section
- There is no browse or search entry point for people
- 1,576 real persons with real data are essentially invisible from
  the app's front door

This needs to be resolved before any significant navigation work.
A People section -- with search, browse, and a person page as hub --
should be a first-class navigation destination.

### Person page design question (unresolved)
The person page should be versatile: both a reading/review surface
and an active workspace where you can trigger investigations, add
sources, and do real work. The full design of this is not yet decided
and should wait until after the Connie Knox Ancestry workflow review
(see Open Threads below).

---

## Proposed Navigation Structure (draft, not final)

This is a starting frame for discussion, not a build spec.

- **People** -- search/browse tree, land on person pages (the hub)
- **Research Workbench** -- Case Study Builder, Research Investigation,
  Research Plan Builder, Source Conflict Resolver, Document Analysis
  Worksheet
- **Logs and Tracking** -- Research Log, To-Do Tracker, Correspondence Log
- **Specialized Tools** -- Timeline Builder, DNA Evidence Tracker
- **Settings / Data** -- FTM Bridge (import), File Naming System
  (configure), Citation Builder (accessible here and from within modules)

---

## Deployment -- Gated, Not a Priority

Vercel deployment adds zero capability to the app. It is a finishing
move, not a building move. The correct trigger for deployment is:
"the app is coherent enough that I would actually reach for it daily."

That trigger has not been met yet -- not because the code is bad, but
because the shape of the app has not been settled. Deploying now would
mean hardening a navigation where File Naming System sits next to
Case Study Builder, and where 1,576 people have no front door.

Claude Code can run the app locally for testing and smoke testing
without deployment being a factor.

Deployment is gated on:
1. Navigation restructure complete (infrastructure out of main nav)
2. People hub built (search, browse, person page as first-class destination)
3. App is coherent enough to use daily

When those conditions are met, deployment is the next move. Not before.

---

## Open Threads

These are real issues flagged during exploration. They are parked
here so they are not forgotten. Not acted on yet.

### Ancestry tree sources masquerading as real sources
TIMESTAMP flagged: 2026-05-16 UTC

Many of the 5,236 "sourced" timeline events may be sourced to Ancestry
member trees or hints. Under GPS, member trees are authored works of
unknown reliability -- they are not evidence. The 87.6% source-wiring
figure may be overstated as a quality metric.

Needs: an audit mechanism and a triage workflow. Natural home in the
Source Conflict Resolver or a dedicated source quality audit feature.
Not now. Flagged and tracked.

### Connie Knox -- Ancestry workflow deep dive
TIMESTAMP flagged: 2026-05-16 UTC

Connie Knox has a full YouTube playlist teaching high-level Ancestry
usage. The premise: if Claude understands how a power user uses Ancestry
end-to-end -- the workflows, search strategies, features most researchers
never find -- Claude can identify the gaps that this app should fill,
rather than designing against an abstract notion of what Ancestry can't do.

Action required: before significant navigation and person-page design
work, conduct a Connie Knox Ancestry workflow session. Review
docs/research/connie-knox-workflow-reference.md as a starting point.
The output of that session should feed directly into People hub design
and person page design.

This is the next major EXPLORE session after this document is committed.

---

## Design and Aesthetics

Not yet formally discussed. Known:
- The Case Study Builder prototype is the canonical visual reference
  for all module builds (Playfair Display, Source Serif 4, JetBrains Mono)
- The prototype design system must be matched across all modules
- Person page display design has not been discussed at all yet

Dedicated future session topic. Should follow the Connie Knox session
so that design decisions are informed by workflow understanding.

---

## Build Priority Order (current understanding)

1. Connie Knox Ancestry workflow session (EXPLORE -- gates everything below)
2. Navigation restructure -- move infrastructure out of main nav
3. People hub -- search, browse, person page as first-class destination
4. Person page design -- informed by Connie Knox session output
5. Vercel deployment -- when app is coherent enough to use daily
6. Voice profile discussion -- gates Module 9
7. Research Report Writer (Module 9)
8. GEDCOM Bridge (Module 1)
9. Family Group Sheet Builder (Module 11)
10. FAN Club Mapper (Module 8)

---

## Decisions Made

TIMESTAMP: 2026-05-16 UTC -- Module taxonomy recognized as a real
  navigational problem. Infrastructure components should not share
  navigation with user-facing destinations.

TIMESTAMP: 2026-05-16 UTC -- Person Detail Page identified as a
  first-class navigation destination that currently has no front door.
  Needs a People section with search and browse.

TIMESTAMP: 2026-05-16 UTC -- Connie Knox Ancestry playlist established
  as a required input before person-page and navigation design is
  finalized. This is the next EXPLORE session.

TIMESTAMP: 2026-05-16 UTC -- Vercel deployment gated on navigation
  restructure and People hub completion. Not a current build priority.
  Deploy when the app is coherent enough to use daily.
