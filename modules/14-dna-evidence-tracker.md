# Module 14: DNA Evidence Tracker

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Integrates DNA match data with documentary evidence -- designed
specifically for Ashkenazi Jewish endogamy. DNA evidence is always
corroborating, never standalone proof.

## Status

NOT STARTED -- Design phase.

## Description

The DNA Evidence Tracker integrates DNA match data with documentary
evidence to support genealogical conclusions. The module allows the
researcher to import or manually enter DNA match records, link matches
to persons in the Supabase database, document the hypothesized
relationship and the documentary evidence supporting it, and track the
status of each match (identified, working hypothesis, unresolved). The
tracker is designed with Ashkenazi Jewish endogamy in mind -- matches
are tagged with the relevant ancestral line being investigated, and the
module surfaces which brick-wall lines have corroborating DNA evidence
and which do not.

DNA evidence is always treated as corroborating indirect evidence under
GPS. It is never cited as standalone proof. The module enforces this
rule at the output layer.

The existing Ashkenazi DNA genealogy workflow (external to this platform)
integrates with this module. Match data from that workflow can be
imported here and linked to the documentary evidence record.

## Key Inputs

- DNA match data (imported or manually entered): match name, platform,
  shared cM, shared segments
- Person records for identified or hypothesized matches
- Hypothesized relationship and the documentary evidence supporting it
- Ancestral line being investigated for each match

## Key Outputs

- Match records linked to person records in Supabase
- Status tracking per match: identified, working hypothesis, or
  unresolved
- Summary of corroborating DNA evidence by ancestral line and brick wall

## GPS Touchpoints

- DNA evidence is classified as corroborating indirect evidence under
  GPS -- never treated as standalone proof (GPS element 3)
- Tracks which brick-wall lines have DNA corroboration and which do not,
  informing reasonably exhaustive search planning (GPS element 1)
- Ashkenazi endogamy context is documented to explain elevated shared cM
  values that cannot be interpreted by standard relationship tables --
  this context is required for GPS-compliant analysis of Ashkenazi matches

## Prompt Engines Used

- **GRA v8.5c** -- GPS enforcement layer applied to all evidence
  classification and output; enforces DNA-as-corroboration rule

## Data Written to Supabase

- `dna_matches` -- match records linked to persons with status,
  hypothesized relationship, and supporting documentary evidence
- `persons` -- new person records created for DNA matches who are
  added to the database

## Connection to Other Modules

- Match persons are linked to existing person records from GEDCOM
  Bridge (01) and FAN Club Mapper (08) -- FAN relationships are
  particularly important for Ashkenazi match analysis
- Documentary evidence supporting match hypotheses is drawn from
  Citation Builder (04) and Document Analysis Worksheet (05)
- Unresolved matches surface as action items in Research To-Do
  Tracker (15)

## Build Notes

Prerequisites:
- Citation Builder (04) complete
- Person records in Supabase (entered manually or via GEDCOM Bridge)
- FAN Club Mapper (08) recommended -- Ashkenazi DNA match analysis
  depends heavily on known FAN network relationships
- `dna_matches` table defined in Supabase schema (see
  /docs/architecture.md)
