# Module 07: Timeline Builder

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Visual, source-cited chronological life timeline for any person in the
database -- surfaces gaps, inconsistencies, and impossible sequences.

## Status

NOT STARTED -- Design phase.

## Description

The Timeline Builder constructs a visual, source-cited chronological
life timeline for any person in the database. Events are drawn from
all sources linked to that person -- birth, marriage, children, census
appearances, land transactions, military service, immigration, death,
burial, and more. Each event on the timeline displays its citation and
evidence classification. The timeline makes it easy to spot gaps,
inconsistencies, and impossible sequences (a person appearing in two
places at once, a child born before the parents married, an age that
doesn't add up across records). Timelines can be filtered by source
type or evidence quality and exported for inclusion in research reports.

## Key Inputs

- Person record (from `persons` table)
- All sources, citations, and extracted facts linked to that person
- Optional filters: source type, evidence quality

## Key Outputs

- Visual chronological life timeline with each event cited and
  evidence-classified
- Flags for gaps, inconsistencies, and impossible sequences
  (chronological contradictions)
- Exportable timeline for inclusion in research reports

## GPS Touchpoints

- Supports analysis and correlation of evidence (GPS element 3) by
  presenting all evidence chronologically so patterns and contradictions
  are visible
- Surfaces gaps that point to incomplete research, supporting reasonably
  exhaustive search planning (GPS element 1)
- Inconsistency flags prompt conflict resolution work (GPS element 4)

## Prompt Engines Used

- **GRA v8.5c** -- GPS enforcement layer applied to all event
  classification and display

## Data Written to Supabase

- `timeline_events` -- event records tied to persons and their source
  citations

## Connection to Other Modules

- Draws extracted facts from Document Analysis Worksheet (05)
- Draws citations from Citation Builder (04)
- Chronological gaps surface as action items in Research To-Do
  Tracker (15)
- Inconsistencies that represent source conflicts are flagged for
  Source Conflict Resolver (06)
- Timeline data is incorporated into Research Report Writer (09) and
  Case Study Builder (10)

## Build Notes

Prerequisites:
- Citation Builder (04) complete
- Document Analysis Worksheet (05) complete -- extracted facts are
  the events that populate the timeline
- `timeline_events` table defined in Supabase schema (see
  /docs/architecture.md -- table is defined but column-level detail
  may need expansion before building)
