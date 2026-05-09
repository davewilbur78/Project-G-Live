# Module 02: Research Plan Builder

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Structured GPS-compliant research planning with auto-generated source
strategies tailored to the subject's context.

## Status

NOT STARTED -- Design phase.

## Description

The Research Plan Builder takes a target person and a research objective
and generates a structured, GPS-compliant research plan. The module uses
the Research Agent Assignment v2.1 prompt engine to produce prioritized
lists of source types to search, record repositories to check, and
specific strategies tailored to the time period, geography, and ethnic
or religious community of the subject. Plans are stored in Supabase and
linked to the person record. Each plan tracks its own progress as items
are completed through the Research Log and Research To-Do Tracker.

## Key Inputs

- Target person record (from `persons` table)
- Research objective or question stated by the researcher
- Time period, geography, and community context of the subject

## Key Outputs

- Structured research plan with prioritized list of source types to search
- List of specific repositories and record collections to check
- Research strategies tailored to the subject's context (time period,
  geography, ethnic or religious community)

## GPS Touchpoints

- Directly supports reasonably exhaustive search (GPS element 1) by
  defining what must be searched before conclusions can be drawn
- Ensures systematic, documented approach rather than ad hoc searching
- Plans create an auditable record of the researcher's intended scope

## Prompt Engines Used

- **Research Agent Assignment v2.1** (Steve Little) -- generates
  prioritized source strategies based on subject context
- **GRA v8.5c** -- GPS enforcement layer applied across all output

## Data Written to Supabase

- `research_plans` -- plan records linked to the relevant person

## Connection to Other Modules

- Draws person records from GEDCOM Bridge (01) or from the `persons`
  table directly
- Plans drive session work recorded in Research Log (03)
- Plan action items surface in Research To-Do Tracker (15)
- Completed plans contribute to the reasonably exhaustive search
  narrative in Research Report Writer (09) and Case Study Builder (10)

## Build Notes

Prerequisites:
- Citation Builder (04) complete
- Person records exist in Supabase (either entered manually or via
  GEDCOM Bridge)
- Research Agent Assignment v2.1 prompt integrated into AI layer
