# System Overview

> **This document is a reference summary only.**
> All operating instructions, rules, and versioning live in [AGENT.md](../AGENT.md).

Project-G-Live is a personal genealogy operations platform built for one user. It is not a research database or a tree -- it is a working and documentation layer that operates alongside existing tools.

## Core Purpose

The platform exists to bridge the gap between serious genealogical research and professional-grade methodology. It enforces the Genealogical Proof Standard (GPS) in plain language, ensures every fact has a citation, and structures research in a way that produces defensible conclusions. This platform supports the user's path toward BCG (Board for Certification of Genealogists) certification.

## Relationship to Existing Tools

| Tool | Role |
|------|------|
| Ancestry.com | Holds the family tree; remains the authoritative tree |
| FamilyTreeMaker | Desktop tree manager; source of GEDCOM exports |
| Project-G-Live | Working layer: planning, logging, citing, analyzing, documenting |

Project-G-Live does not replace Ancestry or FamilyTreeMaker. It is additive.

## Data Flow

1. Existing research enters via GEDCOM export from FamilyTreeMaker (Module 01)
2. Persons and sources are parsed, triaged, and stored in Supabase
3. Researchers build plans, log sessions, and analyze documents through the module suite
4. Outputs include citations, timelines, FAN club maps, research reports, and proof arguments
5. Finished case studies export to PowerPoint for archival and sharing

## GPS Enforcement

Every module enforces GPS terminology and principles:

- **Reasonably exhaustive search** -- Research Plan Builder and Research To-Do Tracker
- **Complete and accurate citations** -- Citation Builder and Document Analysis Worksheet
- **Analysis and correlation** -- Source Conflict Resolver and Timeline Builder
- **Resolution of conflicting evidence** -- Source Conflict Resolver
- **Soundly reasoned, coherently written conclusion** -- Case Study Builder and Research Report Writer

## AI Integration

The AI layer never fabricates data. All AI outputs are presented as drafts for human review. GPS compliance is enforced at the prompt layer using Steve Little's GRA v8.5c prompt engine.
