# Module 11: Family Group Sheet Builder

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Fully cited documentation of a nuclear family unit -- every date, place,
and relationship assertion carries its citation and evidence classification.
Unknown fields are explicitly marked, never guessed.

## Status

NOT STARTED -- Design phase.

## Description

The Family Group Sheet Builder produces fully cited documentation of a
nuclear family unit -- one set of parents and their children, with all
known life events and their sources. Unlike a tree view, the family group
sheet is a working research document: every date, place, and relationship
assertion carries its citation and evidence classification. The module
draws from all sources in Supabase linked to the relevant persons and
assembles them into a standardized format. Fields with no sourced data
are clearly marked as unknown rather than left blank or filled with
guesses. Family group sheets serve as the foundation for research reports
and case studies.

## Key Inputs

- Person records for parents and children (from `persons` table)
- All sources and citations linked to the relevant persons

## Key Outputs

- Standardized family group sheet document with every date, place,
  and relationship assertion carrying its citation and evidence
  classification
- Fields with no sourced data explicitly marked as unknown -- never
  left blank or guessed

## GPS Touchpoints

- Enforces complete and accurate citations (GPS element 2) for every
  assertion on the sheet
- Anti-fabrication: unknown fields are marked explicitly, reflecting
  the GPS prohibition on unsupported claims
- Provides a structured, fully citable foundation for proof arguments
  and research reports

## Prompt Engines Used

- **GRA v8.5c** -- GPS enforcement layer applied to all output,
  ensuring no unsourced assertions appear

## Data Written to Supabase

- Output document storage format and table are TBD. Needs design before
  this module is built. Reads from `persons`, `sources`, and `citations`.

## Connection to Other Modules

- Reads citations and source classifications from Citation Builder (04)
- Reads classified facts from Document Analysis Worksheet (05)
- Serves as the foundational family unit document for Research Report
  Writer (09) and Case Study Builder (10)

## Build Notes

Prerequisites:
- Citation Builder (04) complete
- Document Analysis Worksheet (05) complete
- Person records exist in Supabase with citations attached
- Output document storage table designed and added to /docs/architecture.md
