-- Migration 015: assertions, assertion_case_study_links, assertion_conflict_links
-- TIMESTAMP: 2026-05-11
-- Design spec: docs/architecture/assertions-table.md
-- Run via Supabase SQL Editor using Monaco setValue() method -- DO NOT TYPE MANUALLY
-- SQL Editor URL: https://supabase.com/dashboard/project/slqjooudyfvmnaoetdvi/sql/new
--
-- The assertions table is the connective tissue between sources and conclusions.
-- Every GPS-classified, source-located atomic fact extracted from any document
-- produces at least one assertion record.
-- Forward-only policy: existing data is NOT retrofitted.

-- ============================================================
-- CORE TABLE: assertions
-- ============================================================

create table assertions (
  id                   uuid primary key default gen_random_uuid(),
  person_id            uuid references persons(id) on delete set null,
  source_id            uuid references sources(id) on delete set null,

  -- What kind of claim this is (controlled vocabulary)
  predicate            text not null check (predicate in (
                         'born_in',
                         'died_in',
                         'resided_at',
                         'married',
                         'occupation',
                         'relationship',
                         'age_stated',
                         'name_stated',
                         'witnessed_by',
                         'religion',
                         'nationality',
                         'immigration',
                         'naturalization',
                         'military_service',
                         'property_owned',
                         'other'
                       )),

  -- The claim itself
  value_as_stated      text not null,   -- verbatim from source
  value_normalized     text,            -- standardized / cleaned form

  -- Where exactly in the source this claim appears
  -- Format: "page N, line N" / "certificate no. N" / "entry N" etc.
  -- Follows Evidence Explained where-within precision standard
  where_within         text,

  -- GPS Three-Layer classification
  information_type     text not null check (information_type in (
                         'Primary', 'Secondary', 'Indeterminate'
                       )),
  evidence_type        text not null check (evidence_type in (
                         'Direct', 'Indirect', 'Negative'
                       )),
  -- evidence_type here is the DEFAULT classification for this assertion.
  -- It can be overridden per case study via assertion_case_study_links.
  -- Evidence type is always relative to a specific research question.

  -- Confidence
  confidence_score     numeric(3,2) check (confidence_score between 0.00 and 1.00),
  confidence_rationale text,

  -- Extraction provenance
  -- Which method produced this assertion; which engine version if AI-extracted
  extraction_method    text check (extraction_method in (
                         'manual',
                         'ocr_htr',
                         'jewish_transcription',
                         'image_analysis',
                         'headstone_analysis',
                         'fact_extractor',
                         'conversation_abstractor',
                         'other_ai'
                       )),
  engine_version       text,
  -- Examples: 'gra-v8.5.2c', 'ocr-htr-v08', 'hebrew-headstone-v9'
  -- Manually entered assertions: extraction_method = 'manual', engine_version = null

  notes                text,
  created_at           timestamptz not null default now(),
  created_by           text
);

-- ============================================================
-- ASSERTION_CASE_STUDY_LINKS
-- Links assertions to case studies.
-- Allows evidence_type to be overridden for the specific research
-- question addressed in a given case study.
-- ============================================================

create table assertion_case_study_links (
  id                     uuid primary key default gen_random_uuid(),
  assertion_id           uuid not null references assertions(id) on delete cascade,
  case_study_id          uuid not null references case_studies(id) on delete cascade,

  evidence_type_override text check (evidence_type_override in (
                            'Direct', 'Indirect', 'Negative'
                          )),
  -- When null, the assertion's default evidence_type applies.
  -- When set, this override is used for this case study only.

  stage                  integer,
  -- Which GPS stage in the case study this assertion appears in (1-6)

  unique (assertion_id, case_study_id)
);

-- ============================================================
-- ASSERTION_CONFLICT_LINKS
-- Links assertion pairs to source conflicts at assertion-level precision.
-- Supplements (does not replace) the source_conflicts table.
-- ============================================================

create table assertion_conflict_links (
  id             uuid primary key default gen_random_uuid(),
  conflict_id    uuid not null references source_conflicts(id) on delete cascade,
  assertion_id_a uuid not null references assertions(id) on delete cascade,
  assertion_id_b uuid not null references assertions(id) on delete cascade,
  notes          text,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_assertions_person_id         on assertions(person_id);
create index idx_assertions_source_id         on assertions(source_id);
create index idx_assertions_predicate         on assertions(predicate);
create index idx_assertions_information_type  on assertions(information_type);
create index idx_assertions_evidence_type     on assertions(evidence_type);
create index idx_assertions_extraction_method on assertions(extraction_method);

-- Address-as-Search-Key engine support
-- Cross-person address proximity query: predicate IN (resided_at, born_in, died_in)
create index idx_assertions_value_normalized on assertions(value_normalized)
  where predicate in ('born_in', 'died_in', 'resided_at');

-- ============================================================
-- ROW LEVEL SECURITY
-- Single-user platform: allow all operations.
-- ============================================================

alter table assertions enable row level security;
alter table assertion_case_study_links enable row level security;
alter table assertion_conflict_links enable row level security;

create policy "Allow all on assertions"
  on assertions for all using (true) with check (true);

create policy "Allow all on assertion_case_study_links"
  on assertion_case_study_links for all using (true) with check (true);

create policy "Allow all on assertion_conflict_links"
  on assertion_conflict_links for all using (true) with check (true);
