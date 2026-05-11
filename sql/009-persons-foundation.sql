-- Migration 009: Persons Foundation
-- Adds the missing genealogical fields to the persons table.
-- Derived from TNG architecture review and FIX session plan (SESSION-2026-05-11-0830-UTC.md).
-- TIMESTAMP: 2026-05-11 09:00 UTC
--
-- Run after sql/008-add-timeline-addresses.sql
-- Safe to re-run (ALTER TABLE ... ADD COLUMN IF NOT EXISTS).
--
-- What this adds:
--   Name components: lnprefix, suffix, title, prefix, nickname
--   Demographic: sex, living, private
--   Dual-date sort fields: birth_date_sort, death_date_sort
--     (birth_date and death_date remain as text display strings -- do not rename or drop them)
--   Audit: changedby
--
-- What this does NOT touch:
--   id, display_name, given_name, surname, alt_names (correct as-is)
--   birth_date, death_date (text -- these become the _display strings; keep them)
--   birth_place, death_place, notes, ancestry_id, created_at, updated_at (correct as-is)


-- ---------------------------------------------------------------
-- Name components
-- ---------------------------------------------------------------

-- Last name prefix: van, de, von, della, etc.
-- Separate field so display_name can be assembled correctly.
alter table persons add column if not exists lnprefix text;

-- Name suffix: Jr., Sr., III, IV
alter table persons add column if not exists suffix text;

-- Title / honorific: Dr., Rev., Esq., Capt.
alter table persons add column if not exists title text;

-- Name prefix: rarely used in genealogy, but present in GEDCOM NPFX tag.
-- Separate from title. Examples: "Mr.", "Mrs." as part of the recorded name.
alter table persons add column if not exists name_prefix text;

-- Nickname: the name they actually went by, if different from given_name.
alter table persons add column if not exists nickname text;


-- ---------------------------------------------------------------
-- Demographic fields
-- ---------------------------------------------------------------

-- Sex: M (male), F (female), U (unknown).
-- U is the default -- do not assume sex from name.
-- Note: this is the recorded/documented sex, not gender identity.
alter table persons add column if not exists sex text
  check (sex in ('M', 'F', 'U'));

-- Living flag: true if the person is believed to be living.
-- Affects what data is displayed to protect privacy.
alter table persons add column if not exists living boolean not null default false;

-- Private flag: true if this record should be excluded from any export or output.
alter table persons add column if not exists private boolean not null default false;


-- ---------------------------------------------------------------
-- Dual-date sort fields
-- ---------------------------------------------------------------
-- The existing birth_date and death_date columns are TEXT and serve
-- as the display strings. They accommodate approximate dates like
-- "about 1885", "between 1880 and 1890", "before 1900", etc.
--
-- The sort fields are DATE type for range queries and timeline ordering.
-- Populated by the researcher (or AI assist) from the display string.
-- Nullable -- not every record will have a parseable sort date.

alter table persons add column if not exists birth_date_sort date;
alter table persons add column if not exists death_date_sort date;


-- ---------------------------------------------------------------
-- Audit
-- ---------------------------------------------------------------
-- updated_at already tracks WHEN the record was last changed.
-- changedby tracks WHO made the change (for multi-session audit trail).
-- In a single-user app this will usually be 'researcher' or an AI session name.
alter table persons add column if not exists changedby text;


-- ---------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------
create index if not exists idx_persons_sex on persons(sex);
create index if not exists idx_persons_living on persons(living);
create index if not exists idx_persons_birth_date_sort on persons(birth_date_sort);
create index if not exists idx_persons_death_date_sort on persons(death_date_sort);
create index if not exists idx_persons_surname on persons(surname);
