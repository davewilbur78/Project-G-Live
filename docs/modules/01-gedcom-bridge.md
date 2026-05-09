# Module 01: GEDCOM Bridge

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Onboarding layer that parses FamilyTreeMaker GEDCOM exports, triages
citation quality, and pre-populates the Supabase database.

## Status

NOT STARTED -- Design phase.

## Description

The GEDCOM Bridge is the onboarding layer for Project-G-Live. It accepts
a GEDCOM export from FamilyTreeMaker, parses all persons, relationships,
and source citations, and evaluates citation quality using a
Green/Yellow/Red triage system. Green citations are fully formed and
citable; Yellow citations are partial or informal; Red citations are
missing, unusable, or Ancestry tree links that must be replaced with
original sources. The module flags documentation gaps, surfaces persons
with no sources, and pre-populates the Supabase database with structured
person and source records ready for use across all other modules. The
GEDCOM Analysis Assistant prompt engine powers the parsing and evaluation
layer.

The GEDCOM is infrastructure only. It is never cited. GEDCOM IDs are
internal plumbing that must never appear in researcher-facing output.

## Key Inputs

- GEDCOM file exported from FamilyTreeMaker

## Key Outputs

- Populated `persons` and `sources` tables in Supabase
- Citation triage report classifying each existing citation as Green
  (fully formed), Yellow (partial or informal), or Red (missing or
  unusable -- including all Ancestry tree links)
- List of persons with no sources, surfaced as gaps for follow-up

## GPS Touchpoints

- Establishes baseline citation quality for all imported research
- Flags missing and unusable citations to enforce the GPS requirement
  for complete and accurate citations (GPS element 2)
- Surfaces undocumented persons to support reasonably exhaustive search
  planning (GPS element 1)
- Red-flags Ancestry tree links that are not sources and must be replaced

## Prompt Engines Used

- **GEDCOM Analysis assistant** (Steve Little) -- parses GEDCOM structure
  and evaluates citation quality
- **GRA v8.5c** -- GPS enforcement layer applied across all analysis

## Data Written to Supabase

- `persons` -- individual records imported from GEDCOM
- `sources` -- source records extracted from GEDCOM citation fields, with
  triage classification
- `citations` -- links between person facts and sources

## Connection to Other Modules

- Feeds person and source records to all other modules
- Yellow and Red citations queue for remediation in Citation Builder (04)
- Persons with no sources surface as action items in Research To-Do
  Tracker (15)
- Pre-populated persons are the starting point for Research Plan Builder
  (02), Timeline Builder (07), and Family Group Sheet Builder (11)
- FAN Club Mapper (08) and DNA Evidence Tracker (14) reference persons
  imported via this module

## Build Notes

This module is intentionally placed later in the build order (position 9).
It is an onboarding convenience -- it pre-populates data from existing
research. The core research workflow does not depend on it. Build the
working application first; bring existing research data in after the
core is proven.

Prerequisites when ready to build:
- Supabase schema finalized (see /docs/architecture.md)
- Next.js app scaffolded
- GEDCOM Analysis Assistant prompt integrated into AI layer
- Citation Builder (04) complete, since triage output feeds it
