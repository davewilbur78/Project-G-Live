# Module 01: GEDCOM Bridge

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Onboarding wizard that parses FamilyTreeMaker GEDCOM exports, triages citation quality, flags research gaps, and pre-populates projects.

## Status

Design phase. Not yet built.

## What It Does

The GEDCOM Bridge is the entry point for existing research. When the user exports a GEDCOM from FamilyTreeMaker, this module:

1. Parses the GEDCOM file and extracts all persons, events, and source citations
2. Triages each source citation by quality: Green (citable), Yellow (needs review), Red (not citable)
3. Flags Ancestry tree links and other non-source citations for replacement
4. Pre-populates the persons table and sources table in Supabase
5. Generates a triage report showing what needs attention before research begins

## Citation Triage Logic

- **Green**: Source has enough information to construct an EE citation. Original or high-quality derivative source.
- **Yellow**: Source exists but citation is incomplete or ambiguous. Needs review before use.
- **Red**: Not a citable source. Ancestry tree links, undocumented assertions, GEDCOM-only references.

## Key Rules

- GEDCOM files are infrastructure only. The GEDCOM is never cited and never appears in researcher-facing output.
- GEDCOM IDs (@I327@, etc.) are internal plumbing only. They must never appear in reports or proof arguments.
- Ancestry tree links discovered in the GEDCOM must be flagged Red and require the researcher to locate the underlying original source.

## Prompt Engine

GEDCOM Analysis assistant (Steve Little) powers the parsing layer.

## Data Written

- `persons` table: one row per individual
- `sources` table: one row per source, with triage status
- `citations` table: initial citation records from GEDCOM data
