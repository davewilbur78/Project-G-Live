-- Migration 016: Research Investigation module tables (Module 16)
-- TIMESTAMP: 2026-05-11
-- Design spec: docs/modules/16-research-investigation.md
-- Run via Supabase SQL Editor using Monaco setValue() method -- DO NOT TYPE MANUALLY
-- SQL Editor URL: https://supabase.com/dashboard/project/slqjooudyfvmnaoetdvi/sql/new
--
-- Five new tables:
--   investigations              one row per named investigation
--   investigation_messages      full conversation thread, one row per message
--   investigation_evidence      documents and records captured
--   investigation_candidates    candidate persons within an investigation
--   investigation_matrix_cells  disambiguation matrix (candidate x record_type)

-- ============================================================
-- INVESTIGATIONS
-- ============================================================

create table investigations (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  problem_statement text not null,

  entry_point       text not null check (entry_point in (
                      'known_problem',
                      'mid_research',
                      'conflict_detection'
                    )),

  status            text not null default 'in_progress' check (status in (
                      'in_progress',
                      'resolved',
                      'stalled',
                      'handed_off'
                    )),

  -- Primary subject of the investigation
  primary_person_id uuid references persons(id) on delete set null,

  -- Optional links to modules that triggered this investigation
  source_conflict_id uuid references source_conflicts(id) on delete set null,
  case_study_id      uuid references case_studies(id) on delete set null,

  -- AI-maintained orientation block (JSON: determined_so_far, next_question)
  -- Updated by the messages API as the investigation progresses
  orientation       jsonb,

  -- Researcher-authored or AI-drafted conclusion summary
  conclusion_notes  text,

  -- Handoff to Case Study Builder when problem crystallizes
  handed_off_to_case_study_id uuid references case_studies(id) on delete set null,

  opened_at         timestamptz not null default now(),
  last_worked_at    timestamptz not null default now(),
  resolved_at       timestamptz,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- INVESTIGATION_MESSAGES
-- Full conversation thread. One row per message.
-- Never deleted. The reasoning trail is permanent.
-- ============================================================

create table investigation_messages (
  id               uuid primary key default gen_random_uuid(),
  investigation_id uuid not null references investigations(id) on delete cascade,
  role             text not null check (role in ('user', 'assistant')),
  content          text not null,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- INVESTIGATION_EVIDENCE
-- Documents and records captured during the investigation.
-- Links to Citation Builder (sources) where applicable.
-- ============================================================

create table investigation_evidence (
  id               uuid primary key default gen_random_uuid(),
  investigation_id uuid not null references investigations(id) on delete cascade,
  source_id        uuid references sources(id) on delete set null,
  title            text not null,
  record_type      text,    -- e.g. city_directory, census, naturalization, obituary
  record_date      text,    -- free-form date string (dual-date display format)
  notes            text,
  added_at         timestamptz not null default now()
);

-- ============================================================
-- INVESTIGATION_CANDIDATES
-- Candidate persons identified during the investigation.
-- Linkable to the main persons table on resolution.
-- ============================================================

create table investigation_candidates (
  id               uuid primary key default gen_random_uuid(),
  investigation_id uuid not null references investigations(id) on delete cascade,
  person_id        uuid references persons(id) on delete set null,
  -- Set when candidate is confirmed and promoted to main persons table

  candidate_name   text not null,
  notes            text,
  status           text not null default 'unresolved' check (status in (
                     'unresolved', 'confirmed', 'eliminated'
                   )),
  created_at       timestamptz not null default now()
);

-- ============================================================
-- INVESTIGATION_MATRIX_CELLS
-- The disambiguation matrix.
-- Keyed by candidate + record_type (column header).
-- Unique per candidate x record_type pair.
-- ============================================================

create table investigation_matrix_cells (
  id               uuid primary key default gen_random_uuid(),
  investigation_id uuid not null references investigations(id) on delete cascade,
  candidate_id     uuid not null references investigation_candidates(id) on delete cascade,
  record_type      text not null,  -- column header, e.g. "1920 census", "1925 city directory"
  value            text,
  -- null = not yet searched
  -- empty string = searched, not found
  -- populated text = what was found

  source_id        uuid references sources(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (candidate_id, record_type)
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_investigations_status             on investigations(status);
create index idx_investigations_primary_person_id  on investigations(primary_person_id);
create index idx_investigations_last_worked_at     on investigations(last_worked_at desc);

create index idx_inv_messages_investigation_id     on investigation_messages(investigation_id);
create index idx_inv_messages_created_at           on investigation_messages(created_at);

create index idx_inv_evidence_investigation_id     on investigation_evidence(investigation_id);

create index idx_inv_candidates_investigation_id   on investigation_candidates(investigation_id);

create index idx_inv_matrix_investigation_id       on investigation_matrix_cells(investigation_id);
create index idx_inv_matrix_candidate_id           on investigation_matrix_cells(candidate_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- Single-user platform: allow all operations.
-- ============================================================

alter table investigations enable row level security;
alter table investigation_messages enable row level security;
alter table investigation_evidence enable row level security;
alter table investigation_candidates enable row level security;
alter table investigation_matrix_cells enable row level security;

create policy "Allow all on investigations"
  on investigations for all using (true) with check (true);

create policy "Allow all on investigation_messages"
  on investigation_messages for all using (true) with check (true);

create policy "Allow all on investigation_evidence"
  on investigation_evidence for all using (true) with check (true);

create policy "Allow all on investigation_candidates"
  on investigation_candidates for all using (true) with check (true);

create policy "Allow all on investigation_matrix_cells"
  on investigation_matrix_cells for all using (true) with check (true);
