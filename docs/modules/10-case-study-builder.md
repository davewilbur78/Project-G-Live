# Module 10: Case Study Builder

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

GPS-compliant proof argument builder for complex genealogical conclusions.
The flagship module. PowerPoint export. Prototype complete.

## Status

PROTOTYPE COMPLETE (v2) as of 2026-05-07.
Prototype file: /prototypes/case_study_builder_v2.html
Test case: Jacob Singer / Yankel Springer identity proof.
Research record: /docs/research/Singer_Springer_Research_Record.docx
Full production build is Phase 3 work.

## Description

The Case Study Builder is the flagship module. It guides the researcher
through building a GPS-compliant proof argument for a complex genealogical
conclusion -- typically an identity, parentage, or relationship claim that
cannot be established by a single direct-evidence source. The module
structures the argument using all five GPS elements: reasonably exhaustive
search, complete and accurate citations, analysis and correlation of
evidence, resolution of conflicting evidence, and soundly reasoned written
conclusion. The Fact Narrator v4 engine produces narrative prose from the
structured argument. Finished case studies export to PowerPoint via the
python-pptx endpoint, producing a slide deck suitable for archival or
presentation.

The prototype (v2) implements the full five-stage workflow with hardcoded
Singer/Springer data. The production build will read from and write to
the live Supabase database, connecting to all source modules.

## Workflow Stages

Stage 1 -- Research Question: Define the specific identity, parentage,
or relationship claim being proved.

Stage 2 -- Source Inventory and Triage: Catalog all sources with full
EE citations and Three-Layer analysis. Each source is triaged as Green
(fully cited, usable), Yellow (cited but content not yet transcribed),
or Red (missing, unlocated, or explained absence).

Stage 3 -- Evidence Chain: Build the logical chain connecting evidence
to conclusion. Each link is assessed for weight (Very Strong / Strong /
Moderate / Corroborating). Gaps are documented and must be acknowledged
in the final argument.

Stage 4 -- Conflict Analysis: Identify all conflicts between sources
and document the researcher's resolution of each. No conflict may be
bypassed. Unresolved conflicts must be disclosed in the proof argument.

Stage 5 -- Proof Argument: Write the GPS-compliant narrative proof
argument. Every factual claim carries an inline superscript footnote.
No naked claims. Footnotes keyed to the full EE citations from Stage 2.

## Two Output Modes

PROFESSIONAL OUTPUT: GPS language, full EE citations, footnotes,
Three-Layer analysis visible. For BCG submissions, peer review,
professional correspondence.

CLIENT OUTPUT: Plain English narrative. Methodology invisible. Warm
and readable. For family members and paying clients.

## Key Inputs

- Research question (identity, parentage, or relationship claim)
- All relevant sources, citations, and Three-Layer classifications
  from Citation Builder (04) and Document Analysis Worksheet (05)
- Conflict resolution notes from Source Conflict Resolver (06)
- Timeline data from Timeline Builder (07)

## Key Outputs

- Structured GPS-compliant proof argument addressing all five GPS
  elements explicitly
- Narrative prose proof argument (two output modes: professional and
  client-facing)
- PowerPoint export (.pptx) via python-pptx endpoint

## GPS Touchpoints

- Addresses all five GPS elements explicitly:
  1. Reasonably exhaustive search -- documented scope of research
     and acknowledged gaps
  2. Complete and accurate citations -- every claim cited with full
     EE footnote
  3. Analysis and correlation of evidence -- all evidence examined,
     weight assessed, chain constructed
  4. Resolution of conflicting evidence -- all conflicts documented
     and resolved or disclosed
  5. Soundly reasoned, coherently written conclusion -- the proof
     argument itself

## Prompt Engines Used

- **Fact Narrator v4** (Steve Little) -- generates narrative prose
  from the structured proof argument
- **GRA v8.5c** -- GPS enforcement layer applied to all argument
  structure and language

## Data Written to Supabase

- Case study storage table is TBD -- not yet defined in architecture.
  This table must be designed and added to /docs/architecture.md before
  the production build of this module begins. It must link to sources,
  citations, persons, and evidence chain records.

## Connection to Other Modules

- Primary consumer of output from Citation Builder (04), Document
  Analysis Worksheet (05), Source Conflict Resolver (06), and
  Timeline Builder (07)
- Case study conclusions may be incorporated into Research Report
  Writer (09)
- PowerPoint export delivered via the python-pptx endpoint defined
  in /docs/architecture.md

## Firm Rules

- GEDCOM IDs never appear in output
- Ancestry tree links never cited as evidence
- FamilySearch ark: identifiers preserved in full in citations
- Every factual claim in the proof argument carries an inline footnote
- No naked claims anywhere in the argument
- Unresolved conflicts and unlocated sources must be disclosed in the
  argument, not omitted

## Reasonably Exhaustive Search Checklist (Backlog)

A dedicated stage between Evidence Chain and Conflict Analysis -- where
the researcher must affirmatively account for every source type that
should have been searched and either confirm it was searched or explain
why it was not. This is a GPS requirement and must be added before the
production build. See Backlog in AGENT.md.

## Build Notes

The prototype exists and proves the UX. Build the production version
immediately after Citation Builder (04) is complete. Don't wait for
all upstream modules to be finished -- start building this with what
you have and connect modules as they come online.

Prerequisites for production build:
- Citation Builder (04) complete
- Document Analysis Worksheet (05) complete
- Source Conflict Resolver (06) complete (conflict resolution data feeds
  Stage 4)
- Case study storage table designed and added to /docs/architecture.md
- python-pptx export endpoint built (can be stubbed initially)
- Fact Narrator v4 prompt integrated into AI layer
- Reasonably Exhaustive Search Checklist stage designed and added to
  this document before building

The prototype's Stage 2 (Source Inventory triage) maps directly to
Citation Builder output. Stage 4 (Conflict Analysis) maps directly to
Source Conflict Resolver output. Study the prototype carefully before
designing the production data model.
