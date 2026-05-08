# Module 07: Timeline Builder

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Visual chronological life timeline built from all sources.

## Status

Design phase. Not yet built.

## What It Does

The Timeline Builder assembles a chronological timeline for an individual from all sources attached to that person. Each event on the timeline is sourced and cited.

Features:
- Events plotted chronologically with date, location, and source citation
- Conflicting dates shown with conflict flags
- Events correlated across family members (spouse, children, parents) to identify patterns
- Geographic movement tracked across events
- Timeline exported as a formatted document for inclusion in research reports

## Correlation Value

The timeline is a key GPS correlation tool. Placing all events in sequence often reveals:
- Impossible date sequences that indicate record errors or identity confusion
- Migration patterns that suggest where to search next
- Age discrepancies across documents
- Family movement that connects to historical events

## Data Read

- `persons` table
- `timeline_events` table
- `sources` and `citations` tables

## Data Written

- `timeline_events` table: events with dates, locations, source links
