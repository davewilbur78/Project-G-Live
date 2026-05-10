-- Project-G-Live: Initial schema migration
-- Run this in the Supabase SQL editor to provision all tables.
-- Derived from docs/architecture.md (column-level spec as of 2026-05-10)
--
-- Run order: this file only. All foreign key dependencies are handled
-- by the ordering of CREATE TABLE statements below.

-- Enable UUID generation (already enabled in Supabase by default, but safe to re-run)
create extension if not exists "pgcrypto";


-- ---------------------------------------------------------------
-- persons
-- ---------------------------------------------------------------
create table if not exists persons (
  id              uuid primary key default gen_random_uuid(),
  display_name    text not null,
  given_name      text,
  surname         text,
  alt_names       text[],
  birth_date      text,           -- text to allow approximate dates
  birth_place     text,
  death_date      text,
  death_place     text,
  notes           text,
  ancestry_id     text,           -- internal plumbing only; never surface in output
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);


-- ---------------------------------------------------------------
-- sources
-- Global registry. Every source in the system lives here once.
-- source_type / info_type / evidence_type are GPS vocabulary only.
-- Never use "primary source" or "secondary source" -- those are
-- non-GPS terms. The GPS terms are Original/Derivative/Authored,
-- Primary/Secondary/Undetermined information, Direct/Indirect/Negative evidence.
-- ---------------------------------------------------------------
create table if not exists sources (
  id                  uuid primary key default gen_random_uuid(),
  label               text not null,
  source_type         text not null
                        check (source_type in ('Original','Derivative','Authored')),
  info_type           text not null
                        check (info_type in ('Primary','Secondary','Undetermined','N/A')),
  evidence_type       text not null
                        check (evidence_type in ('Direct','Indirect','Negative')),
  ee_full_citation    text not null,
  ee_short_citation   text not null,
  repository          text,
  collection          text,
  ark_identifier      text,       -- FamilySearch ark: identifier -- preserve always
  nara_series         text,
  ancestry_url        text,       -- for access only; not a citation
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);


-- ---------------------------------------------------------------
-- case_studies
-- ---------------------------------------------------------------
create table if not exists case_studies (
  id                  uuid primary key default gen_random_uuid(),
  person_id           uuid references persons(id),
  research_question   text not null,
  subject_display     text not null,
  subject_vitals      text,
  researcher          text default 'Dave Wilbur',
  status              text default 'draft'
                        check (status in ('draft','in_progress','complete')),
  gps_stage_reached   int default 1
                        check (gps_stage_reached between 1 and 5),
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);


-- ---------------------------------------------------------------
-- case_study_sources
-- Junction table. Triage status is case-study-specific.
-- ---------------------------------------------------------------
create table if not exists case_study_sources (
  id              uuid primary key default gen_random_uuid(),
  case_study_id   uuid references case_studies(id) on delete cascade,
  source_id       uuid references sources(id),
  triage_status   text not null
                    check (triage_status in ('GREEN','YELLOW','RED')),
  name_recorded   text,           -- name as it appears in this source for this case
  notes           text,
  display_order   int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);


-- ---------------------------------------------------------------
-- evidence_chain_links
-- ---------------------------------------------------------------
create table if not exists evidence_chain_links (
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
);


-- ---------------------------------------------------------------
-- conflicts
-- ---------------------------------------------------------------
create table if not exists conflicts (
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
);


-- ---------------------------------------------------------------
-- proof_paragraphs
-- Content uses [FN1] markers replaced with superscript on render.
-- ---------------------------------------------------------------
create table if not exists proof_paragraphs (
  id              uuid primary key default gen_random_uuid(),
  case_study_id   uuid references case_studies(id) on delete cascade,
  display_order   int not null,
  content         text not null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);


-- ---------------------------------------------------------------
-- footnote_definitions
-- ---------------------------------------------------------------
create table if not exists footnote_definitions (
  id                      uuid primary key default gen_random_uuid(),
  case_study_id           uuid references case_studies(id) on delete cascade,
  footnote_number         int not null,
  citation_text           text not null,
  case_study_source_id    uuid references case_study_sources(id),
  created_at              timestamptz default now(),
  updated_at              timestamptz default now(),
  unique (case_study_id, footnote_number)
);


-- ---------------------------------------------------------------
-- citations
-- General citation layer for Research Log, Timeline, and other modules.
-- Separate from proof_paragraphs (which is Case Study-specific).
-- ---------------------------------------------------------------
create table if not exists citations (
  id                  uuid primary key default gen_random_uuid(),
  source_id           uuid references sources(id),
  context_type        text,       -- 'timeline_event' | 'research_session' | 'document' | etc.
  context_id          uuid,       -- polymorphic FK to referencing record
  fact_claimed        text,
  ee_full_citation    text,       -- snapshot of citation at time of use
  ee_short_citation   text,
  created_at          timestamptz default now()
);


-- ---------------------------------------------------------------
-- Row Level Security
-- Single-user app. Enable RLS on all tables and allow all
-- authenticated operations. Revisit if auth is added later.
-- ---------------------------------------------------------------
alter table persons enable row level security;
alter table sources enable row level security;
alter table case_studies enable row level security;
alter table case_study_sources enable row level security;
alter table evidence_chain_links enable row level security;
alter table conflicts enable row level security;
alter table proof_paragraphs enable row level security;
alter table footnote_definitions enable row level security;
alter table citations enable row level security;

-- Allow all operations for authenticated users
create policy "authenticated_all" on persons for all to authenticated using (true) with check (true);
create policy "authenticated_all" on sources for all to authenticated using (true) with check (true);
create policy "authenticated_all" on case_studies for all to authenticated using (true) with check (true);
create policy "authenticated_all" on case_study_sources for all to authenticated using (true) with check (true);
create policy "authenticated_all" on evidence_chain_links for all to authenticated using (true) with check (true);
create policy "authenticated_all" on conflicts for all to authenticated using (true) with check (true);
create policy "authenticated_all" on proof_paragraphs for all to authenticated using (true) with check (true);
create policy "authenticated_all" on footnote_definitions for all to authenticated using (true) with check (true);
create policy "authenticated_all" on citations for all to authenticated using (true) with check (true);
