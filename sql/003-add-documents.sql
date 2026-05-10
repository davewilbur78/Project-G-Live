-- Migration 003: Document Analysis Worksheet (Module 5)
-- Run in Supabase SQL editor AFTER 001-create-tables.sql and 002-add-res-checklist.sql

-- documents
-- One record per analyzed document.
-- source_id is required -- every document being analyzed must have
-- a Citation Builder record first. The source provides the GPS
-- classification context for the document itself.
create table documents (
  id                    uuid primary key default gen_random_uuid(),
  source_id             uuid references sources(id) on delete set null,
  label                 text not null,          -- short display name
  transcription         text,                   -- full text of the document
  transcription_status  text not null default 'pending'
                        check (transcription_status in ('pending','complete','error')),
  notes                 text,                   -- researcher notes (not part of analysis)
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- document_facts
-- Discrete factual claims extracted from a document.
-- Each claim receives full Three-Layer GPS classification:
--   source_type  -- GPS classification of the document (inherited from documents.source_id)
--   info_type    -- was the informant a firsthand witness to this specific claim?
--   evidence_type -- does this claim directly, indirectly, or negatively answer
--                    the research question?
-- info_type and evidence_type may differ claim-by-claim within a single document.
create table document_facts (
  id              uuid primary key default gen_random_uuid(),
  document_id     uuid not null references documents(id) on delete cascade,
  claim_text      text not null,
  source_type     text not null
                  check (source_type in ('Original','Derivative','Authored')),
  info_type       text not null
                  check (info_type in ('Primary','Secondary','Undetermined','N/A')),
  evidence_type   text not null
                  check (evidence_type in ('Direct','Indirect','Negative')),
  display_order   int not null default 0,
  ai_generated    boolean not null default false,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index documents_source_id_idx on documents(source_id);
create index document_facts_document_id_idx on document_facts(document_id);
create index document_facts_order_idx on document_facts(document_id, display_order);

-- RLS: single user, full access
alter table documents enable row level security;
alter table document_facts enable row level security;

create policy "Single user full access" on documents
  for all using (true) with check (true);

create policy "Single user full access" on document_facts
  for all using (true) with check (true);
