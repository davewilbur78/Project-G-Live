# Module 03: Research Log

> See [AGENT.md](../../AGENT.md) for all operating rules.

## Purpose

Session-by-session record of what was searched, found, and not found.

## Status

Design phase. Not yet built.

## What It Does

The Research Log captures what happened in each research session. GPS requires the researcher to document not only what was found but what was searched and not found -- negative searches are evidence too.

Each log entry records:
- Date and session duration
- Research question being pursued
- Sources searched (with citations)
- Results: what was found, what was not found
- Notes and observations
- Next steps generated from this session

## Negative Evidence

Not finding a record is a meaningful result. The Research Log must capture negative searches explicitly -- "searched the 1900 federal census for New York City, enumeration district 432, did not find Jacob Singer or any variant" -- because this is part of demonstrating a reasonably exhaustive search to BCG standards.

## Session Summaries

At the end of a session, the AI generates a structured summary of what was accomplished. This summary feeds the Research Report Writer.

## Prompt Engine

Chat Conversation Abstractor v2 (Steve Little) powers session summary generation.

## Data Written

- `research_sessions` table: date, question, sources searched, results, notes, next steps
- Links to `research_plans`, `sources`, and `persons` tables
