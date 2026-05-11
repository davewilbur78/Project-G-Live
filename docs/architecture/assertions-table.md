# Assertions Table -- Architecture Specification

TIMESTAMP: 2026-05-11 19:15 UTC
Decision made in EXPLORE session (posture transitioned to BUILD)
Captured by: Claude (claude-sonnet-4-6)

---

## What This Is

The assertions table is the missing connective tissue in the Project-G-Live data model.
Currently the schema moves: Source -> Evidence Chain -> Case Study -> Conclusion.
That is a workflow model. The assertions table introduces an intermediate layer:
Source -> **Assertion** -> Evidence Chain -> Conclusion.

An assertion is a single, atomic, GPS-classified, source-located claim. Every
genealogically relevant fact extracted from any document produces at least one
assertion. The assertions table is queryable across all persons, all modules,
all record types -- making it the foundation of the research engine.

---

## Design Principles

**Derived from Steve Little's PRD (genealogy-record-analysis-prd.md, January 2026)**
but adapted for Project-G-Live's architecture and data model.

**Key differences from Steve's PRD schema:**
- Adapted to Supabase/PostgreSQL conventions
- Forward-only: new documents create assertions; existing data is not retrofitted
- Evidence type stored as default on assertion; overridable per case study
  via assertion_case_study_links join table
- Provenance of extraction method tracked (human vs. AI, which engine, which version)
- Integrated with existing persons, sources, source_conflicts tables

---

## Core Table: assertions

```sql
create table assertions (
  id                  uuid primary key default gen_random_uuid(),
  person_id           uuid references persons(id) on delete set null,
  source_id           uuid references sources(id) on delete set null,

  -- What kind of claim this is
  predicate           text not null,
  -- Controlled vocabulary (enforced by check constraint):
  -- born_in, died_in, resided_at, married, occupation,
  -- relationship, age_stated, name_stated, witnessed_by,
  -- religion, nationality, immigration, naturalization,
  -- military_service, property_owned, other

  -- The claim itself
  value_as_stated     text not null,   -- verbatim from source
  value_normalized    text,            -- standardized/cleaned form

  -- Where exactly in the source this appears
  where_within        text,
  -- Format: "page N, line N" / "certificate no. N" / "entry N" etc.
  -- Follows Evidence Explained 'where-within' precision standard

  -- GPS Three-Layer classification
  information_type    text not null check (information_type in
                        ('Primary', 'Secondary', 'Indeterminate')),
  evidence_type       text not null check (evidence_type in
                        ('Direct', 'Indirect', 'Negative')),
  -- Note: evidence_type here is the DEFAULT classification.
  -- It can be overridden per case study via assertion_case_study_links.
  -- Evidence type is always relative to a research question;
  -- the default is the most common classification for this assertion.

  -- Confidence
  confidence_score    numeric(3,2) check (confidence_score between 0.00 and 1.00),
  confidence_rationale text,

  -- Provenance of the extraction
  extraction_method   text check (extraction_method in
                        ('manual',
                         'ocr_htr',
                         'jewish_transcription',
                         'image_analysis',
                         'headstone_analysis',
                         'fact_extractor',
                         'conversation_abstractor',
                         'other_ai')),
  engine_version      text,
  -- Which prompt version produced this if AI-extracted.
  -- E.g., 'gra-v8.5.2c', 'ocr-htr-v08', 'hebrew-headstone-v9'
  -- Manually entered assertions set extraction_method = 'manual',
  -- engine_version = null.

  notes               text,
  created_at          timestamptz not null default now(),
  created_by          text
);
```

---

## Supporting Table: assertion_case_study_links

Links assertions to case studies and allows evidence type to be overridden
for the specific research question in that case study.

```sql
create table assertion_case_study_links (
  id                    uuid primary key default gen_random_uuid(),
  assertion_id          uuid not null references assertions(id) on delete cascade,
  case_study_id         uuid not null references case_studies(id) on delete cascade,

  evidence_type_override text check (evidence_type_override in
                            ('Direct', 'Indirect', 'Negative')),
  -- When null, the assertion's default evidence_type applies.
  -- When set, this override is used for this case study only.

  stage                 integer,
  -- Which GPS stage in the case study this assertion appears in (1-6)

  unique (assertion_id, case_study_id)
);
```

---

## Supporting Table: assertion_conflict_links

Links assertions to source conflicts at assertion-level precision.
Supplements (does not replace) the existing source_conflicts table.

```sql
create table assertion_conflict_links (
  id                uuid primary key default gen_random_uuid(),
  conflict_id       uuid not null references source_conflicts(id) on delete cascade,
  assertion_id_a    uuid not null references assertions(id) on delete cascade,
  assertion_id_b    uuid not null references assertions(id) on delete cascade,
  notes             text,
  created_at        timestamptz not null default now()
);
```

---

## Indexes

```sql
-- Most common query patterns
create index idx_assertions_person_id on assertions(person_id);
create index idx_assertions_source_id on assertions(source_id);
create index idx_assertions_predicate on assertions(predicate);
create index idx_assertions_information_type on assertions(information_type);
create index idx_assertions_evidence_type on assertions(evidence_type);
create index idx_assertions_extraction_method on assertions(extraction_method);

-- Cross-person address proximity query support
-- (Address-as-Search-Key research engine)
create index idx_assertions_value_normalized on assertions(value_normalized)
  where predicate in ('born_in', 'died_in', 'resided_at');
```

---

## Predicate Controlled Vocabulary

The `predicate` field uses this controlled vocabulary (enforced via check constraint).
This list is not exhaustive -- 'other' is available and the vocabulary will expand
as real usage reveals missing predicates.

| Predicate | Meaning |
|-----------|--------|
| born_in | Birth location claim |
| died_in | Death location claim |
| resided_at | Residence address claim |
| married | Marriage event claim |
| occupation | Occupation claim |
| relationship | Relationship to another person |
| age_stated | Age as stated in source |
| name_stated | Name as stated in source (variant spellings, etc.) |
| witnessed_by | Witnessed this event |
| religion | Religious affiliation |
| nationality | National origin or citizenship |
| immigration | Immigration event |
| naturalization | Naturalization event |
| military_service | Military service claim |
| property_owned | Property ownership claim |
| other | Any claim not covered above |

---

## Integration Notes

### Forward-Only Policy
Existing data (timeline_events, case_study_sources, document_facts) is NOT
retrofitted into the assertions table. This migration is forward-only.
As modules are built or upgraded, they begin producing assertions naturally.
The database fills in from real use over time.

### Module 5 Integration
The Document Analysis Worksheet is the primary producer of assertions.
When a document is analyzed using any engine (OCR-HTR, Jewish Transcription,
Fact Extractor, etc.), the extracted LABEL: Value pairs from Fact Extractor
become the raw material for assertion rows. The researcher reviews and
confirms each assertion before it is committed to the table.

### Module 16 Integration
The Research Investigation workspace is the primary consumer of assertions.
Module 16 queries the assertions table across persons and sources to surface
cross-document patterns, FAN cluster evidence, and Address-as-Search-Key
results. The assertions table makes Module 16's investigation engine possible.

### Address-as-Search-Key
The cross-person address proximity query (who else in this database lived
near this address in this time range?) operates on assertions where
predicate IN ('resided_at', 'born_in', 'died_in') and value_normalized
matches geographically. The geocoding layer (future) will populate lat/lng
fields that make this query spatial.

### GPS Compliance
Every assertion carries its GPS classification (information_type,
evidence_type) and its source pointer (source_id, where_within). This
means every factual claim in the system is traceable to the exact location
in the exact source that produced it. This is the implementation of
Steve Little's PRD design principle: "Atomization with Provenance."

---

## What This Enables

1. **Cross-module fact queries** -- Find all claims about a person across every
   source and every module, in one query.

2. **Evidence quality assessment** -- Count Primary vs. Secondary vs. Indeterminate
   information for any conclusion before writing it.

3. **Conflict detection** -- Find assertions where two sources make conflicting
   claims about the same predicate for the same person.

4. **Address-as-Search-Key engine** -- Query assertions by value_normalized
   across all persons to find who else appears at a known address.

5. **AI provenance tracking** -- Know which assertions were produced by which
   engine version and which were manually entered by the researcher.

6. **GPS-compliant proof arguments** -- The Case Study Builder can pull all
   assertions for a person, show their classifications, and build the
   evidence matrix before writing the proof argument.

---

## Build Order

This table is migration 015. It must exist before:
- Module 16 is built (assertions are its primary query surface)
- Module 5 is upgraded to the full input pipeline
- The engine registry is wired to produce assertion output

SQL file: sql/015-assertions.sql

---

## Open Questions (as of 2026-05-11)

1. Predicate list will expand as real documents are analyzed. Plan to revisit
   after first 20-30 assertions are manually created.

2. The value_normalized field for addresses should eventually accept lat/lng
   coordinates. This is deferred until the geocoding layer is built.

3. A future assertions_persons_links join table may be needed for assertions
   that involve multiple persons (e.g., a marriage assertion links two persons).
   Forward-only policy applies here too -- this is not needed for migration 015.
