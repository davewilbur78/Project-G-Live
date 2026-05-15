-- Migration 020: Person Research Notes + Research Status
-- TIMESTAMP: 2026-05-14 UTC
-- Adds two things required by the person detail page:
--
--   1. person_research_notes table
--      One living document per person. The researcher's working narrative:
--      hypotheses, negative evidence findings, red-flagged gaps, embedded reasoning.
--      NOT the Research Log (Module 3). The Log tracks sessions and sources consulted.
--      Research Notes is a chronological narrative document that lives with the person.
--      Connie Knox builds these in Word; this is that home in the platform.
--      Rich text stored as markdown. Auto-saved from the UI.
--
--   2. research_status column on persons
--      5 states surfaced in the person detail page header badge.
--      Manually set by the researcher. Drives visual status across the platform.

-- ------------------------------------------------------------
-- 1. person_research_notes
-- ------------------------------------------------------------

CREATE TABLE person_research_notes (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id  uuid        NOT NULL UNIQUE REFERENCES persons(id) ON DELETE CASCADE,
  content    text        NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX person_research_notes_person_id_idx ON person_research_notes (person_id);

ALTER TABLE person_research_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "person_research_notes_all" ON person_research_notes FOR ALL USING (true);

-- ------------------------------------------------------------
-- 2. research_status on persons
-- ------------------------------------------------------------

ALTER TABLE persons
  ADD COLUMN research_status text NOT NULL DEFAULT 'not_started'
  CHECK (research_status IN (
    'not_started',
    'in_progress',
    'complete',
    'needs_archive_visit',
    'has_conflicts'
  ));

CREATE INDEX persons_research_status_idx ON persons (research_status);
