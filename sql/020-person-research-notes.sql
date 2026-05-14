-- Migration 020: person_research_notes + research_status on persons
-- TIMESTAMP: 2026-05-14 UTC
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/slqjooudyfvmnaoetdvi/sql/new

-- 1. Add research_status to persons table
ALTER TABLE persons
  ADD COLUMN IF NOT EXISTS research_status text
    NOT NULL DEFAULT 'not_started'
    CHECK (research_status IN (
      'not_started',
      'in_progress',
      'complete',
      'needs_archive_visit',
      'has_conflicts'
    ));

-- 2. Create person_research_notes table
-- One row per person. Living document, not versioned in v1.
CREATE TABLE IF NOT EXISTS person_research_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id   uuid NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  content     text NOT NULL DEFAULT '',
  updated_at  timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT person_research_notes_person_id_unique UNIQUE (person_id)
);

-- 3. RLS: same pattern as other tables in this project
ALTER TABLE person_research_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
  ON person_research_notes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Index for fast person lookup
CREATE INDEX IF NOT EXISTS idx_person_research_notes_person_id
  ON person_research_notes (person_id);
