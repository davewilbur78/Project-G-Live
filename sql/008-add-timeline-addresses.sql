-- Migration 008: Timeline Builder (Module 7)
-- addresses (first-class table) + timeline_events
-- Run after sql/007-add-source-conflicts.sql
-- TIMESTAMP: 2026-05-10 22:45 UTC

-- addresses
-- First-class table for all addresses extracted from any record type.
-- addresses appear on census records, draft cards, death certs, marriage
-- licenses, wills, city directories, and more. They are a research surface,
-- not just fields on a person profile.
-- See docs/modules/07-timeline-builder.md for design rationale.

create table if not exists addresses (
  id                uuid primary key default gen_random_uuid(),
  person_id         uuid references persons(id) on delete cascade,
  source_id         uuid references sources(id) on delete set null,

  address_role      text not null default 'residence'
                    check (address_role in (
                      'residence',
                      'employer',
                      'next_of_kin',
                      'witness',
                      'informant',
                      'decedent',
                      'applicant',
                      'beneficiary',
                      'other'
                    )),

  -- Raw text: exactly as written in the source. Never altered.
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

  -- Date of the source record (not necessarily when they lived there)
  address_date      date,
  date_qualifier    text default 'exact'
                    check (date_qualifier in ('exact','about','before','after','calculated')),
  date_display      text,

  notes             text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- RLS for addresses
alter table addresses enable row level security;

create policy "addresses: owner access"
  on addresses for all
  using (true)
  with check (true);

-- timeline_events
-- One row per discrete, sourced, GPS-classified life event.
-- Residence events FK to addresses for full address detail.
-- Non-residence events may also reference addresses when present in source.

create table if not exists timeline_events (
  id                uuid primary key default gen_random_uuid(),
  person_id         uuid references persons(id) on delete cascade,

  event_type        text not null
                    check (event_type in (
                      'birth', 'death', 'marriage', 'divorce',
                      'residence', 'immigration', 'emigration',
                      'naturalization', 'military_service',
                      'occupation', 'land_record', 'census',
                      'baptism', 'burial', 'education', 'other'
                    )),

  -- Date fields
  event_date        date,
  event_date_end    date,
  date_qualifier    text default 'exact'
                    check (date_qualifier in ('exact','about','before','after','between','calculated')),
  date_display      text,

  -- Place summary (all event types)
  place_name        text,
  city              text,
  county            text,
  state_province    text,
  country           text,

  -- Address FK (residence events primarily; available for any event type)
  address_id        uuid references addresses(id) on delete set null,

  -- Residence duration (residence events)
  residence_date_from       date,
  residence_date_to         date,
  residence_from_qualifier  text,
  residence_to_qualifier    text,
  residence_current         boolean default false,

  -- GPS / source
  source_id         uuid references sources(id) on delete set null,
  evidence_type     text
                    check (evidence_type in ('Direct','Indirect','Negative')),

  description       text,
  notes             text,

  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- RLS for timeline_events
alter table timeline_events enable row level security;

create policy "timeline_events: owner access"
  on timeline_events for all
  using (true)
  with check (true);

-- Indexes for common query patterns
create index if not exists idx_addresses_person_id on addresses(person_id);
create index if not exists idx_addresses_source_id on addresses(source_id);
create index if not exists idx_addresses_address_date on addresses(address_date);
create index if not exists idx_addresses_lat_lng on addresses(lat, lng);

create index if not exists idx_timeline_events_person_id on timeline_events(person_id);
create index if not exists idx_timeline_events_event_date on timeline_events(event_date);
create index if not exists idx_timeline_events_event_type on timeline_events(event_type);
create index if not exists idx_timeline_events_address_id on timeline_events(address_id);
