# Module 15: Research To-Do Tracker

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Running research agenda organized by person, priority, and source type --
aggregates action items from all other modules and ensures no research
lead is dropped.

## Status

NOT STARTED -- Design phase.

## Description

The Research To-Do Tracker is a running research agenda organized by
person, priority, and source type. It aggregates follow-up actions from
all other modules -- unresolved research questions from the Research Plan
Builder, negative searches that need retry, unanswered correspondence
from the Correspondence Log, unresolved conflicts from the Source
Conflict Resolver, chronological gaps from the Timeline Builder, and
any manually added items. Each to-do is linked to the relevant person
record and can be prioritized, assigned to a research session, and
marked complete. The tracker provides a clear, actionable picture of
where each line of research stands and what needs to happen next.

## Key Inputs

- Follow-up actions aggregated automatically from all other modules
- Manually added research agenda items

## Key Outputs

- Prioritized research agenda organized by person, priority level,
  and source type
- Clear, actionable picture of where each line of research stands
  and what needs to happen next
- Completion tracking per item

## GPS Touchpoints

- Ensures no research leads are dropped, directly supporting reasonably
  exhaustive search (GPS element 1)
- Tracks unresolved conflicts (GPS element 4) and unanswered
  correspondence as active agenda items
- Creates an auditable record of what was identified as needing follow-up
  and when it was resolved

## Prompt Engines Used

- **GRA v8.5c** -- GPS enforcement layer applied across all output

## Data Written to Supabase

- `todos` -- to-do records linked to relevant persons, with priority,
  source type, origin module, and completion status

## Connection to Other Modules

- Aggregates action items from: Research Plan Builder (02), Research
  Log (03), Source Conflict Resolver (06), Timeline Builder (07),
  Correspondence Log (12), and DNA Evidence Tracker (14)
- Completed items drive new sessions back into Research Log (03)
- Acts as the operational hub that connects all research activity
  across the platform

## Build Notes

This module is largely standalone and can be built at any point, but it
is most useful when upstream modules are already generating action items
to aggregate. Consider building a basic version early (manually entered
items only) and expanding the aggregation feeds as each source module
comes online.

Prerequisites:
- `todos` table defined in Supabase schema (see /docs/architecture.md)
- At minimum: manual entry capability works standalone
- Full value requires: Research Log (03), Source Conflict Resolver (06),
  Timeline Builder (07), Correspondence Log (12) operational to feed
  automated aggregation
