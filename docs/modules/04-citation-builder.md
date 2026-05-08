# Module 04: Citation Builder

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Evidence Explained-style citations for every source type.

## Status

Design phase. Not yet built.

## What It Does

The Citation Builder constructs complete, properly formatted citations following Evidence Explained (EE) standards. Every source in the platform must have both a full citation and a short footnote form before it can be cited in formal output.

The builder works as an interview:
1. User selects the source type (vital record, census, passenger manifest, naturalization record, etc.)
2. Module asks for the specific fields required for that source type under EE format
3. Module generates both the full citation and the short footnote form
4. Both are stored and linked to the source record

## EE Citation Components

Every citation in the platform carries:
- **Full citation**: Complete first-reference form per EE
- **Short footnote**: Abbreviated subsequent-reference form per EE
- **Source type**: Original, Derivative, or Authored
- **Information type**: Primary or Secondary (informant's knowledge)
- **Evidence type**: Direct, Indirect, or Negative

## Key Rules

- Both full citation and short footnote are required before a source may be cited in output
- Source type terminology: Original, Derivative, Authored -- never "primary source" or "secondary source"
- Evidence type terminology: Direct, Indirect, Negative -- never "primary evidence" or "secondary evidence"

## Prompt Engine

Image Citation Builder v2 (Steve Little) powers citation generation for uploaded document images.

## Data Written

- `sources` table: full citation, short footnote, source type, information type, evidence type
- `citations` table: links between facts and sources
