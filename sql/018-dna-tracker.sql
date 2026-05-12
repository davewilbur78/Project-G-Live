-- Migration 018: DNA Evidence Tracker (Module 14)
-- TIMESTAMP: 2026-05-11 14:10 UTC
-- Tracks DNA match data integrated with documentary evidence.
-- Designed with Ashkenazi Jewish endogamy in mind.
-- DNA evidence is always corroborating indirect evidence under GPS -- never standalone proof.

CREATE TABLE dna_matches (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  match_name                text        NOT NULL,
  platform                  text        NOT NULL
    CHECK (platform IN (
      '23andme', 'ancestry', 'ftdna', 'myheritage', 'gedmatch', 'other'
    )),
  shared_cm                 numeric(8,2),
  shared_segments           integer,
  largest_segment_cm        numeric(8,2),
  kit_number                text,
  match_email               text,
  person_id                 uuid        REFERENCES persons(id) ON DELETE SET NULL,
  status                    text        NOT NULL DEFAULT 'unresolved'
    CHECK (status IN ('identified', 'working_hypothesis', 'unresolved')),
  hypothesized_relationship text,
  ancestral_line            text,
  documentary_evidence      text,
  endogamy_context          text,
  in_common_with            text,
  notes                     text,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX dna_matches_status_idx         ON dna_matches (status);
CREATE INDEX dna_matches_platform_idx       ON dna_matches (platform);
CREATE INDEX dna_matches_ancestral_line_idx ON dna_matches (ancestral_line);
CREATE INDEX dna_matches_person_id_idx      ON dna_matches (person_id);
CREATE INDEX dna_matches_shared_cm_idx      ON dna_matches (shared_cm DESC);

ALTER TABLE dna_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dna_matches_all" ON dna_matches FOR ALL USING (true);
