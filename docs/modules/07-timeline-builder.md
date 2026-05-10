# Module 7 -- Timeline Builder

Status: IN DESIGN
Design doc committed: 2026-05-10 22:45 UTC
Designed by: Claude (claude.ai), EXPLORE session

---

## What This Is

The Timeline Builder is a chronological workspace for a selected person's
life events, extracted from documents and sources already in the system.
It is not a visualization layer on top of data that already exists elsewhere.
It is a first-class research surface where GPS analysis happens.

The GRA v8.5 framework (Steve Little) explicitly names "build timelines to
verify event sequences" as a GPS tool. Every event in the timeline is a
discrete, testable assertion extracted from a specific source -- the same
evidentiary unit that underpins the Three-Layer Model. The timeline IS the
working surface where event-sequence analysis lives.

---

## Address-as-Evidence: The Spine-Level Principle

This module was designed around a named platform principle:

**Address-as-Evidence** -- the disciplined practice of extracting every
address from every record and treating it as a first-class piece of evidence,
not a descriptive label attached to a person's profile.

Ancestry.com's failure in this area was a category error: it treated addresses
as metadata about a person (where they lived) rather than as evidence artifacts
from a source (what this record says about where this person was at this
moment). Those are completely different things with completely different uses.
The first produces a profile field. The second produces a research engine.

**The Address-as-Search-Key corollary:** An address in any record is a search
key that is independent of the person being researched. Searching a known
address across record types surfaces people you were not looking for --
neighbors, relatives, associates -- and solves cases that name-search cannot.

Proof of concept: A known address belonging to Sam Klein (Coney Island,
Brooklyn) was searched on newspapers.com, surfacing a 1937 death notice for
his sister Julia Klein -- a person not previously found by name search. That
notice named two previously unknown sisters, one in Brooklyn and one in Los
Angeles, with addresses and inheritance details. The Los Angeles sister led to
her death certificate, then a California census cluster, then living cousins
who had spent decades searching for the New York Kleins. All of this from
searching an address that belonged to someone else.

---

## Record Types That Contain Addresses

Every record type below contains at least one extractable address.
The Timeline Builder and Document Analysis Worksheet (Module 5) should
be wired to extract addresses from all of these:

- **Census records** -- household address, enumeration district. The 1940
  US Census added "where did you live 5 years ago" -- two addresses per person.
- **WWII draft cards** -- registrant address, employer name and address,
  next-of-kin name and address, and often a crossed-out previous address with
  a handwritten update (a documented move with an approximate date).
- **Death certificates** -- decedent's address at death, informant's address
  (often a child or sibling -- their current residence).
- **Birth certificates** -- parents' address at time of birth.
- **Marriage licenses and certificates** -- both parties' addresses, sometimes
  parents' addresses and witnesses' addresses (witnesses are almost always
  neighbors or relatives -- FAN evidence).
- **Naturalization papers** -- address at declaration, sometimes prior addresses,
  employer address.
- **SS-5 (Social Security application)** -- employer name and address, home address.
- **Passport applications** -- home address.
- **City directories** -- annual address snapshots filling gaps between census
  years. For urban families in the early 20th century, often the most
  precise annual address data available.
- **Voter registration records** -- address at time of registration, updated
  annually in many jurisdictions.
- **Probate records and wills** -- testator's address, beneficiaries' addresses,
  witnesses' addresses. A will can provide simultaneous address snapshots for
  multiple adult children in non-census years.
- **Military pension files** -- applicant's current address, widow's address,
  neighbor depositions (with their addresses).
- **Newspaper notices** -- business advertisements, death notices, real estate
  transactions.
- **Church records** -- baptism and confirmation records often include addresses.

---

## The Spatial FAN Club

The FAN principle (Family, Associates, Neighbors) is a core GPS research
strategy. Address-as-Evidence makes the FAN network spatially visible and
queryable.

If every person in the database has one or more extracted addresses, the
system can answer: **who else in this database was at or near this address
in this time range?** That query surfaces relationships never explicitly
recorded. It generates FAN leads automatically from data already in the system.

For immigrant communities -- Ashkenazi Jewish families in Brooklyn, for example
-- this is especially powerful. Immigrants from the same shtetl clustered
geographically. Plotted on a map, the address data makes that network visible
and generates research questions that name-search never could.

Module 8 (FAN Club Mapper) should eventually be redesigned as a spatial FAN
map using the addresses table as its primary data source.

---

## Schema Design

### Design Decision: Addresses as a First-Class Table

Addresses are NOT just fields on timeline_events. They are a separate table
because:

1. Addresses appear in many record types, not just residence events. A death
   certificate yields an address. A draft card yields three or four. A will
   yields addresses for every named beneficiary. All of these need to be
   captured and queryable across the full dataset.
2. The cross-person, cross-record address query ("who else was near this
   address?") requires addresses to be a first-class queryable entity.
3. The Address-as-Search-Key use case requires addresses to exist independently
   of the event they came from.

timeline_events for residence events FK to the addresses table. But addresses
also exist attached to any source, independent of timeline events.

### addresses

```sql
addresses (
  id                uuid primary key default gen_random_uuid(),
  person_id         uuid references persons(id) on delete cascade,
  source_id         uuid references sources(id) on delete set null,

  -- Role of this address in the source record
  address_role      text not null default 'residence'
                    check (address_role in (
                      'residence',      -- person lived here
                      'employer',       -- person worked here
                      'next_of_kin',    -- next of kin listed at this address
                      'witness',        -- witness to a document lived here
                      'informant',      -- informant on a death/birth cert lived here
                      'decedent',       -- decedent's address on death cert
                      'applicant',      -- applicant address on a legal document
                      'beneficiary',    -- beneficiary address in probate/will
                      'other'
                    )),

  -- Raw text: exactly as written in the source. Never altered.
  raw_text          text,

  -- Normalized fields: researcher's interpretation of raw_text
  street_address    text,
  city              text,
  county            text,
  state_province    text,
  country           text,

  -- Geocoded coordinates (nullable -- filled when geocoding is available)
  lat               numeric(10, 7),
  lng               numeric(10, 7),

  -- Date of the SOURCE record (not necessarily when they lived there)
  address_date      date,
  date_qualifier    text default 'exact'
                    check (date_qualifier in ('exact','about','before','after','calculated')),
  date_display      text,   -- e.g. "1920 census" or "abt 1922" or "WWII draft card, 1942"

  notes             text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
)
```

### timeline_events

```sql
timeline_events (
  id                uuid primary key default gen_random_uuid(),
  person_id         uuid references persons(id) on delete cascade,

  -- Event type
  event_type        text not null
                    check (event_type in (
                      'birth', 'death', 'marriage', 'divorce',
                      'residence', 'immigration', 'emigration',
                      'naturalization', 'military_service',
                      'occupation', 'land_record', 'census',
                      'baptism', 'burial', 'education', 'other'
                    )),

  -- Date fields
  event_date        date,
  event_date_end    date,         -- for "between" ranges
  date_qualifier    text default 'exact'
                    check (date_qualifier in ('exact','about','before','after','between','calculated')),
  date_display      text,         -- human-readable: "abt 1885" or "bet 1880 and 1890"

  -- Place (all event types)
  place_name        text,         -- "Chicago, Cook County, Illinois"
  city              text,
  county            text,
  state_province    text,
  country           text,

  -- Address FK (primarily residence events, but available for any event type)
  address_id        uuid references addresses(id) on delete set null,

  -- Residence duration (residence events)
  residence_date_from       date,
  residence_date_to         date,
  residence_from_qualifier  text,
  residence_to_qualifier    text,
  residence_current         boolean default false,

  -- GPS / source
  source_id         uuid references sources(id) on delete set null,
  evidence_type     text
                    check (evidence_type in ('Direct','Indirect','Negative')),

  -- Narrative
  description       text,
  notes             text,

  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
)
```

---

## UI Design

### Pages

**List view** (`/timeline`)
- Person selector at top (pulls from /api/persons)
- Chronological list of all events for selected person
- Residence events get distinct visual treatment -- address displayed
  prominently, duration shown as a date span
- Filter controls: event type, date range
- "Residential History" quick-filter collapses to residence events only
- Map placeholder for geocoded addresses (v1 can be a static map or deferred)
- New Event button

**New event form** (`/timeline/new`)
- Event type selector drives which fields appear
- Selecting "residence" expands full address section and duration fields
- Source selector pulls from Citation Builder (existing sources)
- Date input with qualifier selector (exact / about / before / after / between / calculated)
- Address extraction helper: paste raw address text, normalized fields populate
- GPS evidence type required before save
- Back to dashboard breadcrumb

**Event detail** (`/timeline/[id]`)
- Full event record display
- Edit in place
- Address record displayed with raw_text and normalized fields both visible
- Source citation rendered in EE short form with link to Citation Builder record
- Back to timeline list breadcrumb

### Address Entry Discipline

The platform should make address extraction feel rewarding, not burdensome.
Every address entered should:
1. Immediately appear in the residential history view
2. Eventually plot on a map
3. Be queryable against other persons in the system

The reward for doing the work is that the data immediately does something.

---

## AI Features (v1)

**Address normalization assist:** User pastes raw address text from a record.
AI normalizes to street / city / county / state / country fields. Raw text
is always preserved unchanged.

**Address query prompt:** "Who else in this database lived near this address
in this time range?" -- cross-person address proximity query.

**Research leads from address:** Given a confirmed address and year range,
suggest record types to search at that location (census, city directory,
voter registration, church records, ward records, etc.).

---

## Wiring to Other Modules

**Module 5 (Document Analysis Worksheet):** Document fact extraction should
recognize addresses as a named fact type and produce address records, not
just text notes. Pipeline: document uploaded -> facts extracted -> addresses
populate the addresses table automatically.

**Module 8 (FAN Club Mapper):** Should eventually use the addresses table
as its primary spatial data source. The FAN map is a map of known addresses
for all persons in the FAN cluster, plotted chronologically.

**Module 16 (Research Investigation):** Narrative sessions produce addresses.
The conversational fact extraction protocol (when researcher tells stories,
AI extracts discrete facts) should produce address records as a named output
type.

**Research Plan Builder (Module 2):** An "Address-as-Search-Key" research
strategy should be a named output option: given a confirmed address and
time range, generate a research plan targeting that location across all
relevant record types.

---

## SQL Migration

See `sql/008-add-timeline-addresses.sql`

Run in Supabase SQL Editor after sql/007.

---

## Build Prerequisites

- Citation Builder (Module 4) -- COMPLETE. Source selector on new event form
  pulls from existing sources.
- Persons API -- COMPLETE. Person selector on timeline list pulls from /api/persons.
- addresses table -- defined in sql/008
- timeline_events table -- defined in sql/008

## Build Status: BUILD READY

Schema designed. Prerequisites complete. SQL migration written.
Next step: declare BUILD posture and build the module.
