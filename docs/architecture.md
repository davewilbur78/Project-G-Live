# Architecture

> **This document is a reference summary only.**
> All operating instructions, rules, and versioning live in
> [AGENT.md](../AGENT.md).
>
> This document contains the Supabase schema reference and tech stack
> summary. It is the canonical schema reference for Phase 3 build work.
> Before building any data-touching module, review and expand the
> relevant table definitions here to column-level specification.

## Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), React, Tailwind CSS |
| Backend | Next.js API routes |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (single user) |
| AI | Anthropic Claude API (use current Sonnet model at time of build) |
| File storage | Supabase Storage |
| PowerPoint export | python-pptx via Python endpoint |
| Deployment | Vercel |

## Directory Structure

```
src/
├── app/        -- Next.js App Router pages and layouts
├── api/        -- API route handlers
└── lib/        -- Shared utilities, Supabase client, AI wrappers
```

## Database (Supabase)

Supabase is the single source of truth for all person and source data.

### Current Table Definitions

These tables are defined. Column-level specifications should be added
here before each module is built. Tables marked TBD require design
work before the module that writes to them can begin.

- `persons` -- individuals in the research tree
- `sources` -- all sources, typed as Original/Derivative/Authored
- `citations` -- links facts to sources (Evidence Explained format)
- `research_sessions` -- Research Log entries
- `research_plans` -- Research Plan Builder records
- `documents` -- uploaded document records with transcription and analysis
- `timeline_events` -- events tied to persons and sources
- `fan_club` -- FAN network nodes and edges
- `dna_matches` -- DNA match records linked to persons
- `correspondence` -- outgoing research inquiries and responses
- `todos` -- Research To-Do Tracker items

### Tables Requiring Design (TBD)

These tables are needed but not yet defined. Design and add them
before building the modules that depend on them:

- `conflicts` -- source conflict records and resolution notes
  (required by Module 06: Source Conflict Resolver)
- `case_studies` -- case study storage
  (required by Module 10: Case Study Builder production build)
- Report/output storage format for Module 09 (Research Report Writer)
  and Module 11 (Family Group Sheet Builder) -- TBD

## AI Layer

All Claude API calls flow through a shared wrapper in `src/lib/ai.ts`.
The wrapper:
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

The Case Study Builder exports to .pptx via a lightweight Python
endpoint. The endpoint receives structured JSON from the Next.js
backend and returns a .pptx binary using python-pptx. This runs as
a separate service (local or serverless function on Vercel).

## Authentication

Single-user. Supabase Auth with email magic link or password.
No multi-tenancy, no roles, no sharing.

## Claude Code Local Path

When working locally:
- Working directory: /Users/dave/Project-G-Live/
- Prepend `cd /Users/dave/Project-G-Live/ &&` to every bash command
- Never write files to any other directory

After every commit that changes AGENT.md, verify the version reached
GitHub by fetching:
https://api.github.com/repos/davewilbur78/Project-G-Live/contents/AGENT.md
and confirming the version number in the decoded content matches what
was committed. Never use raw.githubusercontent.com for verification.
