-- Migration 005: Research To-Do Tracker (Module 15)
-- TIMESTAMP: 2026-05-09 16:02 UTC
-- Creates the todos table.
-- Run AFTER 001, 002, 003, 004.

create table if not exists todos (
  id               uuid primary key default gen_random_uuid(),
  person_id        uuid references persons(id) on delete set null,
  title            text not null,              -- the to-do item
  notes            text,                        -- additional context
  priority         text not null default 'medium'
                   check (priority in ('high','medium','low')),
  source_type_hint text,                        -- what kind of source needs searching
  origin_module    text,                        -- which module generated this item, or 'manual'
  origin_id        uuid,                        -- polymorphic FK to originating record
  status           text not null default 'open'
                   check (status in ('open','in_progress','complete','dropped')),
  due_date         date,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table todos enable row level security;

create policy "todos_select" on todos for select using (auth.role() = 'authenticated');
create policy "todos_insert" on todos for insert with check (auth.role() = 'authenticated');
create policy "todos_update" on todos for update using (auth.role() = 'authenticated');
create policy "todos_delete" on todos for delete using (auth.role() = 'authenticated');
