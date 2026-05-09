# Module 03: Research Log

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Session-by-session record of what was searched, found, and not found --
the auditable research trail required by GPS.

## Status

NOT STARTED -- Design phase.

## Description

The Research Log records every research session in structured, searchable
form. For each session the log captures the date, the researcher's goal,
each source searched (including those that yielded nothing -- negative
evidence is evidence), what was found or not found, and any follow-up
actions generated. The Chat Conversation Abstractor v2 prompt engine can
convert a freeform research conversation or session notes into a properly
structured log entry. Entries are stored in Supabase and linked to the
relevant person records and research plans, creating a complete, auditable
research trail.

## Key Inputs

- Session date and researcher's stated goal
- Sources searched during the session, including those that yielded nothing
- Freeform session notes or research conversation (optionally converted
  by prompt engine)
- Links to relevant person records and research plans

## Key Outputs

- Structured log entry: date, goal, sources searched, finds, negatives,
  follow-up actions
- Complete, auditable research trail across all sessions

## GPS Touchpoints

- Documents reasonably exhaustive search (GPS element 1) by recording
  what was searched and what was not found
- Captures negative evidence explicitly -- under GPS, a source that yields
  nothing is still evidence and must be documented
- Supports complete and accurate citations (GPS element 2) by linking each
  find to its source

## Prompt Engines Used

- **Chat Conversation Abstractor v2** (Steve Little) -- converts freeform
  session notes or conversations into structured log entries
- **GRA v8.5c** -- GPS enforcement layer applied across all output

## Data Written to Supabase

- `research_sessions` -- structured log entries linked to persons and
  research plans

## Connection to Other Modules

- Linked to Research Plan Builder (02) -- sessions are conducted against
  active plans
- Newly found sources are passed to Citation Builder (04) and Document
  Analysis Worksheet (05)
- Negative searches and follow-up actions feed Research To-Do Tracker (15)
- Session records are drawn into Research Report Writer (09) to document
  the full scope of research conducted

## Build Notes

Prerequisites:
- Citation Builder (04) complete
- Research Plan Builder (02) recommended but not strictly required --
  the log can record sessions without a formal plan
- Chat Conversation Abstractor v2 prompt integrated into AI layer
