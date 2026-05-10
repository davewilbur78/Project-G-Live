-- Module 6: Source Conflict Resolver
-- TIMESTAMP: 2026-05-10 20:30 UTC
-- Run in Supabase SQL Editor after 006-add-research-plans.sql

create table if not exists source_conflicts (
  id               uuid primary key default gen_random_uuid(),
  person_id        uuid references persons(id) on delete set null,
  title            text not null,
  fact_in_dispute  text not null
                   check (fact_in_dispute in (
                     'birth_date','birth_place','name','age',
                     'death_date','death_place','residence',
                     'immigration','marriage','occupation','other'
                   )),
  description      text not null,
  source_a_id      uuid references sources(id) on delete set null,
  source_a_value   text,
  source_b_id      uuid references sources(id) on delete set null,
  source_b_value   text,
  analysis_text    text,
  resolution       text,
  resolution_basis text
                   check (resolution_basis is null or resolution_basis in (
                     'source_quality','preponderance','corroboration','inconclusive'
                   )),
  status           text not null default 'open'
                   check (status in ('open','in_progress','resolved')),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table source_conflicts enable row level security;

create policy "Allow all for authenticated users"
  on source_conflicts for all
  using (auth.role() = 'authenticated');

create index source_conflicts_status_idx on source_conflicts(status);
create index source_conflicts_person_idx  on source_conflicts(person_id);
