# Module 09: Research Report Writer

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Formal narrative research report generator with two output modes.

## Status

Design phase. Not yet built. Priority module for Phase 2 prototype work.

## What It Does

The Research Report Writer generates a formal narrative report from the researcher's accumulated data -- research log, sources, citations, timeline, and FAN club. It produces two distinct output formats from the same underlying data.

## Output Mode 1: Researcher / Professional

For BCG submissions, peer review, and professional correspondence.

- GPS-compliant language throughout
- Evidence Explained citations, full footnotes
- Three-Layer analysis visible in source discussions
- Methodology explicit: search scope documented, negative results reported
- Conflicts disclosed and resolved (or flagged as unresolved)
- Formal proof argument if applicable

## Output Mode 2: Client

For family members and paying clients.

- Plain English narrative
- Methodology invisible
- No GPS or EE terminology
- Warm, readable tone
- Findings presented as story, not argument
- Sources cited in accessible form (not EE footnote style)

## Key Rule

Both outputs come from the same data. The module handles the translation. The researcher never writes two versions -- the system generates them.

## Prompt Engines

- Fact Narrator v4 (Steve Little): turns extracted facts into narrative prose
- GRA v8.5c (Steve Little): GPS enforcement for professional output mode

## Data Read

- All tables: persons, sources, citations, research_sessions, timeline_events, fan_club

## Data Written

- Report drafts stored and versioned (not yet in schema -- needs design)
