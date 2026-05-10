# Architecture

> **This document is a reference summary only.**
> All operating instructions, rules, and versioning live in
> [AGENT.md](../AGENT.md).
>
> This document contains the Supabase schema reference and tech stack
> summary. It is the canonical schema reference for Phase 3 build work.
> Before building any data-touching module, review and expand the
> relevant table definitions here to column-level specification.

Last updated: 2026-05-10 02:40 UTC by Claude
Schema expanded to column-level from Case Study Builder v2 prototype data model.

---

## Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), React, Tailwind CSS |
| Backend | Next.js API routes |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (single user) |
| AI | Anthropic Claude API (claude-sonnet-4-20250514 at time of build) |
| File storage | Supabase Storage |
| PowerPoint export | python-pptx via Python endpoint |
| Deployment | Vercel |

---

## Directory Structure

```
src/
├── app/                    -- Next.js App Router pages and layouts
│   ├── layout.tsx
│   ├── page.tsx            -- Dashboard / home
│   └── case-study/
│       ├── page.tsx        -- Case study list
│       └── [id]/
│           └── page.tsx    -- Case study detail (the 5-stage builder)
├── components/             -- Shared React components
├── api/                    -- API route handlers (Next.js route handlers)
│   └── case-study/
│       └── route.ts
└── lib/
    ├── supabase.ts         -- Supabase client (browser + server)
    └── ai.ts               -- Claude API wrapper, prompt routing
```

---

## Database (Supabase)

Supabase is the single source of truth for all person and source data.
All IDs are UUID. All timestamps are timestamptz.

### Schema Design Notes

The column-level schema below was derived by reading the
Case Study Builder v2 prototype (prototypes/case_study_builder_v2.html)
and translating its JavaScript data structures (SOURCES, EVIDENCE,
CONFLICTS, PROOF_PARAGRAPHS, FOOTNOTE_DEFS) directly into Postgres
table definitions. The prototype proved the data model. This document
formalizes it.

Key design decision: sources are global records reusable across case
studies. Triage status (Green/Yellow/Red) is case-study-specific and
lives on the junction table case_study_sources, not on sources itself.

---

### persons

Individuals in the research tree. The subject of a case study is a
person. All modules that touch people reference this table.

```sql
persons (
  id              uuid primary key default gen_random_uuid(),
  display_name    text not null,          -- "Jacob Singer / Yankel Springer"
  given_name      text,
  surname         text,
  alt_names       text[],                 -- variant spellings, maiden names
  birth_date      text,                   -- text to allow approximate dates
  birth_place     text,
  death_date      text,
  death_place     text,
  notes           text,
  ancestry_id     text,                   -- Ancestry person ID (internal plumbing only)
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
)
```

---

### sources

Global source registry. Every source in the system lives here once.
Reusable across case studies, research logs, timelines.

Source type vocabulary (GPS / Evidence Explained):
- source_type: Original | Derivative | Authored
- info_type:   Primary | Secondary | Undetermined
- evidence_type: Direct | Indirect | Negative

```sql
sources (
  id              uuid primary key default gen_random_uuid(),
  label           text not null,          -- short display name: "1907 Passenger Manifest, S.S. Marion"
  source_type     text not null           -- Original | Derivative | Authored
                  check (source_type in ('Original','Derivative','Authored')),
  info_type       text not null           -- Primary | Secondary | Undetermined | N/A
                  check (info_type in ('Primary','Secondary','Undetermined','N/A')),
  evidence_type   text not null           -- Direct | Indirect | Negative
                  check (evidence_type in ('Direct','Indirect','Negative')),
  ee_full_citation    text not null,      -- Full Evidence Explained format citation
  ee_short_citation   text not null,      -- Short / footnote form
  repository      text,                   -- Archive, library, or database holding the source
  collection      text,                   -- Collection name within repository
  ark_identifier  text,                   -- FamilySearch ark: identifier (preserve always)
  nara_series     text,                   -- NARA microfilm series if applicable
  ancestry_url    text,                   -- Ancestry URL (not a citation -- for access only)
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
)
```

---

### case_studies

One record per proof argument. The case study is the container for
all five GPS stages. Subject is a person in the persons table.

```sql
case_studies (
  id                  uuid primary key default gen_random_uuid(),
  person_id           uuid references persons(id),
  research_question   text not null,
  subject_display     text not null,      -- "Jacob Singer / Yankel Springer"
  subject_vitals      text,               -- birth/death summary line
  researcher          text default 'Dave Wilbur',
  status              text default 'draft'
                      check (status in ('draft','in_progress','complete')),
  gps_stage_reached   int default 1       -- 1-5, tracks furthest stage completed
                      check (gps_stage_reached between 1 and 5),
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
)
```

---

### case_study_sources

Junction table linking a source to a case study.
Triage status lives here -- it is case-study-specific, not global.
Name recorded lives here -- it is how the name appears in this source
for this case, not a property of the source itself.

```sql
case_study_sources (
  id              uuid primary key default gen_random_uuid(),
  case_study_id   uuid references case_studies(id) on delete cascade,
  source_id       uuid references sources(id),
  triage_status   text not null
                  check (triage_status in ('GREEN','YELLOW','RED')),
  name_recorded   text,                   -- name as it appears in this source
  notes           text,                   -- case-specific notes about this source
  display_order   int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
)
```

---

### evidence_chain_links

The evidence chain for a case study (Stage 3). Each link is one
logical claim, its weight, and the narrative connecting it to sources.
Source references are to case_study_sources, not sources directly.

```sql
evidence_chain_links (
  id                  uuid primary key default gen_random_uuid(),
  case_study_id       uuid references case_studies(id) on delete cascade,
  display_order       int not null,
  claim               text not null,      -- "Same vessel and arrival date"
  weight              text not null
                      check (weight in ('Very Strong','Strong','Moderate','Corroborating')),
  sources_narrative   text,               -- prose connecting evidence to claim
  footnote_numbers    int[],              -- references to footnote_definitions
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
)
```

---

### conflicts

Source conflict records and resolutions (Stage 4).
Used by both Case Study Builder (Module 10) and Source Conflict
Resolver (Module 6). Source references are to case_study_sources.

```sql
conflicts (
  id              uuid primary key default gen_random_uuid(),
  case_study_id   uuid references case_studies(id) on delete cascade,
  title           text not null,          -- "SPRINGER (1907) vs. SINGER (1919 COA)"
  source_a_id     uuid references case_study_sources(id),
  source_b_id     uuid references case_study_sources(id),
  name_in_a       text,                   -- name as recorded in source A
  name_in_b       text,                   -- name as recorded in source B
  analysis_text   text,                   -- researcher's written resolution
  is_resolved     boolean default false,
  display_order   int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
)
```

---

### proof_paragraphs

The proof argument narrative (Stage 5). One row per paragraph.
Content uses [FN1] markers that are replaced with superscript
footnotes on render. Order is explicit via display_order.

```sql
proof_paragraphs (
  id              uuid primary key default gen_random_uuid(),
  case_study_id   uuid references case_studies(id) on delete cascade,
  display_order   int not null,
  content         text not null,          -- paragraph text with [FN1] markers
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
)
```

---

### footnote_definitions

Footnote entries for a case study, keyed by number.
These are the rendered footnotes in Stage 5.
Linked to case_study_sources for traceability.

```sql
footnote_definitions (
  id                  uuid primary key default gen_random_uuid(),
  case_study_id       uuid references case_studies(id) on delete cascade,
  footnote_number     int not null,
  citation_text       text not null,      -- full EE citation text as it appears in footnote
  case_study_source_id uuid references case_study_sources(id),
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique (case_study_id, footnote_number)
)
```

---

### citations

Links a factual claim (in any module) to a source.
Separate from proof_paragraphs -- this is the general citation layer
used by Research Log, Timeline, and other modules.

```sql
citations (
  id              uuid primary key default gen_random_uuid(),
  source_id       uuid references sources(id),
  context_type    text,                   -- 'timeline_event' | 'research_session' | 'document' | etc.
  context_id      uuid,                   -- FK to the referencing record (polymorphic)
  fact_claimed    text,                   -- the specific claim this citation supports
  ee_full_citation    text,               -- snapshot of citation at time of use
  ee_short_citation   text,
  created_at      timestamptz default now()
)
```

---

### Supporting Module Tables (names defined, columns TBD)

These tables exist conceptually. Column-level spec should be added
before building the module that writes to them.

```
research_sessions   -- Research Log (Module 3)
research_plans      -- Research Plan Builder (Module 2)
documents           -- Document Analysis Worksheet (Module 5)
timeline_events     -- Timeline Builder (Module 7)
fan_club            -- FAN Club Mapper (Module 8)
dna_matches         -- DNA Evidence Tracker (Module 14)
correspondence      -- Correspondence Log (Module 12)
todos               -- Research To-Do Tracker (Module 15)
```

---

## AI Layer

All Claude API calls flow through a shared wrapper in `src/lib/ai.ts`.
The wrapper:
- Injects the GRA v8.5c GPS enforcement system prompt
- Enforces anti-fabrication rules
- Routes to the appropriate Steve Little prompt engine based on module
- Returns structured JSON for all data-extraction tasks

Current Sonnet model string at time of scaffold: `claude-sonnet-4-20250514`
Update this string when a newer model is released.

---

## Module Architecture

Each module is self-contained:
- Its own page(s) in `src/app/`
- Its own API route(s) in `src/api/`
- Reads/writes to shared Supabase tables
- No module depends on another module's internal state

---

## PowerPoint Export

The Case Study Builder exports to .pptx via a lightweight Python
endpoint. The endpoint receives structured JSON from the Next.js
backend and returns a .pptx binary using python-pptx. This runs as
a separate service (local or serverless function on Vercel).
Design this endpoint when beginning the PowerPoint export feature.

---

## Authentication

Single-user. Supabase Auth with email magic link or password.
No multi-tenancy, no roles, no sharing.

---

## Claude Code Local Path

When working locally:
- Working directory: /Users/dave/Project-G-Live/
- Prepend `cd /Users/dave/Project-G-Live/ &&` to every bash command
- Never write files to any other directory

After every commit that changes AGENT.md, verify the version reached
GitHub by fetching the Contents API endpoint for AGENT.md and
confirming the version number in the decoded content matches what
was committed. Never use raw.githubusercontent.com for verification.
