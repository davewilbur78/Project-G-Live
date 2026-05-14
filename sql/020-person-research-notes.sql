-- Migration 020: Person Research Notes + Research Status
-- TIMESTAMP: 2026-05-13 22:15 UTC
-- person_research_notes: one living document per person.
-- NOT the Research Log (Module 3). This is the researcher's thinking space:
-- hypotheses, negative evidence findings, gap analysis, embedded reasoning.
-- Freeform. No GPS enforcement on content.
-- AI scaffold (optional) seeds the document on first open from existing data.
-- research_status: 4 manual states on persons.
-- Conflicts indicator is derived at query time from source_conflicts -- not stored here.

-- 1. Research status on persons
ALTER TABLE persons
  ADD COLUMN IF NOT EXISTS research_status text NOT NULL DEFAULT 'not_started'
    CHECK (research_status IN (
      'not_started',
      'in_progress',
      'complete',
      'needs_archive_visit'
    ));

CREATE INDEX IF NOT EXISTS persons_research_status_idx ON persons (research_status);

-- 2. Person research notes table
CREATE TABLE person_research_notes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id   uuid        NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  content     text        NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- One note document per person
CREATE UNIQUE INDEX person_research_notes_person_id_idx ON person_research_notes (person_id);

ALTER TABLE person_research_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "person_research_notes_all" ON person_research_notes FOR ALL USING (true);
