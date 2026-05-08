# Architecture

> **This document is a reference summary only.**
> All operating instructions, rules, and versioning live in [AGENT.md](../AGENT.md).

## Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), React, Tailwind CSS |
| Backend | Next.js API routes |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (single user) |
| AI | Anthropic Claude API (claude-sonnet-4-5) |
| File storage | Supabase Storage |
| PowerPoint export | python-pptx via Python endpoint |
| Deployment | Vercel |

## Directory Structure

```
src/
├── app/          # Next.js App Router pages and layouts
├── api/          # API route handlers
└── lib/          # Shared utilities, Supabase client, AI wrappers
```

## Database (Supabase)

Supabase is the single source of truth for all person and source data. Core tables include:

- `persons` — individuals in the research tree
- `sources` — all sources, typed as Original/Derivative/Authored
- `citations` — links facts to sources (Evidence Explained format)
- `research_sessions` — Research Log entries
- `research_plans` — Research Plan Builder records
- `documents` — uploaded document records with transcription and analysis
- `timeline_events` — events tied to persons and sources
- `fan_club` — FAN network nodes and edges
- `dna_matches` — DNA match records linked to persons
- `correspondence` — outgoing research inquiries and responses
- `todos` — Research To-Do Tracker items

## AI Layer

All Claude API calls flow through a shared wrapper in `src/lib/ai.ts`. The wrapper:
- Injects the GRA v8.5c GPS enforcement system prompt
- Enforces anti-fabrication rules
- Routes to the appropriate Steve Little prompt engine based on module
- Returns structured JSON for all data-extraction tasks

## Module Architecture

Each module is self-contained:
- Its own page(s) in `src/app/`
- Its own API route(s) in `src/api/`
- Reads/writes to shared Supabase tables
- No module depends on another module's internal state

## PowerPoint Export

The Case Study Builder exports to .pptx via a lightweight Python endpoint.
The endpoint receives structured JSON from the Next.js backend and returns
a .pptx binary using python-pptx.

## Authentication

Single-user. Supabase Auth with email magic link or password.
No multi-tenancy, no roles, no sharing.
