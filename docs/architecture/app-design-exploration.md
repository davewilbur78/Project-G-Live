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
and should wait until the Connie Knox Ancestry workflow review is
complete (see Open Threads below). The Research Companion proposal
below is directly relevant to this question.

---

## Proposed Navigation Structure (draft, not final)

This is a starting frame for discussion, not a build spec.
NOTE: the Research Companion proposal below may argue for revisions
to this structure. Hold this loosely until that proposal is resolved.

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

## PROPOSAL: The Research Companion Model

TIMESTAMP raised: 2026-05-16 UTC
Status: UNDER CONSIDERATION -- not a decision, not canon
Source: Emerged from Connie Knox Ancestry workflow session (batches 1-2)
Mental flexibility required: more batches pending; this proposal should
be tested against remaining material before anything is finalized.

### The Observation That Prompted This

Connie Knox runs three monitors. One screen holds her Ancestry tree.
One screen holds her active search and records. A third holds notes
and reference material. Her research session is not a sequence of
destinations -- it is a set of parallel surfaces, all open at once.

This is not unusual. It is how serious genealogical researchers work.
The multi-monitor setup appeared in Connie's top-10 most-watched tip
video -- meaning her audience recognized it immediately as describing
their own workflow.

This observation reframes a question that has not been explicitly asked
before in this project: what kind of thing is this app?

### The Proposal

**Current implicit model: research destination.**
The researcher navigates to this app, does a task within a module,
navigates away. The app is one destination among many -- better than
Ancestry for GPS-compliant work, but structurally similar in how it
is used.

**Proposed alternative model: research companion.**
The app is always open. It is the persistent context for everything
happening on the other screens. When something surfaces on Ancestry,
the researcher looks at this app to understand what it means. When
a DNA match cluster resolves, the researcher looks here to see which
branch it belongs to. When a name appears in a census neighborhood,
the researcher looks here to see if that person is already tracked.

The companion is not a destination you visit. It is a presence you
keep open.

### What This Model Would Require (If Adopted)

These are not build decisions. They are design constraints the
companion model would impose if we decide to embrace it.

**Speed as a primary design value.**
Getting to any person's record should be near-instant from anywhere
in the app. Global search visible on every page, not just the People
hub. Person page loads and shows critical information before the
researcher has time to scroll.

**Information density over breathing room.**
The researcher glancing at monitor two while Ancestry is on monitor
one needs facts, not visual space. Critical information -- status, key
dates, sourcing health, open threads -- visible without scrolling.

**A persistent anchor zone on the person page.**
A compact header area that never scrolls off screen: name and dates,
research status, sourcing health indicator, direct ancestor flag, open
investigation link. This zone is the constant reference. The panels
below are the workspace.

**Lateral navigation, not only hierarchical.**
Family context -- parents, spouse, children, close associates -- present
and directly clickable on the person page. The researcher following a
lead moves person-to-person in one click, not by returning to the hub.

**Person-first information architecture.**
Modules are tools reached from person context, not top-level
destinations visited independently. The researcher is looking at a
person and opens a case study about that person. The person is the
anchor; the module is the action. This may argue for revisions to the
proposed navigation structure above.

**The companion as a nudge, not just a record.**
A companion paying attention to what the researcher is doing might
offer contextual prompts -- for example, when a researcher is working
on someone from a new location: "Have you checked what records exist
for Wayne County, WV in this era?" That is a future capability, but
the architecture should not foreclose it.

### What This Proposal Does Not Change (Regardless of Outcome)

- The People hub is still the required next build. Companion model or
  not, 1,576 people need a front door.
- Navigation restructure is still required. Infrastructure out of
  main nav.
- The person page still needs a compact, persistent anchor zone. Even
  if the full companion model is not adopted, this is good design.
- Vercel deployment is still gated. Nothing here changes that.

### Open Questions This Proposal Raises

- Does person-first architecture change the proposed navigation
  structure in a meaningful way, or is it compatible with it?
- What does a "sourcing health indicator" look like without being
  misleading? (Given the 87.6% source-wiring figure may be overstated
  -- see Open Threads.)
- If modules are reached from person context, does the dashboard still
  serve a useful purpose? Or does it become a status overview rather
  than a navigation surface?
- Does this model argue for a different visual design language -- more
  information-dense and less editorial-magazine in feel?

These questions should remain open until all Connie Knox batches are
reviewed and the full synthesis is written.

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
Status: IN PROGRESS -- batches 1 and 2 received and committed to
  docs/architecture/connie-knox-workflow-notes.md. Batches 3+ pending.
  Enhanced batch 2 re-run also in progress.

Connie Knox has a full YouTube playlist teaching high-level Ancestry
usage. The premise: if Claude understands how a power user uses Ancestry
end-to-end -- the workflows, search strategies, features most researchers
never find -- Claude can identify the gaps that this app should fill,
rather than designing against an abstract notion of what Ancestry can't do.

Output so far: Research Companion model proposal (above). Research
status field concept. People hub three-view structure. FAN Club Mapper
as native replacement for census-extraction-to-Excel workflow. Module 8
reframing as structured network data layer + map visualization output.
Person page anchor zone. Lateral navigation requirement.

Synthesis step (writing implications into this doc as decisions) held
until all batches are complete.

---

## Design and Aesthetics

Not yet formally discussed. Known:
- The Case Study Builder prototype is the canonical visual reference
  for all module builds (Playfair Display, Source Serif 4, JetBrains Mono)
- The prototype design system must be matched across all modules
- Person page display design has not been discussed at all yet

Dedicated future session topic. Should follow the Connie Knox session
so that design decisions are informed by workflow understanding.
Note: the Research Companion proposal above may have implications for
visual design language that should be considered in that session.

---

## Build Priority Order (current understanding)

1. Connie Knox Ancestry workflow session (EXPLORE -- IN PROGRESS)
2. Navigation restructure -- move infrastructure out of main nav
3. People hub -- search, browse, person page as first-class destination
4. Person page design -- informed by Connie Knox session output
5. Vercel deployment -- when app is coherent enough to use daily
6. Voice profile discussion -- gates Module 9
7. Research Report Writer (Module 9)
8. GEDCOM Bridge (Module 1)
9. Family Group Sheet Builder (Module 11)
10. FAN Club Mapper (Module 8)

Note: FAN Club Mapper (Module 8) moved up in practical importance
by Connie Knox session findings -- it is the native replacement for
the census-extraction-to-Excel workflow. Build order position may
change after synthesis is complete.

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
  finalized. This is the active EXPLORE session.

TIMESTAMP: 2026-05-16 UTC -- Vercel deployment gated on navigation
  restructure and People hub completion. Not a current build priority.
  Deploy when the app is coherent enough to use daily.

TIMESTAMP: 2026-05-16 UTC -- Research Companion model raised as a
  proposal. Not a decision. Under consideration pending remaining
  Connie Knox batches. See proposal section above.
