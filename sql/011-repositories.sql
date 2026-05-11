-- Migration 011: Repositories
-- Adds a proper repositories lookup table and wires it into sources.
-- TIMESTAMP: 2026-05-11 09:15 UTC
--
-- Run after sql/010-families.sql
--
-- Design notes:
--   sources already has a `repository` text field (free text, from sql/001).
--   That field is NOT removed. It stays for backward compatibility and for
--   cases where a full repository record isn't needed.
--
--   This migration adds repository_id (uuid FK) as a proper relational link.
--   When a repository record exists, use repository_id.
--   The text field and the FK field can coexist.
--
--   Repository types follow standard archival practice:
--     archive    -- state/national/regional archives, e.g. NARA, TNA
--     library    -- public or academic library with a genealogy collection
--     online     -- digital repository: Ancestry, FamilySearch, Newspapers.com
--     courthouse -- county/municipal courthouse records
--     church     -- congregation, diocese, or synagogue records
--     other      -- everything else


-- ---------------------------------------------------------------
-- repositories
-- ---------------------------------------------------------------
create table if not exists repositories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null
                check (type in (
                  'archive',
                  'library',
                  'online',
                  'courthouse',
                  'church',
                  'other'
                )),

  -- Access
  url           text,

  -- Physical address (nullable -- online repositories have no street address)
  address_line  text,
  city          text,
  state         text,
  country       text,

  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- RLS
alter table repositories enable row level security;
create policy "authenticated_all" on repositories
  for all to authenticated using (true) with check (true);

-- Indexes
create index if not exists idx_repositories_type on repositories(type);
create index if not exists idx_repositories_name on repositories(name);


-- ---------------------------------------------------------------
-- Wire repository_id into sources
-- ---------------------------------------------------------------
-- The existing `repository` text field on sources remains.
-- repository_id is the proper relational link when a repository record exists.
alter table sources add column if not exists repository_id
  uuid references repositories(id) on delete set null;

create index if not exists idx_sources_repository_id on sources(repository_id);
