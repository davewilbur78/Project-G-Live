-- Migration 013: Event Types Formalization
-- Converts the hardcoded event_type check constraint on timeline_events into
-- a first-class lookup table. The existing text check constraint stays
-- for backward compatibility. event_type_id is the forward-looking FK.
-- TIMESTAMP: 2026-05-11 09:25 UTC
--
-- Run after sql/012-associations.sql
--
-- Design notes:
--   timeline_events currently has:
--     event_type text not null check (event_type in ('birth','death','marriage',...,'other'))
--   That constraint is NOT removed in this migration. It stays so that existing
--   rows and in-flight code continue to work without changes.
--
--   event_type_id (uuid FK) is added as a new column. When code is updated to
--   use the lookup table, it sets this field. The text field can be deprecated
--   in a future migration once all code has been updated.
--
--   Tags use GEDCOM standard codes where they exist (BIRT, DEAT, MARR, etc.).
--   For event types with no standard GEDCOM tag, we use a clear abbreviation.
--
--   scope: 'individual' = event on a person record
--          'family'     = event on a family record (marriage, divorce)
--
--   is_built_in: true for standard GEDCOM/GPS types that ship with the platform.
--   Custom types added by the researcher have is_built_in = false.
--
--   The tag values in this seed data map 1:1 to the text values allowed
--   in the existing event_type check constraint on timeline_events:
--     BIRT = birth, DEAT = death, MARR = marriage, DIV = divorce,
--     RESI = residence, IMMI = immigration, EMIG = emigration,
--     NATU = naturalization, MILI = military_service,
--     OCCU = occupation, LAND = land_record, CENS = census,
--     BAPM = baptism, BURI = burial, EDUC = education, EVEN = other


-- ---------------------------------------------------------------
-- event_types
-- ---------------------------------------------------------------
create table if not exists event_types (
  id            uuid primary key default gen_random_uuid(),

  -- GEDCOM-style tag. Uppercase. Unique. The stable identifier.
  tag           text not null unique,

  -- Display name shown in the UI.
  display_name  text not null,

  -- Whether this event type applies to an individual or a family unit.
  scope         text not null
                check (scope in ('individual', 'family')),

  -- Marks the standard built-in types vs researcher-added custom types.
  is_built_in   boolean not null default true,

  -- Controls the order events appear in type pickers.
  sort_order    int not null default 0,

  created_at    timestamptz default now()
);

-- RLS
alter table event_types enable row level security;
create policy "authenticated_all" on event_types
  for all to authenticated using (true) with check (true);

-- Index
create index if not exists idx_event_types_scope on event_types(scope);
create index if not exists idx_event_types_sort_order on event_types(sort_order);


-- ---------------------------------------------------------------
-- Seed: standard event types
-- ---------------------------------------------------------------
insert into event_types (tag, display_name, scope, is_built_in, sort_order) values
  ('BIRT', 'Birth',             'individual', true,  1),
  ('DEAT', 'Death',             'individual', true,  2),
  ('BAPM', 'Baptism',           'individual', true,  3),
  ('BURI', 'Burial',            'individual', true,  4),
  ('MARR', 'Marriage',          'family',     true,  5),
  ('MARB', 'Marriage Banns',    'family',     true,  6),
  ('MARL', 'Marriage License',  'family',     true,  7),
  ('DIV',  'Divorce',           'family',     true,  8),
  ('RESI', 'Residence',         'individual', true, 10),
  ('IMMI', 'Immigration',       'individual', true, 11),
  ('EMIG', 'Emigration',        'individual', true, 12),
  ('NATU', 'Naturalization',    'individual', true, 13),
  ('MILI', 'Military Service',  'individual', true, 14),
  ('OCCU', 'Occupation',        'individual', true, 15),
  ('CENS', 'Census',            'individual', true, 16),
  ('LAND', 'Land Record',       'individual', true, 17),
  ('EDUC', 'Education',         'individual', true, 18),
  ('EVEN', 'Other Event',       'individual', true, 99)
on conflict (tag) do nothing;


-- ---------------------------------------------------------------
-- Wire event_type_id into timeline_events
-- ---------------------------------------------------------------
-- The existing event_type text check constraint is NOT removed.
-- event_type_id is the forward-looking FK for new code.
-- Both columns coexist until a future cleanup migration.
alter table timeline_events
  add column if not exists event_type_id uuid references event_types(id) on delete set null;

create index if not exists idx_timeline_events_event_type_id on timeline_events(event_type_id);
