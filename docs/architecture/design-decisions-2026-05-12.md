# Design Decision Record: Architecture Evolution
TIMESTAMP: 2026-05-12 16:30 UTC
Session type: EXPLORE
Captured by: Claude (claude-sonnet-4-6)

---

## Context

This document captures a foundational architectural conversation that significantly
expands the scope and philosophy of Project-G-Live. No code was written. These are
design decisions and principles to be implemented in future BUILD sessions.

---

## 1. New Design Principles (Platform Spine)

Two principles added to the platform's foundational design spine, joining
Address-as-Evidence, Address-as-Search-Key, and The Brick Wall Reframe.

### Never Blank

TIMESTAMP established: 2026-05-12 16:30 UTC

The platform should never ask the researcher to start from nothing. Every time
something is opened -- Research Notes, a case study, a research plan, an
investigation -- there should already be something on the page. A smart first
draft, an anchored structure, a suggested starting point generated from existing
data. The researcher's job is to react, refine, redirect. Not to conjure from
thin air.

This is not merely a UX preference. It is a load-bearing design requirement.
The blank page is a known obstacle that prevents real work from happening.
The AI's role is to always show up with something already prepared.

### Never Lose the Thread

TIMESTAMP established: 2026-05-12 16:30 UTC

Every time the researcher returns to a person, a project, a case study, or any
workspace, the system should orient them immediately. Here is where you were.
Here is what is unresolved. Here is what came in since you last looked. No
hunting, no reconstructing context from memory, no re-reading to remember where
you were.

The session memory architecture already implements this at the project/session
level. It must also be implemented at the person level and the Research Notes
level.

### Design Philosophy Note

The researcher has an ADHD brain. This is not a limitation to work around --
it is a first-class design input. The platform exists in part as an external
cognitive structure. Every module, every interaction, every AI response should
be designed with this in mind. This principle applies to all projects and
contexts within the platform, not just genealogy work.

---

## 2. Project Container Architecture

TIMESTAMP established: 2026-05-12 16:30 UTC

The platform needs a top-level container concept. The mental model is the
Ancestry family tree: each tree is its own isolated database. No bleed between
trees. The researcher is the only thing the trees have in common.

### Container Types

**Personal Research Container**
The baseline. Standard tree structure. Permanent, always active. Models what
the platform was originally built for. Long-running, never expires.

**Client Container**
Same standard tree structure as personal. Can have a lifespan -- created for
an engagement, delivered, then archived or cleared when appropriate. "Can have"
not "must have" -- some client relationships are ongoing. The container does
not dictate the relationship. Client data never bleeds into personal research.

**Research Group Container**
Different shape. Not a standard family tree. Closer to a shared investigation
workspace. Built to hold:
- Multiple overlapping trees from multiple researchers
- Competing hypotheses about the same individuals
- Evidence in conflict, with unequal weight
- Verified connections alongside unverified ones
- Researchers of varying skill levels contributing

The GPS framework is what makes this container workable. Competing hypotheses
are not separated into different trees -- they are represented honestly as
unresolved conflicts with documented evidence weight on each side. The Source
Conflict Resolver and Case Study Builder handle this. The tool enforces honesty
about what is and is not proven, which is what allows researchers of different
skill levels to work in the same space without chaos.

Shape: TBD, under development. Starts as a shared investigation workspace.
Develops further as the group work itself reveals what it needs.

### Key Decisions

- Platform remains single-user. That does not change.
- Research group container has a TBD flag on multi-user specifically.
  When the project container architecture is built, the data model must not
  make multi-user impossible later -- without actually building it now.
  Do not paint into a corner. Do not build it now.
- Moving data between containers is an intentional act. No automatic bleed.
  The researcher decides when and what crosses a boundary.
- Shared resources (citation style, file naming conventions, AI engines,
  voice profile) belong to the researcher, not to any container.
  They apply everywhere.

### Implementation Note

Building the container assumes single-user. The research group container shape
remains TBD. Everything already built continues to work -- the modules are tools,
the project is the workbench. The shape of the workbench does not change the tools.

---

## 3. Research Notes (Knox Method)

TIMESTAMP established: 2026-05-12 16:30 UTC
Inspiration: Connie Knox / GenealogyTV -- Knox Research Notes Method

### What Research Notes Are

Person-centric, chronological, living documents containing only positive findings
for one individual. Not the research log (which tracks everywhere you looked).
Not a case study (which is a formal GPS proof argument). Not a report.
The cumulative life portrait of an individual. The most important document
in the researcher's files when done correctly.

They attach to the PERSON, not the project. Julia Klein's Research Notes
are Julia Klein's Research Notes regardless of which project context she
is being researched under.

### Architecture: Feature of Person Profile, First-Class on Dashboard

Research Notes live embedded in the person record. That is where the data
lives and where the researcher works on them. But they must also be a
first-class citizen on the dashboard -- visible, surfaced, never buried.

Dashboard presence: a widget or indicator showing persons without Research
Notes, or persons whose notes have new data available. Never out of sight.
Out of sight is out of existence.

### Structure

Two zones within each person's Research Notes:

**Anchored section (system-maintained)**
Auto-populated from the database: name, vital dates (BMD), known family
relationships, sources already attached to this person. Always current
because it reflects live Supabase data. The researcher does not write
this section -- the system maintains it.

**Researcher-written section (protected)**
The researcher's analysis, narrative, interpretation of evidence. The AI
can help draft it and suggest additions based on new data, but never
overwrites existing written content without explicit researcher action.

### Overwrite Protection

When new data comes in relevant to a person, the system flags it as a
suggested update. Notification: new information available for this person's
Research Notes. Researcher reviews, decides what gets added, approves.
Nothing changes without the researcher. Written sections are always protected.
Only the anchored section updates automatically.

### First Run

For a person with no existing Research Notes, the system generates a smart
first draft from everything already attached to that person: sources, timeline
events, case studies, DNA matches, correspondence. The researcher is never
facing a blank page. They are editing a draft. First run detail to be
designed in a future session.

### Knox Method UI

A dismissible reminder banner on the Research Notes view:
"Research Notes contain only positive findings for this individual --
confirmed facts, sources, and conclusions. They are not a research log.
They are not a proof argument. They are the cumulative life portrait
of this person."
Dismissible per person or globally in settings.

### Export

On-demand export to Word (.docx) and PDF at any time. Clean, formatted
document: person's name as title, anchored vital facts at top, chronological
narrative below, sources cited inline. Presentation-ready without additional
formatting work.

The database is the living document. The export is the snapshot.
Never the reverse. Keeping a file on disk as the primary creates sync
problems. Single source of truth stays in Supabase.

---

## 4. Things to Come Back To

- Connie Knox specific resources: Dave to provide YouTube videos, Academy
  templates, and handout materials. Fetch and study before building
  Research Notes module. Her template structure should inform the UI directly.
- Research group container shape: develop further as group work reveals needs.
- Multi-user question for research group container: flagged, pinned, not now.
- Project container implementation: schema separation vs. row-level tagging
  in Supabase. Build conversation needed before any project work begins.
- First run Research Notes generation: detail to be designed.
- Voice profile discussion: still pending, required before Module 9.
- Module 11 (Family Group Sheet Builder): output storage design still TBD.
- Additional modules and ideas: Dave indicated more is coming that does not
  fit the current rubric. To be discussed in future sessions.

---

## 5. Build Impact

Nothing currently built is invalidated by these decisions.

The project container is a new layer that wraps around everything already built.
Research Notes is a new feature attached to the persons table.
The dashboard needs a Research Notes presence widget.

Recommended build sequence impact:
- Do not build remaining modules (9, 11, 8, 1) until project container
  architecture is designed. They need to know what project they live inside.
- Research Notes can be scoped and designed in the next EXPLORE session
  once Connie Knox resources are reviewed.
- Project container architecture conversation is the next critical session.
