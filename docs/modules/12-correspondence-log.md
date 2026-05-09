# Module 12: Correspondence Log

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Tracks all outgoing research inquiries and responses -- courts, archives,
repositories, other researchers, DNA match outreach. Prevents duplicate
outreach and documents the research trail.

## Status

NOT STARTED -- Design phase.

## Description

The Correspondence Log tracks all outgoing research inquiries and their
responses -- letters to courthouses, emails to archives, requests to
repositories, queries to other researchers, and DNA match outreach. For
each inquiry the log records the date sent, the recipient, the repository
or person contacted, the specific question asked, the date of response
(if any), and the outcome. Unanswered inquiries surface as follow-up
items in the Research To-Do Tracker. The log creates a complete record
of who has been contacted about what, preventing duplicate outreach and
documenting the research trail for GPS compliance.

## Key Inputs

- Outgoing inquiry details: date sent, recipient name, repository or
  person contacted, specific question asked
- Response received: date, outcome, any records provided

## Key Outputs

- Log entry per inquiry with full tracking fields
- Follow-up flags for unanswered inquiries, surfaced to Research
  To-Do Tracker (15)
- Complete record preventing duplicate outreach

## GPS Touchpoints

- Documents the full scope of outreach as part of reasonably exhaustive
  search (GPS element 1)
- Creates an auditable research trail showing what was requested, from
  whom, and when -- a GPS compliance requirement for formal submissions

## Prompt Engines Used

- **GRA v8.5c** -- GPS enforcement layer applied to all output

## Data Written to Supabase

- `correspondence` -- inquiry records with date, recipient, question,
  response date, and outcome

## Connection to Other Modules

- Unanswered inquiries automatically surface as follow-up items in
  Research To-Do Tracker (15)
- Responses that yield new records are passed to Citation Builder (04)
  and Document Analysis Worksheet (05)

## Build Notes

This module is largely standalone. It needs Citation Builder (04) only
for processing responses that yield new source records.

Prerequisites:
- Citation Builder (04) complete
- `correspondence` table defined in Supabase schema (see
  /docs/architecture.md -- table is listed but column-level detail
  may need expansion)
