# Module 08: FAN Club Mapper

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Tracks the Family, Associates, and Neighbors network surrounding a
research subject -- especially important for Ashkenazi Jewish research
where close-community networks frequently unlock brick walls.

## Status

NOT STARTED -- Design phase.

## Description

The FAN Club Mapper tracks the Family, Associates, and Neighbors network
surrounding a research subject -- the people who appear alongside them
in records but may not be direct family members. In records from
close-knit ethnic and religious communities such as Ashkenazi Jewish
communities, FAN club members are often distant relatives, landsmen,
or business associates whose records can unlock brick walls. The module
allows the researcher to add FAN members, document how they are
connected (witnessed a deed, lived next door in census, named as
godparent, etc.), and link their own person records for parallel
research. Network visualization shows the web of connections around
a subject.

## Key Inputs

- Person record for the research subject
- FAN member details: name, connection type, supporting record references
- Connection documentation (e.g., witnessed a deed, adjacent in census,
  named as godparent)

## Key Outputs

- FAN network visualization showing the web of connections around the
  subject
- Linked person records for FAN members, making them researchable in
  their own right
- Connection records documenting the source basis for each FAN
  relationship

## GPS Touchpoints

- Expands the scope of reasonably exhaustive search (GPS element 1)
  beyond direct family to associates and neighbors who may hold evidence
- FAN members often provide indirect evidence (GPS element 3) relevant
  to the subject's identity, parentage, or relationships
- Particularly important for Ashkenazi Jewish research where
  close-community networks frequently provide the only path around
  brick walls

## Prompt Engines Used

- **GRA v8.5c** -- GPS enforcement layer applied to all connection
  analysis and output

## Data Written to Supabase

- `fan_club` -- network nodes (FAN members) and edges (connection type
  and source basis)
- `persons` -- new person records created for FAN members added to
  the database

## Connection to Other Modules

- FAN members become full person records available to all other modules
- Particularly relevant to DNA Evidence Tracker (14) for correlating
  Ashkenazi DNA matches with known FAN relationships
- FAN network context informs Research Plan Builder (02) strategies
  for the subject
- Connection documentation draws citations from Citation Builder (04)

## Build Notes

Prerequisites:
- Citation Builder (04) complete -- every FAN connection must be
  documented with a source basis
- Person records exist in Supabase (entered manually or via GEDCOM Bridge)
- `fan_club` table defined in Supabase schema (see /docs/architecture.md)
