-- Migration 002: Reasonably Exhaustive Search Checklist
-- Run in Supabase SQL editor AFTER 001-create-tables.sql
-- Adds the res_checklist_items table and expands gps_stage_reached to 6 stages.

-- 1. Expand gps_stage_reached constraint from 1-5 to 1-6
--    Stage 4 is now the RES Checklist (inserted between Evidence Chain and Conflict Analysis)
ALTER TABLE case_studies DROP CONSTRAINT IF EXISTS case_studies_gps_stage_reached_check;
ALTER TABLE case_studies ADD CONSTRAINT case_studies_gps_stage_reached_check
  CHECK (gps_stage_reached BETWEEN 1 AND 6);

-- 2. Create res_checklist_items table
CREATE TABLE IF NOT EXISTS res_checklist_items (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id     uuid        NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  source_category   text        NOT NULL,
  was_searched      boolean     NOT NULL DEFAULT false,
  search_result     text,                    -- what was found (or 'Searched, not found')
  explanation       text,                    -- why it was not searched (if was_searched = false)
  display_order     int         NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE res_checklist_items ENABLE ROW LEVEL SECURITY;

-- RLS policy: single-user app, full access for authenticated user
CREATE POLICY "Allow all for authenticated user"
  ON res_checklist_items
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Index for fast lookup by case study
CREATE INDEX IF NOT EXISTS idx_res_checklist_case_study_order
  ON res_checklist_items (case_study_id, display_order);
