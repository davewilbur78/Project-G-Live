# Architecture

> **This document is a reference summary only.**
> All operating instructions, rules, and versioning live in
> [AGENT.md](../AGENT.md).
>
> This document contains the Supabase schema reference and tech stack
> summary. It is the canonical schema reference for Phase 3 build work.
> Before building any data-touching module, review and expand the
> relevant table definitions here to column-level specification.

Last updated: 2026-05-11 09:35 UTC by Claude
Schema expanded: Genealogical data foundation complete (migrations 009-014).
  persons updated (name components, sex, flags, dual-date sort fields).
  New tables: families, family_members, repositories, associations, event_types.
  sources updated (repository_id FK).
  Dual-date pattern confirmed complete across all tables.
  addresses and timeline_events (migration 008) now documented here.

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
│   ├── timeline/           -- Module 7
│   └── api/
│       ├── citation-builder/
│       ├── case-study/
│       ├── document-analysis/
│       ├── research-log/
│       ├── todos/
│       ├── research-plans/
│       ├── conflict-resolver/
│       ├── timeline/
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

### Dual-Date Pattern

Every genealogical date field uses two columns:
- `_display` TEXT -- the date exactly as the researcher wants it shown.
  Accommodates approximate language: "about 1885", "before 1900",
  "between 1880 and 1890". Never computed automatically.
- `_sort` DATE -- a PostgreSQL DATE for range queries and timeline ordering.
  Nullable. Set by the researcher (or AI assist). NULL means no sortable
  date -- not that no date exists.

Note: migration 008 (addresses, timeline_events) uses the inverse naming
convention (event_date for sort, date_display for display). Both satisfy
the requirement. A future cleanup migration may normalize naming.

Dual-date audit: COMPLETE as of migration 014. All tables verified.

---

### persons

Individuals in the research tree. The subject of a case study is a
person. All modules that touch people reference this table.

Updated by sql/009-persons-foundation.sql.

```sql
persons (
  id                uuid primary key default gen_random_uuid(),

  -- Name
  display_name      text not null,          -- "Jacob Singer / Yankel Springer"
  given_name        text,
  surname           text,
  lnprefix          text,                   -- last name prefix: van, de, von, della
  suffix            text,                   -- Jr., Sr., III, IV
  title             text,                   -- Dr., Rev., Esq., Capt.
  name_prefix       text,                   -- GEDCOM NPFX -- rarely used
  nickname          text,                   -- name they actually went by
  alt_names         text[],                 -- variant spellings, maiden names

  -- Demographic
  sex               text                    -- M | F | U (unknown)
                    check (sex in ('M', 'F', 'U')),
  living            boolean not null default false,
  private           boolean not null default false,

  -- Vital dates (dual-date pattern)
  birth_date        text,                   -- display string: "about 1885", "3 June 1907"
  birth_date_sort   date,                   -- machine-sortable (nullable)
  birth_place       text,
  death_date        text,                   -- display string
  death_date_sort   date,                   -- machine-sortable (nullable)
  death_place       text,

  -- Audit
  notes             text,
  ancestry_id       text,                   -- Ancestry person ID (internal plumbing only)
  changedby         text,                   -- who last modified this record
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
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

Updated by sql/011-repositories.sql: added repository_id FK.

```sql
sources (
  id                  uuid primary key default gen_random_uuid(),
  label               text not null,          -- "1907 Passenger Manifest, S.S. Marion"
  source_type         text not null
                      check (source_type in ('Original','Derivative','Authored')),
  info_type           text not null
                      check (info_type in ('Primary','Secondary','Undetermined','N/A')),
  evidence_type       text not null
                      check (evidence_type in ('Direct','Indirect','Negative')),
  ee_full_citation    text not null,          -- Full Evidence Explained format citation
  ee_short_citation   text not null,          -- Short / footnote form
  repository          text,                   -- free-text repository name (legacy; kept for compat)
  repository_id       uuid references repositories(id) on delete set null,  -- proper FK (use this)
  collection          text,                   -- Collection name within repository
  ark_identifier      text,                   -- FamilySearch ark: identifier (preserve always)
  nara_series         text,                   -- NARA microfilm series if applicable
  ancestry_url        text,                   -- for access only; not a citation
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
)
```

---

### repositories

Lookup table for repositories holding sources. Built by sql/011-repositories.sql.
When a repository record exists, reference it via sources.repository_id.
The free-text sources.repository field is kept for backward compatibility.

```sql
repositories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null
                check (type in (
                  'archive',      -- NARA, TNA, state archives
                  'library',      -- public or academic library
                  'online',       -- Ancestry, FamilySearch, Newspapers.com
                  'courthouse',   -- county/municipal courthouse
                  'church',       -- congregation, diocese, synagogue
                  'other'
                )),
  url           text,
  address_line  text,
  city          text,
  state         text,
  country       text,
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
)
```

---

### families

Family units. One record per documented family relationship.
Built by sql/010-families.sql.

partner1_id / partner2_id -- NOT husband_id / wife_id.
We do not replicate GEDCOM's binary sex assumption in our naming.

```sql
families (
  id                    uuid primary key default gen_random_uuid(),
  partner1_id           uuid references persons(id) on delete set null,
  partner2_id           uuid references persons(id) on delete set null,

  -- Marriage / union (dual-date pattern)
  marriage_date_display text,
  marriage_date_sort    date,
  marriage_place        text,
  marriage_type         text
                        check (marriage_type in (
                          'MARR',   -- formal marriage
                          'MARB',   -- marriage banns
                          'MARL',   -- marriage license
                          'MARS',   -- marriage settlement
                          'COHA',   -- cohabitation / common law
                          'other'
                        )),

  -- Dissolution (dual-date pattern)
  div_date_display      text,
  div_date_sort         date,
  div_place             text,

  living                boolean not null default false,
  private               boolean not null default false,
  notes                 text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),

  constraint families_different_partners
    check (partner1_id is null or partner2_id is null or partner1_id <> partner2_id)
)
```

---

### family_members

Bridge table: a person's membership in a family unit.
Built by sql/010-families.sql.

role 'partner' = one of the two named partners in the family record.
role 'child'   = a child in the family unit.
A person can be a partner in multiple families (remarriage).
A person appears once per family (unique constraint on person_id + family_id).

```sql
family_members (
  id                        uuid primary key default gen_random_uuid(),
  person_id                 uuid not null references persons(id) on delete cascade,
  family_id                 uuid not null references families(id) on delete cascade,
  role                      text not null check (role in ('child', 'partner')),

  -- How this child is related to each partner (null for partners)
  relationship_to_partner1  text
                            check (relationship_to_partner1 in (
                              'natural', 'adopted', 'step', 'foster', 'unknown'
                            )),
  relationship_to_partner2  text
                            check (relationship_to_partner2 in (
                              'natural', 'adopted', 'step', 'foster', 'unknown'
                            )),

  birth_order               int,
  has_descendants           boolean not null default false,  -- denormalized, for display
  created_at                timestamptz default now(),
  updated_at                timestamptz default now(),

  unique (person_id, family_id)
)
```

---

### associations

Documented relationships between two people, grounded in a source record.
This IS the FAN Club data model. Module 8 (FAN Club Mapper) builds on top of it.
Built by sql/012-associations.sql.

The association is directional: the source names A in relation to B.
For mutual relationships (e.g., neighbors), create two rows.
Do not record associations without a source_id.

```sql
associations (
  id                    uuid primary key default gen_random_uuid(),
  person_id             uuid not null references persons(id) on delete cascade,
  associated_person_id  uuid not null references persons(id) on delete cascade,
  association_type      text not null
                        check (association_type in (
                          'witness', 'godparent', 'employer', 'employee',
                          'neighbor', 'colleague', 'boarder', 'landlord',
                          'attorney', 'physician', 'other'
                        )),
  description           text,
  source_id             uuid references sources(id) on delete set null,

  -- When the association was documented (dual-date pattern)
  date_display          text,
  date_sort             date,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),

  constraint associations_no_self_link check (person_id <> associated_person_id)
)
```

---

### event_types

Formal lookup table for timeline event types. Built by sql/013-event-types.sql.
Tags use GEDCOM standard codes where they exist.
Seeded with 18 standard built-in types at migration time.

timeline_events has a legacy event_type text check constraint that stays for
backward compatibility. event_type_id is the forward-looking FK for new code.

```sql
event_types (
  id            uuid primary key default gen_random_uuid(),
  tag           text not null unique,    -- BIRT, DEAT, RESI, OCCU, IMMI, etc.
  display_name  text not null,           -- "Birth", "Death", "Residence"
  scope         text not null check (scope in ('individual', 'family')),
  is_built_in   boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz default now()
)
```

Seeded tags: BIRT, DEAT, BAPM, BURI, MARR, MARB, MARL, DIV, RESI, IMMI,
EMIG, NATU, MILI, OCCU, CENS, LAND, EDUC, EVEN.

---

### addresses

First-class table for all addresses extracted from any record type.
Addresses are evidence artifacts from a source -- not profile fields on a person.
See Address-as-Evidence principle in AGENT.md.
Built by sql/008-add-timeline-addresses.sql.

```sql
addresses (
  id                uuid primary key default gen_random_uuid(),
  person_id         uuid references persons(id) on delete cascade,
  source_id         uuid references sources(id) on delete set null,
  address_role      text not null default 'residence'
                    check (address_role in (
                      'residence', 'employer', 'next_of_kin', 'witness',
                      'informant', 'decedent', 'applicant', 'beneficiary', 'other'
                    )),

  -- Raw text: exactly as written in the source
  raw_text          text,

  -- Normalized fields: researcher's interpretation
  street_address    text,
  city              text,
  county            text,
  state_province    text,
  country           text,

  -- Geocoded coordinates (nullable)
  lat               numeric(10, 7),
  lng               numeric(10, 7),

  -- Date of the source record (dual-date -- note: 008 naming convention)
  address_date      date,                -- sort date
  date_qualifier    text default 'exact'
                    check (date_qualifier in ('exact','about','before','after','calculated')),
  date_display      text,               -- display string

  notes             text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
)
```

---

### timeline_events

One row per discrete, sourced, GPS-classified life event.
Built by sql/008-add-timeline-addresses.sql.
Updated by sql/013-event-types.sql: added event_type_id FK.

```sql
timeline_events (
  id                uuid primary key default gen_random_uuid(),
  person_id         uuid references persons(id) on delete cascade,

  -- Event type (legacy text check + new FK -- both coexist)
  event_type        text not null
                    check (event_type in (
                      'birth', 'death', 'marriage', 'divorce',
                      'residence', 'immigration', 'emigration',
                      'naturalization', 'military_service',
                      'occupation', 'land_record', 'census',
                      'baptism', 'burial', 'education', 'other'
                    )),
  event_type_id     uuid references event_types(id) on delete set null,  -- forward-looking FK

  -- Date fields (dual-date -- note: 008 naming convention)
  event_date        date,               -- sort date
  event_date_end    date,
  date_qualifier    text default 'exact'
                    check (date_qualifier in ('exact','about','before','after','between','calculated')),
  date_display      text,               -- display string

  -- Place summary
  place_name        text,
  city              text,
  county            text,
  state_province    text,
  country           text,

  -- Address FK (residence events primarily)
  address_id        uuid references addresses(id) on delete set null,

  -- Residence duration
  residence_date_from       date,
  residence_date_to         date,
  residence_from_qualifier  text,
  residence_to_qualifier    text,
  residence_current         boolean default false,

  -- GPS / source
  source_id         uuid references sources(id) on delete set null,
  evidence_type     text check (evidence_type in ('Direct','Indirect','Negative')),

  description       text,
  notes             text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
)
```

---

### case_studies

One record per proof argument. The case study is the container for
all six GPS stages. Subject is a person in the persons table.

Note: gps_stage_reached check in sql/001 says between 1 and 5.
The production app has 6 stages. A future migration should correct this.

```sql
case_studies (
  id                  uuid primary key default gen_random_uuid(),
  person_id           uuid references persons(id),
  research_question   text not null,
  subject_display     text not null,
  subject_vitals      text,
  researcher          text default 'Dave Wilbur',
  status              text default 'draft'
                      check (status in ('draft','in_progress','complete')),
  gps_stage_reached   int default 1
                      check (gps_stage_reached between 1 and 5),  -- BUG: should be 1-6
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
)
```

---

### case_study_sources

Junction table linking a source to a case study.
Triage status lives here -- it is case-study-specific, not global.

```sql
case_study_sources (
  id              uuid primary key default gen_random_uuid(),
  case_study_id   uuid references case_studies(id) on delete cascade,
  source_id       uuid references sources(id),
  triage_status   text not null check (triage_status in ('GREEN','YELLOW','RED')),
  name_recorded   text,
  notes           text,
  display_order   int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
)
```

---

### evidence_chain_links

The evidence chain for a case study (Stage 3).

```sql
evidence_chain_links (
  id                  uuid primary key default gen_random_uuid(),
  case_study_id       uuid references case_studies(id) on delete cascade,
  display_order       int not null,
  claim               text not null,
  weight              text not null
                      check (weight in ('Very Strong','Strong','Moderate','Corroborating')),
  sources_narrative   text,
  footnote_numbers    int[],
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
)
```

---

### conflicts

Source conflict records scoped to a Case Study (Stage 5).
IMPORTANT: NOT the same as source_conflicts (Module 6).
Use this table only for Case Study Builder Stage 5.

```sql
conflicts (
  id              uuid primary key default gen_random_uuid(),
  case_study_id   uuid references case_studies(id) on delete cascade,
  title           text not null,
  source_a_id     uuid references case_study_sources(id),
  source_b_id     uuid references case_study_sources(id),
  name_in_a       text,
  name_in_b       text,
  analysis_text   text,
  is_resolved     boolean default false,
  display_order   int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
)
```

---

### proof_paragraphs

The proof argument narrative (Stage 6). One row per paragraph.
Content uses [FN1] markers replaced with superscript footnotes on render.

```sql
proof_paragraphs (
  id              uuid primary key default gen_random_uuid(),
  case_study_id   uuid references case_studies(id) on delete cascade,
  display_order   int not null,
  content         text not null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
)
```

---

### footnote_definitions

Footnote entries for a case study, keyed by number.

```sql
footnote_definitions (
  id                      uuid primary key default gen_random_uuid(),
  case_study_id           uuid references case_studies(id) on delete cascade,
  footnote_number         int not null,
  citation_text           text not null,
  case_study_source_id    uuid references case_study_sources(id),
  created_at              timestamptz default now(),
  updated_at              timestamptz default now(),
  unique (case_study_id, footnote_number)
)
```

---

### citations

General citation layer for Research Log, Timeline, and other modules.
Separate from proof_paragraphs (which is Case Study-specific).

```sql
citations (
  id                  uuid primary key default gen_random_uuid(),
  source_id           uuid references sources(id),
  context_type        text,       -- 'timeline_event' | 'research_session' | 'document' | etc.
  context_id          uuid,       -- polymorphic FK to referencing record
  fact_claimed        text,
  ee_full_citation    text,
  ee_short_citation   text,
  created_at          timestamptz default now()
)
```

---

### documents

Document Analysis Worksheet records (Module 5).

```sql
documents (
  id                   uuid primary key default gen_random_uuid(),
  source_id            uuid references sources(id) on delete set null,
  label                text not null,
  transcription        text,
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

```sql
document_facts (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references documents(id) on delete cascade,
  claim_text    text not null,
  source_type   text not null check (source_type in ('Original','Derivative','Authored')),
  info_type     text not null check (info_type in ('Primary','Secondary','Undetermined','N/A')),
  evidence_type text not null check (evidence_type in ('Direct','Indirect','Negative')),
  display_order int not null default 0,
  ai_generated  boolean not null default false,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
)
```

---

### research_sessions

Research Log entries (Module 3). One record per research session.
research_plan_id FK added by sql/006-add-research-plans.sql.

```sql
research_sessions (
  id               uuid primary key default gen_random_uuid(),
  session_date     date not null,
  title            text not null,
  goal             text not null,
  person_id        uuid references persons(id) on delete set null,
  research_plan_id uuid references research_plans(id) on delete set null,
  finds            text,
  negatives        text,
  follow_up        text,
  notes            text,
  status           text not null default 'draft' check (status in ('draft','complete')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
)
```

---

### session_sources

Junction table: sources consulted during a research session (Module 3).
yielded_results = false is the GPS negative-evidence flag.

```sql
session_sources (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid not null references research_sessions(id) on delete cascade,
  source_id           uuid references sources(id) on delete set null,
  source_label        text not null,           -- denormalized
  yielded_results     boolean not null default false,
  result_summary      text,
  display_order       int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
)
```

---

### res_checklist_items

Reasonably Exhaustive Search Checklist items (Stage 4 of Case Study Builder).
Created by sql/002-add-res-checklist.sql.

```sql
res_checklist_items (
  id              uuid primary key default gen_random_uuid(),
  case_study_id   uuid references case_studies(id) on delete cascade,
  category        text not null,
  searched        boolean default false,
  result_summary  text,
  display_order   int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
)
```

---

### todos

Research To-Do Tracker items (Module 15). Created by sql/005-add-todos.sql.

```sql
todos (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  notes            text,
  priority         text not null default 'medium' check (priority in ('high','medium','low')),
  status           text not null default 'open'
                   check (status in ('open','in_progress','complete','dropped')),
  person_id        uuid references persons(id) on delete set null,
  source_type_hint text,
  due_date         date,
  completed_at     timestamptz,
  origin_module    text not null default 'manual',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
)
```

---

### research_plans

Research Plan Builder (Module 2). Created by sql/006-add-research-plans.sql.

```sql
research_plans (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  research_question   text not null,
  person_id           uuid references persons(id) on delete set null,
  time_period         text,
  geography           text,
  community           text,
  strategy_summary    text,
  status              text not null default 'draft' check (status in ('draft','active','complete')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
)
```

---

### research_plan_items

Individual source strategy items within a research plan (Module 2).
Created by sql/006-add-research-plans.sql.

```sql
research_plan_items (
  id              uuid primary key default gen_random_uuid(),
  plan_id         uuid not null references research_plans(id) on delete cascade,
  source_type     text not null,
  rationale       text not null,
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

IMPORTANT: NOT the case-study-scoped `conflicts` table.
Use this table for Module 6. Use `conflicts` only for Case Study Builder Stage 5.

```sql
source_conflicts (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  person_id        uuid references persons(id) on delete set null,
  source_a_id      uuid references sources(id) on delete set null,
  source_b_id      uuid references sources(id) on delete set null,
  fact_in_dispute  text not null
                   check (fact_in_dispute in (
                     'birth_date','birth_place','name','age',
                     'death_date','death_place','residence','immigration',
                     'marriage','occupation','other'
                   )),
  description      text not null,
  source_a_value   text,
  source_b_value   text,
  analysis_text    text,
  resolution       text,
  resolution_basis text
                   check (resolution_basis in (
                     'source_quality','preponderance','corroboration','inconclusive'
                   )),
  status           text not null default 'open' check (status in ('open','in_progress','resolved')),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
)
```

---

### Tables Not Yet Built (column spec required before building)

```
-- Module 16 (Research Investigation) requires 5 new tables
-- see docs/modules/16-research-investigation.md

-- Module 14 (DNA Evidence Tracker)
dna_matches

-- Module 12 (Correspondence Log)
correspondence
```

Note: fan_club_members is NOT listed here. The associations table (sql/012)
IS the FAN Club data model. Module 8 (FAN Club Mapper) builds on top of
associations -- no separate fan_club_members table is needed.

---

### Known Schema Issues (not urgent)

1. gps_stage_reached on case_studies: check constraint says between 1 and 5.
   Production app has 6 stages. Fix in a future migration.

2. Naming convention inconsistency: migration 008 uses event_date / date_display
   (sort field is primary). Migrations 009+ use birth_date_display / birth_date_sort
   (display field is primary). Both satisfy the dual-date requirement.
   A future cosmetic migration may normalize.

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
