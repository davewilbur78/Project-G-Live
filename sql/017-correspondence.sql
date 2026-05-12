-- Migration 017: Correspondence Log (Module 12)
-- TIMESTAMP: 2026-05-12 UTC
-- Tracks all outgoing research inquiries and responses.
-- GPS element 1: documents reasonably exhaustive search outreach.

CREATE TABLE correspondence (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  date_sent         date        NOT NULL,
  recipient_name    text        NOT NULL,
  recipient_type    text        NOT NULL
    CHECK (recipient_type IN (
      'repository', 'courthouse', 'archive',
      'researcher', 'dna_match', 'other'
    )),
  repository_id     uuid        REFERENCES repositories(id) ON DELETE SET NULL,
  person_id         uuid        REFERENCES persons(id) ON DELETE SET NULL,
  subject           text        NOT NULL,
  question_asked    text        NOT NULL,
  date_responded    date,
  outcome           text,
  outcome_status    text        NOT NULL DEFAULT 'pending'
    CHECK (outcome_status IN (
      'pending', 'responded', 'no_response', 'closed'
    )),
  follow_up_needed  boolean     NOT NULL DEFAULT false,
  source_id         uuid        REFERENCES sources(id) ON DELETE SET NULL,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX correspondence_date_sent_idx      ON correspondence (date_sent DESC);
CREATE INDEX correspondence_outcome_status_idx ON correspondence (outcome_status);
CREATE INDEX correspondence_recipient_type_idx ON correspondence (recipient_type);

ALTER TABLE correspondence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "correspondence_all" ON correspondence FOR ALL USING (true);
