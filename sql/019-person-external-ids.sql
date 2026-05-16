-- Migration 019: person_external_ids
--
-- Stores cross-provider person identifiers (Ancestry person IDs, FamilySearch
-- person IDs (FSIDs), etc.) keyed by (provider, external_id) so the same
-- physical person can be looked up across data sources.
--
-- Initial writer: scripts/import-ftm.mjs Phase 7, sourced from FTM's
-- Sync_Person table (extracted as syncPersons in ftm-extractor.c).
--
-- See AGENT.md "External IDs -- Future Schema (migration 019)" section for
-- design rationale. Chose join table over a flat persons.ancestry_person_id
-- column to avoid a naming collision with the existing persons.ancestry_id
-- field (which actually stores 'ftm:[FtmId]', not Ancestry person IDs).

CREATE TABLE person_external_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, external_id)
);

CREATE INDEX idx_person_external_ids_person_id ON person_external_ids(person_id);
CREATE INDEX idx_person_external_ids_provider ON person_external_ids(provider);
