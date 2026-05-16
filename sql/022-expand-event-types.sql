-- Migration 022: Expand timeline_events event_type check constraint
-- Adds all new event types produced by the fact-type normalizer (Category A + B).
-- Run after sql/021-ftm-notes.sql
-- TIMESTAMP: 2026-05-16 UTC

-- The original constraint from migration 008 allowed 16 types.
-- The fact-type normalizer (import-ftm.mjs, commit 6c522882) adds:
--   Category A tags:  arrival, departure, christening, address, probate, divorce_filed
--   Category B regex: obituary, marriage_announcement, marriage_license,
--                     birth_announcement, wedding_announcement, newspaper_mention
--   Naturalization sub-events (kept granular per AGENT.md):
--                     naturalization_petition, naturalization_declaration,
--                     naturalization_oath, naturalization_certificate,
--                     naturalization_deposition

alter table timeline_events
  drop constraint if exists timeline_events_event_type_check;

alter table timeline_events
  add constraint timeline_events_event_type_check
  check (event_type in (
    -- original 16
    'birth', 'death', 'marriage', 'divorce',
    'residence', 'immigration', 'emigration',
    'naturalization', 'military_service',
    'occupation', 'land_record', 'census',
    'baptism', 'burial', 'education', 'other',
    -- Category A additions
    'arrival', 'departure', 'christening',
    'address', 'probate', 'divorce_filed',
    -- Category B: newspaper / media
    'obituary', 'marriage_announcement', 'marriage_license',
    'birth_announcement', 'wedding_announcement', 'newspaper_mention',
    -- Category B: naturalization sub-events
    'naturalization_petition', 'naturalization_declaration',
    'naturalization_oath', 'naturalization_certificate',
    'naturalization_deposition'
  ));
