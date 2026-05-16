-- Migration 021: ftm_notes
-- Stores discrete research notes imported from Family Tree Maker.
--
-- Design decisions (locked in AGENT.md 2026-05-16 UTC):
--   - One row per note. Not merged into person_research_notes.
--   - RTF stripped to plain text at import time. URLs and Unicode preserved.
--   - source_id is nullable; reserved for future source-linking pass.
--   - Idempotency: UNIQUE(person_id, ftm_note_id) supports upsert on re-import.
--   - ON DELETE CASCADE on persons: notes are deleted when person is removed.
--   - "Send to Source Conflict Resolver" action on Research Notes panel: future.
--
-- Run this in the Supabase SQL editor.

create table if not exists ftm_notes (
  id            uuid        primary key default gen_random_uuid(),
  person_id     uuid        not null references persons(id) on delete cascade,
  source_id     uuid        references sources(id) on delete set null,
  ftm_note_id   integer     not null,
  content       text        not null,
  imported_at   timestamptz not null default now(),

  unique(person_id, ftm_note_id)
);

create index if not exists idx_ftm_notes_person_id
  on ftm_notes(person_id);

create index if not exists idx_ftm_notes_source_id
  on ftm_notes(source_id)
  where source_id is not null;

comment on table ftm_notes is
  'Discrete research notes imported from Family Tree Maker. '
  'One row per FTM Note record. RTF stripped at import time. '
  'Not merged into person_research_notes.';
