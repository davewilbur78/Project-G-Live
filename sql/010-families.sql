-- Migration 010: Families and Family Members Bridge
-- Adds the families table and the family_members bridge table.
-- TIMESTAMP: 2026-05-11 09:10 UTC
--
-- Run after sql/009-persons-foundation.sql
--
-- Design notes:
--   partner1_id / partner2_id -- NOT husband_id / wife_id.
--   We do not replicate GEDCOM's binary sex assumption in our naming.
--   The role (child / partner) in family_members is what defines the
--   relationship, not the column name on the families record.
--
--   family_members is the bridge between a family unit and its members.
--   TNG calls this tng_children. We name it for what it actually is.
--
--   A person can appear as a partner in multiple families (remarriage).
--   A person can appear as a child in only one birth family (by convention),
--   but can appear as a child in step/adoptive families too -- the
--   relationship_to_partner1/2 fields carry that distinction.


-- ---------------------------------------------------------------
-- families
-- ---------------------------------------------------------------
create table if not exists families (
  id                    uuid primary key default gen_random_uuid(),

  -- Partners in the family unit. Either can be null if only one is known.
  partner1_id           uuid references persons(id) on delete set null,
  partner2_id           uuid references persons(id) on delete set null,

  -- Marriage / union event
  marriage_date_display text,             -- display string: "about 1912", "3 June 1914"
  marriage_date_sort    date,             -- machine-sortable date (nullable)
  marriage_place        text,
  marriage_type         text
                        check (marriage_type in (
                          'MARR',         -- Marriage (formal)
                          'MARB',         -- Marriage Banns
                          'MARL',         -- Marriage License
                          'MARS',         -- Marriage Settlement
                          'COHA',         -- Cohabitation / common law
                          'other'
                        )),

  -- Dissolution event
  div_date_display      text,
  div_date_sort         date,
  div_place             text,

  -- Privacy
  living                boolean not null default false,
  private               boolean not null default false,

  notes                 text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Prevent a family from listing the same person as both partners.
alter table families add constraint families_different_partners
  check (partner1_id is null or partner2_id is null or partner1_id <> partner2_id);

-- RLS
alter table families enable row level security;
create policy "authenticated_all" on families
  for all to authenticated using (true) with check (true);

-- Indexes
create index if not exists idx_families_partner1_id on families(partner1_id);
create index if not exists idx_families_partner2_id on families(partner2_id);
create index if not exists idx_families_marriage_date_sort on families(marriage_date_sort);


-- ---------------------------------------------------------------
-- family_members
-- Bridge table: a person's membership in a family unit.
-- Role 'partner' = one of the two named partners in the family record.
-- Role 'child'   = a child in the family unit.
-- ---------------------------------------------------------------
create table if not exists family_members (
  id                        uuid primary key default gen_random_uuid(),
  person_id                 uuid not null references persons(id) on delete cascade,
  family_id                 uuid not null references families(id) on delete cascade,

  -- Role in this family unit.
  role                      text not null
                            check (role in ('child', 'partner')),

  -- How this child is related to each partner.
  -- Only meaningful when role = 'child'. Null for partners.
  relationship_to_partner1  text
                            check (relationship_to_partner1 in (
                              'natural', 'adopted', 'step', 'foster', 'unknown'
                            )),
  relationship_to_partner2  text
                            check (relationship_to_partner2 in (
                              'natural', 'adopted', 'step', 'foster', 'unknown'
                            )),

  -- Birth order among children in this family. Nullable.
  birth_order               int,

  -- Denormalized display flag. True if this person has any descendants
  -- recorded in the system. Used for tree display.
  has_descendants           boolean not null default false,

  created_at                timestamptz default now(),
  updated_at                timestamptz default now(),

  -- A person can only appear once per family per role.
  unique (person_id, family_id)
);

-- RLS
alter table family_members enable row level security;
create policy "authenticated_all" on family_members
  for all to authenticated using (true) with check (true);

-- Indexes
create index if not exists idx_family_members_person_id on family_members(person_id);
create index if not exists idx_family_members_family_id on family_members(family_id);
create index if not exists idx_family_members_role on family_members(role);
