# Module 14: DNA Evidence Tracker

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Integrates DNA match data with documentary evidence.

## Status

Design phase. Not yet built.

## What It Does

The DNA Evidence Tracker links DNA match data from testing platforms (FTDNA, Ancestry, MyHeritage, GEDMatch) to documentary evidence in the platform. DNA evidence is treated as evidence under GPS -- it must be analyzed, correlated with documentary evidence, and cited.

## Key Features

- Import DNA match data (cM values, segment data, predicted relationships)
- Link matches to persons in the `persons` table
- Track shared matches across multiple kits
- Attach documentary evidence to matches to confirm or refute predicted relationships
- Generate DNA evidence summaries for inclusion in proof arguments

## Ashkenazi Endogamy Context

This platform serves an Ashkenazi Jewish genealogy workflow. Endogamy significantly affects DNA relationship predictions -- matches share more DNA than expected due to population bottlenecks, making cM-based relationship predictions unreliable at standard thresholds. The tracker must:
- Flag endogamy as a variable in all relationship predictions
- Support segment triangulation across multiple kits
- Never present a DNA match as proof of relationship without corroborating documentary evidence

## GPS Treatment of DNA Evidence

- DNA evidence is Direct, Indirect, or Negative like any other evidence
- DNA alone is rarely sufficient for a GPS-compliant proof argument
- DNA evidence must be correlated with documentary evidence
- The endogamy caveat must be disclosed in any proof argument using DNA

## Data Written

- `dna_matches` table: match records with cM, segments, predicted relationship, linked persons
- Links to `persons`, `sources`, and `citations` tables
