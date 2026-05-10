# Architecture

> **This document is a reference summary only.**
> All operating instructions, rules, and versioning live in
> [AGENT.md](../AGENT.md).
>
> This document contains the Supabase schema reference and tech stack
> summary. It is the canonical schema reference for Phase 3 build work.
> Before building any data-touching module, review and expand the
> relevant table definitions here to column-level specification.

Last updated: 2026-05-10 21:30 UTC by Claude
Schema expanded: todos, research_plans, research_plan_items, source_conflicts added (Modules 15, 2, 6).

---

## Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), React, Tailwind CSS |
| Backend | Next.js API routes |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (single user) |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
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
│   ├── citation-builder/   -- Module 4
│   ├── case-study/         -- Module 10
│   ├── document-analysis/  -- Module 5
│   ├── research-log/       -- Module 3
│   ├── todos/              -- Module 15
│   ├── research-plans/     -- Module 2
│   ├── conflict-resolver/  -- Module 6
│   └── api/
│       ├── citation-builder/
│       ├── case-study/
│       ├── document-analysis/
│       ├── research-log/
│       ├── todos/
│       ├── research-plans/
│       ├── conflict-resolver/
│       └── persons/        -- Shared persons endpoint
├── components/
│   └── case-study/         -- Stage components
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
  gps_stage_reached   int default 1       -- 1-6, tracks furthest stage completed
                      check (gps_stage_reached between 1 and 6),
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

Source conflict records scoped to a Case Study (Stage 5).
This is the case-study-scoped conflicts table used by Case Study Builder (Module 10).
Do NOT use this table for the standalone Source Conflict Resolver (Module 6).
For standalone conflict resolution use source_conflicts (see below).

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

The proof argument narrative (Stage 6). One row per paragraph.
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
These are the rendered footnotes in Stage 6.
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

### documents

Document Analysis Worksheet records (Module 5).
Links to a source in the Citation Builder. Holds the transcription.
Facts extracted from the document live in document_facts.

```sql
documents (
  id                   uuid primary key default gen_random_uuid(),
  source_id            uuid references sources(id) on delete set null,
  label                text not null,         -- short descriptor: "1907 S.S. Marion manifest, Singer entry"
  transcription        text,                  -- full document transcription text
  transcription_status text not null default 'pending'
                       check (transcription_status in ('pending','complete','error')),
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
)
```

---

### document_facts

Discrete factual claims extracted from a document (Module 5).
Each fact is GPS-classified: source type, information type, evidence type.
ai_generated flag distinguishes AI-extracted from manually entered facts.

```sql
document_facts (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references documents(id) on delete cascade,
  claim_text    text not null,            -- precise standalone factual claim
  source_type   text not null check (source_type in ('Original','Derivative','Authored')),
  info_type     text not null check (info_type in ('Primary','Secondary','Undetermined','N/A')),
  evidence_type text not null check (evidence_type in ('Direct','Indirect','Negative')),
  display_order int not null default 0,
  ai_generated  boolean not null default false,
  notes         text,                     -- brief classification explanation
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
)
```

---

### research_sessions

Research Log entries (Module 3). One record per research session.
Captures the goal, sources consulted, finds, negative results, and
follow-up actions. GPS requires that negative searches be documented --
a source that yields nothing is still evidence.

Note: research_plan_id FK added by sql/006-add-research-plans.sql.

```sql
research_sessions (
  id               uuid primary key default gen_random_uuid(),
  session_date     date not null,
  title            text not null,              -- "1920 Census search for Jacob Singer in New York"
  goal             text not null,              -- the specific research question for this session
  person_id        uuid references persons(id) on delete set null,
  research_plan_id uuid references research_plans(id) on delete set null,  -- added by migration 006
  finds            text,                        -- what positive information was discovered
  negatives        text,                        -- what was searched but not found (GPS evidence)
  follow_up        text,                        -- follow-up actions generated by this session
  notes            text,                        -- freeform notes; input for AI abstraction
  status           text not null default 'draft'
                   check (status in ('draft','complete')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
)
```

---

### session_sources

Junction table: sources consulted during a research session (Module 3).
Tracks both sources that yielded results and those that yielded nothing.
The yielded_results flag is the GPS negative-evidence flag.
source_label is denormalized to preserve the record if the source is later deleted.

```sql
session_sources (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid not null references research_sessions(id) on delete cascade,
  source_id           uuid references sources(id) on delete set null,
  source_label        text not null,           -- denormalized source label
  yielded_results     boolean not null default false,  -- false = GPS negative evidence
  result_summary      text,                    -- what was found or why the source yielded nothing
  display_order       int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
)
```

---

### res_checklist_items

Reasonably Exhaustive Search Checklist items (Stage 4 of Case Study Builder).
Each row is one source category checked (or to be checked) for a case study.
Created by sql/002-add-res-checklist.sql.

```sql
res_checklist_items (
  id              uuid primary key default gen_random_uuid(),
  case_study_id   uuid references case_studies(id) on delete cascade,
  category        text not null,          -- source category checked: "Vital records", "Census", etc.
  searched        boolean default false,  -- has this category been searched?
  result_summary  text,                   -- what was found or why nothing was found
  display_order   int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
)
```

---

### todos

Research To-Do Tracker items (Module 15). Created by sql/005-add-todos.sql.
origin_module supports automated aggregation feeds from upstream modules.

```sql
todos (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  notes            text,
  priority         text not null default 'medium'
                   check (priority in ('high','medium','low')),
  status           text not null default 'open'
                   check (status in ('open','in_progress','complete','dropped')),
  person_id        uuid references persons(id) on delete set null,
  source_type_hint text,                  -- hint about what type of source to consult
  due_date         date,
  completed_at     timestamptz,           -- auto-stamped when status set to complete
  origin_module    text not null default 'manual',  -- 'manual' | 'research_log' | etc.
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
)
```

---

### research_plans

Research Plan Builder (Module 2). Created by sql/006-add-research-plans.sql.
Holds the overall plan and AI-generated strategy summary.

```sql
research_plans (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  research_question   text not null,
  person_id           uuid references persons(id) on delete set null,
  time_period         text,               -- AI context: approximate time range
  geography           text,               -- AI context: geographic scope
  community           text,               -- AI context: ethnic or religious community
  strategy_summary    text,               -- AI-generated strategy overview
  status              text not null default 'draft'
                      check (status in ('draft','active','complete')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
)
```

---

### research_plan_items

Individual source strategy items within a research plan (Module 2).
Created by sql/006-add-research-plans.sql.
AI generates 8-12 prioritized items; researcher can add manual items.

```sql
research_plan_items (
  id              uuid primary key default gen_random_uuid(),
  plan_id         uuid not null references research_plans(id) on delete cascade,
  source_type     text not null,          -- what type of source to consult
  rationale       text not null,          -- why this source is relevant to the research question
  priority        text not null check (priority in ('High','Medium','Low')),
  status          text not null default 'pending'
                  check (status in ('pending','complete','negative','skipped')),
  notes           text,
  display_order   int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
)
```

---

### source_conflicts

Standalone source conflict records (Module 6 -- Source Conflict Resolver).
Created by sql/007-add-source-conflicts.sql.

IMPORTANT: This is NOT the same as the case-study-scoped `conflicts` table.
This table references global sources directly and does not require a case study.
Use this table for Module 6. Use `conflicts` only for Case Study Builder Stage 5.

```sql
source_conflicts (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,         -- short description of the conflict
  person_id        uuid references persons(id) on delete set null,
  source_a_id      uuid references sources(id) on delete set null,
  source_b_id      uuid references sources(id) on delete set null,
  fact_in_dispute  text not null
                   check (fact_in_dispute in (
                     'birth_date','birth_place','name','age',
                     'death_date','death_place','residence','immigration',
                     'marriage','occupation','other'
                   )),
  description      text not null,         -- full description of the discrepancy
  source_a_value   text,                  -- what source A says about the disputed fact
  source_b_value   text,                  -- what source B says about the disputed fact
  analysis_text    text,                  -- GPS-compliant conflict analysis (AI-assisted or manual)
  resolution       text,                  -- conclusion the evidence supports
  resolution_basis text
                   check (resolution_basis in (
                     'source_quality','preponderance','corroboration','inconclusive'
                   )),
  status           text not null default 'open'
                   check (status in ('open','in_progress','resolved')),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
)
```

---

### Tables Not Yet Built (column spec required before building)

```
timeline_events         -- Timeline Builder (Module 7) -- address/residence as first-class fact
fan_club_members        -- FAN Club Mapper (Module 8)
dna_matches             -- DNA Evidence Tracker (Module 14)
correspondence          -- Correspondence Log (Module 12)
-- Module 16 (Research Investigation) requires 5 new tables -- see docs/modules/16-research-investigation.md
```

---

## AI Layer

All Claude API calls flow through a shared wrapper in `src/lib/ai.ts`.
The wrapper:
- Injects the GRA v8.5c GPS enforcement system prompt
- Enforces anti-fabrication rules
- Routes to the appropriate Steve Little prompt engine based on module
- Returns structured JSON for all data-extraction tasks

Current model string: `claude-sonnet-4-6`
Update `src/lib/ai.ts` when a newer model is released.

---

## Module Architecture

Each module is self-contained:
- Its own page(s) in `src/app/`
- Its own API route(s) in `src/app/api/`
- Reads/writes to shared Supabase tables
- No module depends on another module's internal state

Shared endpoints:
- `/api/persons` -- persons list and create, used across modules
- `/api/citation-builder` -- sources list, used by Research Log, Document Analysis, Case Study

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
