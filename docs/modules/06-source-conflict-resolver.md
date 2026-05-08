# Module 06: Source Conflict Resolver

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Side-by-side conflict analysis using GPS preponderance hierarchy.

## Status

Design phase. Not yet built.

## What It Does

When two or more sources conflict on a fact, this module guides the researcher through a structured resolution process using the GPS preponderance standard.

1. Researcher identifies the conflicting fact and the sources that conflict
2. Module displays sources side by side with their Three-Layer classifications
3. Module applies the GPS hierarchy to assess which source has greater weight:
   - Original sources outweigh derivatives
   - Primary information outweighs secondary
   - Direct evidence outweighs indirect
   - Corroborating evidence increases weight
4. Researcher writes a resolution statement explaining which source prevails and why
5. Resolution is attached to the fact record

## GPS Preponderance Standard

GPS does not require certainty -- it requires that the conclusion be more likely correct than any alternative, based on the totality of evidence. The resolver helps the researcher articulate and document this reasoning.

## Unresolved Conflicts

Not all conflicts can be resolved. The module allows the researcher to mark a conflict as unresolved and file it as a separate research question. Unresolved conflicts must be disclosed in formal output.

## Data Written

- `sources` table: conflict flags and resolution status
- `citations` table: resolution statements linked to facts
- `research_plans` table: unresolved conflicts generate new research questions
