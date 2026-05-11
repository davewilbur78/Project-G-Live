-- Migration 012: Associations
-- The relational FAN Club data model. One row per documented relationship
-- between two people, grounded in a source record.
-- TIMESTAMP: 2026-05-11 09:20 UTC
--
-- Run after sql/011-repositories.sql
--
-- Design notes:
--   This table IS the FAN Club data model. Module 8 (FAN Club Mapper) builds
--   on top of it. Every association is traceable to a source record --
--   we do not record undocumented associations.
--
--   person_id is the subject of the research.
--   associated_person_id is the person they are associated with in the source.
--   The association is directional: the source names A in relation to B.
--   If the relationship is known to be mutual (e.g., neighbors), create two rows.
--
--   association_type values cover the main FAN categories:
--     witness      -- signed as a witness on a document
--     godparent    -- named as godparent in a baptism record
--     employer     -- named as the person's employer
--     employee     -- named as employed by the subject
--     neighbor     -- lived near the subject (census, city directory, address proximity)
--     colleague    -- worked with the subject (union record, business partner, etc.)
--     boarder      -- lived as a boarder in the subject's household
--     landlord     -- subject lived in their property
--     attorney     -- named as legal representative
--     physician    -- named as attending physician (death cert, etc.)
--     other        -- everything else; use description to specify
--
--   source_id is required in practice -- do not record associations without sources.
--   It is nullable at the DB level to allow partial records during data entry.


-- ---------------------------------------------------------------
-- associations
-- ---------------------------------------------------------------
create table if not exists associations (
  id                    uuid primary key default gen_random_uuid(),

  -- The research subject.
  person_id             uuid not null references persons(id) on delete cascade,

  -- The associated person. Also references persons -- both must be in the system.
  associated_person_id  uuid not null references persons(id) on delete cascade,

  -- Type of documented association.
  association_type      text not null
                        check (association_type in (
                          'witness',
                          'godparent',
                          'employer',
                          'employee',
                          'neighbor',
                          'colleague',
                          'boarder',
                          'landlord',
                          'attorney',
                          'physician',
                          'other'
                        )),

  -- Free-text description of the specific relationship or context.
  description           text,

  -- The source record that documents this association. Always provide this.
  source_id             uuid references sources(id) on delete set null,

  -- When the association was documented (from the source record date).
  date_display          text,             -- display string: "June 1920"
  date_sort             date,             -- machine-sortable

  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),

  -- A person cannot be associated with themselves.
  constraint associations_no_self_link check (person_id <> associated_person_id)
);

-- RLS
alter table associations enable row level security;
create policy "authenticated_all" on associations
  for all to authenticated using (true) with check (true);

-- Indexes
create index if not exists idx_associations_person_id on associations(person_id);
create index if not exists idx_associations_associated_person_id on associations(associated_person_id);
create index if not exists idx_associations_type on associations(association_type);
create index if not exists idx_associations_source_id on associations(source_id);
create index if not exists idx_associations_date_sort on associations(date_sort);
