-- Research Plan Builder (Module 2)
-- Run in Supabase SQL editor after sql/005-add-todos.sql
-- Creates: research_plans, research_plan_items
-- Alters:  research_sessions (adds research_plan_id FK)

-- ============================================================
-- research_plans
-- ============================================================
create table if not exists research_plans (
  id                uuid primary key default gen_random_uuid(),
  person_id         uuid references persons(id) on delete set null,
  title             text not null,
  research_question text not null,
  time_period       text,
  geography         text,
  community         text,
  status            text not null default 'active'
                    check (status in ('draft','active','complete')),
  strategy_summary  text,          -- AI-generated overview paragraph
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- research_plan_items
-- Prioritized action items within a plan.
-- status='negative' means searched + documented GPS negative evidence.
-- ============================================================
create table if not exists research_plan_items (
  id              uuid primary key default gen_random_uuid(),
  plan_id         uuid not null references research_plans(id) on delete cascade,
  source_category text not null,      -- 'Vital Records', 'Census', 'Immigration Records', etc.
  repository      text,               -- Specific archive or database
  strategy_note   text,               -- What to look for and why
  priority        text not null default 'Medium'
                  check (priority in ('High','Medium','Low')),
  status          text not null default 'pending'
                  check (status in ('pending','in_progress','complete','negative')),
  display_order   int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- Add research_plan_id FK to research_sessions
-- (intentionally deferred from Module 3 -- added now by Module 2)
-- ============================================================
alter table research_sessions
  add column if not exists research_plan_id uuid references research_plans(id) on delete set null;

-- ============================================================
-- RLS
-- ============================================================
alter table research_plans enable row level security;
alter table research_plan_items enable row level security;

create policy "Allow all for authenticated" on research_plans
  for all using (auth.role() = 'authenticated');

create policy "Allow all for authenticated" on research_plan_items
  for all using (auth.role() = 'authenticated');

-- ============================================================
-- updated_at triggers
-- ============================================================
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger research_plans_updated_at
  before update on research_plans
  for each row execute procedure update_updated_at_column();

create trigger research_plan_items_updated_at
  before update on research_plan_items
  for each row execute procedure update_updated_at_column();
