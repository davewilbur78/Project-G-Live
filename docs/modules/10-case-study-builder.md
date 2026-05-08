# Module 10: Case Study Builder

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

GPS-compliant proof argument builder with PowerPoint export.

## Status

Prototype v2 complete as of 2026-05-07. Test case: Jacob Singer / Yankel Springer identity proof.
Prototype file: /prototypes/case_study_builder_v2.html

## What It Does

The Case Study Builder guides the researcher through constructing a GPS-compliant proof argument for a complex genealogical question. It is the flagship module and the most sophisticated tool in the platform.

## Stages

1. **Research Question** -- Define the specific identity or relationship question being proved
2. **Source Inventory** -- Catalog all sources with full EE citations and Three-Layer analysis
3. **Evidence Chain** -- Build the logical chain connecting evidence to conclusion
4. **Reasonably Exhaustive Search Checklist** -- Account for all relevant source types searched and not searched (WISHLIST: dedicated stage between Evidence Chain and Conflict Analysis)
5. **Conflict Analysis** -- Identify and resolve all conflicting evidence
6. **Proof Argument** -- Write the formal GPS-compliant proof argument with inline footnotes

## Two Output Modes

Professional output: GPS language, EE citations, full footnotes, methodology visible.
Client output: Plain English narrative, methodology invisible.

## Footnote Rules

- Every factual claim in the proof argument carries an inline superscript footnote
- No naked claims -- every assertion is sourced
- Footnotes section at end of document keyed to superscripts

## PowerPoint Export

Exports the completed case study to .pptx via python-pptx endpoint.
Structured JSON sent from Next.js backend, .pptx binary returned.

## Key Rules (Firm)

- GEDCOM IDs never appear in output
- Ancestry tree links never cited as evidence
- FamilySearch ark: identifiers preserved in citations

## Test Case

Jacob Singer / Yankel Springer identity proof.
Research question: Is Yankel Springer of Lechowitz, Volhynia the same person as Jacob Singer in New York City records from 1915 onward?
Full research record: docs/research/ (produced 2026-05-07)

## Data Written

- Case study records (table not yet fully designed -- needs schema work)
- Links to sources, citations, persons tables
