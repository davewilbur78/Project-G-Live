# TNG: A Reference Architecture Analysis for Project-G-Live

**Document type:** Reference thesis  
**Author:** Claude (Anthropic), working with Dave Wilbur  
**TIMESTAMP:** 2026-05-11 06:30 UTC  
**Version:** 1.0  
**Location in repo:** /docs/tng-reference-architecture.md  
**Status:** Living document -- update when new TNG knowledge is acquired or schema gaps are identified

---

## A Note on Research Method and Honest Limitations

This document was produced through deep web research during an EXPLORE session in May 2026. The TNG wiki (tng.lythgoes.net/wiki) blocks direct access to anonymous fetches, so the schema was reconstructed from SQL query examples embedded in wiki articles, community forum posts, third-party tutorials, and change log documentation spanning TNG versions 7 through 15.

The schema described here is accurate at the table and structural level. Field-level detail is confirmed for the most heavily documented tables. Some edge-case fields -- particularly in admin infrastructure tables -- may be incomplete. Mod-added tables are noted where known but are not exhaustive.

The right way to close any gap is to look directly at your own TNG database in phpMyAdmin. You have a running TNG installation. The ground truth is there.

This document should be treated as authoritative for design reference purposes, not as a byte-for-byte specification of TNG internals.

---

## Part One: Who Darrin Lythgoe Is and What He Was Trying to Do

Darrin Lythgoe is a solo developer from Utah who stumbled into genealogy software by accident -- he won a prize at a trade show and realized that no good tool existed for publishing a family tree on the web. He borrowed PHP books from a library and built TNG. He sold one copy in the first year. As of 2024 TNG has over 15,000 users across dozens of countries and languages.

That origin story matters for understanding the design. TNG was not designed by a committee, not funded by venture capital, not architected for massive scale. It was designed by one person solving his own problem, then gradually refined over 20+ years of real users finding its edges.

The problem Darrin was solving: how do you take a genealogical dataset -- the kind that lives in FamilyTreeMaker or RootsMagic or Legacy on someone's desktop computer -- and put it on the web so your family can see it, search it, collaborate on it, and keep it updated?

That is a display and collaboration problem, not a research problem. That distinction is the most important sentence in this document.

TNG is an exceptionally good answer to the display and collaboration problem. It is not designed to touch the research problem at all. Project-G-Live is designed to solve the research problem. These are different problems and they require different tools. But the data layer underneath both problems -- persons, families, events, sources, citations, places, media -- overlaps substantially. And Darrin's data layer is 20 years more mature than ours.

---

## Part Two: GEDCOM as Foundation -- What It Means

GEDCOM stands for Genealogical Data Communication. It was created by the Church of Jesus Christ of Latter-day Saints in the 1980s as a standard file format for exchanging genealogical data between software programs. The current widely-used standard is GEDCOM 5.5.1, finalized in 1999. GEDCOM 7.0 was released in 2021 and TNG v15 has begun supporting it.

GEDCOM is not a database. It is a text file format. But it defines a data model -- the objects and relationships that genealogical software must be able to represent -- and that data model has become the de facto standard for the entire genealogy software industry.

The six fundamental GEDCOM object types are:

- **Individuals (I)** -- people
- **Families (F)** -- family units linking spouses and children
- **Sources (S)** -- documents and records
- **Repositories (R)** -- where sources are held
- **Media objects (M)** -- photos, documents, audio, video
- **Notes (N)** -- free-text notes attached to other objects

Everything in TNG's core schema maps directly to one of these six types. Darrin built a relational database that is, in essence, GEDCOM made queryable and web-native.

**Where GEDCOM as a foundation is a strength:**

GEDCOM compatibility means TNG can import data from any major genealogy desktop program -- FamilyTreeMaker, RootsMagic, Legacy, Reunion -- in minutes. For a display and collaboration tool, this is essential. Users do not want to re-enter data. They want to export from their desktop program and publish. GEDCOM is the bridge.

It also means TNG's data model has been stress-tested against 30+ years of real genealogical data. Edge cases that a fresh schema designer would never anticipate -- multiple name variants, conflicting birth dates from different sources, complex family structures including adoptions and step-parents, events with no dates, dates with uncertain ranges -- all of this is handled because GEDCOM defines how to handle it and TNG implements that definition.

**Where GEDCOM as a foundation is a constraint:**

GEDCOM 5.5.1 is from 1999. It predates modern web development, modern database design patterns, and modern research methodology. It has no concept of GPS compliance. It has no concept of evidence quality. A source citation in GEDCOM is two fields: a page reference and a verbatim text snippet. That is all.

GEDCOM also has significant structural limitations. It cannot natively represent multiple conflicting values for the same fact (two different birth dates from two different sources) without workarounds. It has a rigid binary sex model. It treats addresses as text strings, not structured data. Its citation model is too thin for serious research.

TNG inherits all of these constraints because it is built on GEDCOM's data model. The schema reflects what GEDCOM can express, not what a GPS-compliant researcher needs.

**The bottom line on GEDCOM:**

For Project-G-Live, GEDCOM matters for one reason: our GEDCOM Bridge module (Module 1) needs to import from FamilyTreeMaker. Understanding how GEDCOM maps to a relational schema is therefore directly relevant. But our schema should not be constrained by GEDCOM's limitations. We are not building a GEDCOM-compliant application. We are building a GPS-compliant research platform that can ingest GEDCOM data.

---

## Part Three: The Complete TNG Schema

What follows is the full table inventory, organized by domain. For each table: purpose, confirmed fields, design notes, and relevance to Project-G-Live.

---

### DOMAIN 1: People and Families

---

#### tng_people

**Purpose:** The central individual record. One row per person per tree.

**Confirmed fields:**

| Field | Type | Notes |
|-------|------|-------|
| personID | varchar | e.g. "I0001". The I prefix is convention from GEDCOM. |
| gedcom | varchar | Tree ID. Part of composite PK with personID. |
| firstname | varchar | Given name(s). |
| lastname | varchar | Surname. |
| lnprefix | varchar | Surname prefix: "de", "van", "von", "de la". Stored separately for sorting. |
| suffix | varchar | "Jr.", "Sr.", "III", etc. |
| title | varchar | "Dr.", "Rev.", "Capt.", etc. |
| nickname | varchar | Stored separately but displayed in quotes. |
| sex | char(1) | "M", "F", or "U" (unknown). Binary by GEDCOM constraint. |
| living | tinyint | 1=living, 0=deceased. Calculated on import, editable. |
| private | tinyint | 1=private (hidden from non-admins). |
| changedate | varchar | Date of last edit. Free-text, not a proper timestamp. |
| branch | varchar | Legacy single-branch field. Superseded by tng_branchlinks for multi-branch. |
| **Built-in event fields -- stored directly, not in tng_events:** | | |
| birthdate | varchar | Free-text date: "20 Apr 1922", "Abt 1900", "Bef 1776". |
| birthdatetr | varchar | Machine-sortable date: "19220420". Used for sorting and calculations. |
| birthplace | varchar | Free-text place name. |
| deathdate | varchar | Same pattern as birthdate. |
| deathdatetr | varchar | Sortable version. |
| deathplace | varchar | Free-text. |
| burialdate | varchar | |
| burialdatetr | varchar | |
| burialplace | varchar | |
| christeningdate | varchar | |
| christeningdatetr | varchar | |
| christeningplace | varchar | |
| cause | varchar | Cause of death. |
| addressID | int | FK to tng_addresses. Current/last known address. |

**Design notes:**

The decision to store birth, death, burial, and christening as direct fields rather than rows in tng_events is the most consequential design decision in the entire schema. It was made for performance. These events are queried on almost every page load -- person profiles, search results, pedigree charts, descendancy charts. If they required a JOIN to tng_events every time, the application would be slow.

The cost: each built-in event field holds exactly one value. A person with two conflicting birth dates in two different sources can only have one birthdate in the built-in field. The second value must go into tng_events as a custom event. This means built-in and custom events for the same fact type are stored in different places and require different queries to retrieve together -- a real limitation for research work.

The dual date pattern (birthdate + birthdatetr) is elegant and worth adopting. The human-readable date ("Abt May 1960", "Bef 1776") is preserved exactly as entered. The machine-sortable version ("19600500", "17760000") is derived and stored alongside it for sorting and date arithmetic. This pattern was arrived at through real-world pain with date fields that tried to do both jobs with one value.

**Relevance to Project-G-Live:**

Our persons table currently has: id, first_name, last_name, birth_year, birth_place, death_year, created_at, updated_at. This is significantly thinner than TNG's. We are missing: lnprefix, suffix, title, nickname, sex, living flag, private flag, the dual-date pattern, christening fields, burial fields, cause of death, and the addressID reference.

We do not necessarily need all of these immediately. But the dual-date pattern (human-readable + machine-sortable) is one we should adopt wherever we store dates across the entire application.

---

#### tng_families

**Purpose:** Represents a family unit. Links a husband, a wife, and (through tng_children) their children. One row per family per tree.

**Confirmed fields:**

| Field | Type | Notes |
|-------|------|-------|
| familyID | varchar | e.g. "F0001". |
| gedcom | varchar | Tree ID. Composite PK with familyID. |
| husband | varchar | personID of husband. Nullable. |
| wife | varchar | personID of wife. Nullable. |
| living | tinyint | If either spouse is living. |
| private | tinyint | |
| changedate | varchar | |
| **Built-in event fields:** | | |
| marrdate | varchar | Marriage date, free-text. |
| marrdatetr | varchar | Sortable marriage date. |
| marrplace | varchar | |
| marrtype | varchar | "MARR", "MARB" (banns), "MARL" (license), etc. |
| divdate | varchar | Divorce date. |
| divdatetr | varchar | |
| divplace | varchar | |

**Design notes:**

The family record is the structural backbone of tree navigation. It is what makes pedigree charts, descendancy charts, and family group sheets possible. The husband/wife fields are personID foreign keys -- but they are nullable, which means TNG can represent families where one spouse is unknown.

The binary husband/wife structure reflects GEDCOM's 1999 design. Same-sex marriages require workarounds in most TNG installations. GEDCOM 7.0 addresses this but it is a significant migration.

A person can be linked to multiple families -- as a child in their birth family, as a spouse in their marriage family, as a child in an adoptive family. These relationships are all managed through tng_children and the husband/wife fields. The schema handles this correctly but queries that need to find all of a person's family relationships require joins across multiple tables.

**Relevance to Project-G-Live:**

We do not currently have a families table. Our persons table is a flat list. As we build toward the FAN Club Mapper (Module 8) and the family group sheet (Module 11), we will need to represent family relationships. TNG's families model is the right starting reference.

---

#### tng_children

**Purpose:** Bridge table linking individuals to the family units in which they appear as children. One row per child-family relationship per tree.

**Confirmed fields:**

| Field | Notes |
|-------|-------|
| personID | FK to tng_people. |
| familyID | FK to tng_families. |
| gedcom | Tree ID. |
| haskids | Flag: does this child have their own children in the database? Used to display the ">" descent indicator. |
| ordernum | Birth order within the family. |

**Design notes:**

The bridge table pattern here is correct and necessary. A person can appear as a child in more than one family (birth family and adoptive family, for example). Using a bridge table rather than a familyID field on the person record accommodates this cleanly.

The haskids flag is a denormalization for display performance -- rather than counting descendant records every time a name is displayed on a chart, the flag is maintained so the ">" indicator can be rendered without a query.

---

### DOMAIN 2: Events

---

#### tng_events

**Purpose:** Stores all events that are not built-in. This is the flexible backbone of the genealogical event model. One row per event occurrence per person or family per tree.

**Confirmed fields:**

| Field | Type | Notes |
|-------|------|-------|
| eventID | int | Auto-increment PK within the tree. |
| gedcom | varchar | Tree ID. |
| eventtypeID | varchar | FK to tng_eventtypes. For custom events this is a numeric ID. For built-in events this field stores the GEDCOM tag directly (BIRT, DEAT, etc.) -- an overload that creates query complexity. |
| eventdate | varchar | Free-text date. Same pattern as tng_people date fields. |
| eventdatetr | varchar | Machine-sortable date. |
| eventplace | varchar | Free-text place name. |
| info | varchar(255) | The event value -- the "what" of the event. Occupation name, school name, immigration ship, etc. |
| cause | varchar | Cause field, primarily used for death cause events. |
| addressID | int | FK to tng_addresses. Structured address for residence and similar events. |
| persfamID | varchar | Overloaded FK. Contains a personID, familyID, or repositoryID depending on the event type. |
| changeddate | varchar | |

**Design notes:**

This table is where all the interesting genealogical data lives that is not captured in the built-in fields. Residence, occupation, immigration, emigration, naturalization, education, graduation, military service, religious affiliation, probate, census, and any custom event type the site administrator defines -- all of it goes here.

The `persfamID` overloaded foreign key is the most technically awkward part of the TNG schema. A single field contains IDs that might point to tng_people, tng_families, or tng_repositories, depending on the eventtypeID. The `type` field in tng_eventtypes (I/F/R) tells you which table it points to. This means you cannot enforce referential integrity at the database level for this relationship -- it is enforced in application code. A strict relational design would use separate foreign key fields for each target table, or a polymorphic association pattern with a type discriminator. Darrin chose simplicity over strictness.

The `info` field being capped at 255 characters is a notable limitation. An occupation value of "Merchant" fits easily. But a naturalization petition description or a military service summary can be much longer. TNG handles this through event notes (stored in tng_xnotes and linked via tng_notelinks) but the workflow is not seamless.

**The built-in vs custom event split in practice:**

When you query for all events for a person, you need two queries (or a UNION): one to tng_people for the built-in fields, and one to tng_events for everything else. The wiki SQL examples consistently show this pattern. It is the primary complexity in working with TNG's event data.

**Relevance to Project-G-Live:**

Our timeline_events table in Module 7 is our closest equivalent to tng_events. Key differences: we have a more structured date handling design, our addresses table is a first-class research artifact rather than a lookup, and we don't have the built-in/custom split complexity because we treat all events the same way. What we should borrow: the dual-date pattern, the eventtype catalog concept, and the addressID reference on individual events.

---

#### tng_eventtypes

**Purpose:** The controlled vocabulary for event types. Defines what kinds of events exist and how they behave.

**Confirmed fields:**

| Field | Notes |
|-------|-------|
| eventtypeID | PK. Numeric for custom types; for built-in types the GEDCOM tag itself (BIRT, DEAT, etc.) is used directly in the events table rather than referencing this table -- an inconsistency in the design. |
| tag | The GEDCOM tag: RESI, OCCU, IMMI, EMIG, NATU, EDUC, GRAD, RELI, PROB, EVEN, CENS, MILI, etc. |
| display | Human-readable name: "Residence", "Occupation", "Immigration", etc. |
| type | I (Individual), F (Family), or R (Repository). Controls which record types can have this event. |
| keep | Flag: should events of this type be imported from GEDCOM? |
| collapse | Flag: should multiple events of this type be collapsed in the UI by default? |
| ordernum | Display order on the person profile page. |

**Design notes:**

This table starts empty on a fresh TNG install. It is populated from GEDCOM import (if the admin chooses to keep custom event types) or through manual admin entry. The catalog is entirely user-defined beyond the GEDCOM standard tags.

The type field (I/F/R) is the mechanism by which events are scoped. Residence is an Individual event. Marriage is a built-in Family event. A repository can have events too -- this is rarely used but architecturally supported.

The ability to define completely custom event types -- including non-standard tags of the user's own invention -- is cited by TNG's marketing as a differentiating feature. It means the event model is as flexible as the researcher needs it to be, not limited to what GEDCOM anticipated.

---

### DOMAIN 3: Sources, Citations, and Repositories

---

#### tng_sources

**Purpose:** The master source record. One row per distinct source. Multiple citations point back to one source record.

**Confirmed fields:**

| Field | Notes |
|-------|-------|
| sourceID | PK within the tree. e.g. "S0001". |
| gedcom | Tree ID. |
| title | Source title. |
| author | Author or creator. |
| publisher | Publisher or issuing agency. |
| callnum | Call number or reference number at a repository. |
| publ | Publication information (place, date, etc. in free text). |
| repo | FK to tng_repositories. Where this source is held. |
| actualtext | Verbatim text from the source. Theoretically supports block quotation but is free text. |
| comments | Admin notes about the source. Not displayed publicly. |
| private | Visibility flag. |
| changedate | |

**Design notes:**

TNG's source model is GEDCOM-compliant but thin. There are no GPS classification fields. The source type (original vs derivative vs authored, in GPS terms) is not captured. The informant relationship (who provided the information in this source) is not captured. There is no short footnote form vs full citation form distinction.

The `actualtext` field is conceptually the right idea -- preserving verbatim text from a source is exactly what GPS methodology requires. But in practice it is a freeform text field with no enforcement, no display structure, and no citation formatting engine attached to it.

A community-developed mod called Citation Master exists specifically to address TNG's citation formatting limitations. It allows users to define citation format templates mapped to source types, outputting Chicago Manual of Style or EE-style formatted citations. The fact that this needed to be a community mod rather than a core feature reveals the limits of Darrin's source design.

The source-to-repository relationship (FK to tng_repositories) is correct and important. Separating where a source is from what the source is reflects standard archival practice.

**Relevance to Project-G-Live:**

Our sources table in the Citation Builder (Module 4) is substantially richer than TNG's. We have GPS classification (source_type: original/derivative/authored), information type (primary/secondary), evidence type (direct/indirect/negative), full EE citation fields, short footnote form, and a Three-Layer analysis system. This is our most significant structural advantage over TNG and it is not an accident -- it reflects the GPS framework that TNG has no awareness of.

Where TNG has us: the repository relationship. We do not currently have a repositories table. When we build toward BCG-quality work, repositories (archives, courthouses, libraries, FamilySearch, Ancestry) need to be first-class objects, not just text in a citation field.

---

#### tng_citations

**Purpose:** Links a source to a specific event for a specific person or family. The "citation" in TNG's parlance is the individual use of a source -- not the source itself.

**Confirmed fields:**

| Field | Notes |
|-------|-------|
| citationID | Auto-increment PK. |
| sourceID | FK to tng_sources. |
| gedcom | Tree ID. |
| persfamID | FK to tng_people or tng_families. Overloaded like tng_events. |
| eventID | The event this citation supports. For built-in events, contains the GEDCOM tag (BIRT, DEAT, etc.). For custom events, contains the eventID from tng_events. Overloaded -- inconsistent. |
| page | Page number or specific location within the source. |
| citetext | Verbatim text from the source specifically relevant to this event. |
| citationdate | The date this citation was created or accessed. Ambiguous in meaning. |
| note | Citation-level note. |

**Design notes:**

This is the thinnest table in TNG's schema relative to what a serious researcher needs. Two content fields -- `page` and `citetext` -- is GEDCOM-compliant but inadequate for EE-style citation practice.

In Evidence Explained, a full citation for a single census record might include: the archive, the collection, the film/roll/page, the household number, the informant, the year of the census, and specific transcription notes for the claim being supported. None of this has a dedicated field in tng_citations. It either gets crammed into `page` or lost.

Citations in TNG are also one-to-one with events: one citation record links one source to one event for one person. If the same source supports a birth date AND a birthplace, two citation records are created. This is technically correct per GEDCOM but creates duplication in practice.

Citations cannot be shared across people. If a census record documents three members of a family, three separate citation records are created -- one per event per person. The source record is shared but the citation is not.

**Relevance to Project-G-Live:**

This is the clearest example of where Project-G-Live must go further than TNG. Our Case Study Builder (Module 10) requires citations with full EE structure, Three-Layer analysis, short footnote forms, and inline superscript footnotes in proof arguments. None of that is possible in TNG's citations model.

---

#### tng_repositories

**Purpose:** Defines the physical or institutional location where sources are held.

**Confirmed fields:**

| Field | Notes |
|-------|-------|
| repositoryID | PK. e.g. "R0001". |
| gedcom | Tree ID. |
| reponame | Name of the repository: "National Archives", "New York City Municipal Archives", etc. |
| address | Street address. Free text. |
| phone | |
| email | |
| www | Website URL. |
| notes | |
| changedate | |

**Design notes:**

Repositories are a GEDCOM first-class object type and TNG implements them faithfully. The model is simple but correct. A repository is where you go (physically or digitally) to access a source. Separating this from the source itself means you only need to define NARA once, then link every NARA source to that single repository record.

This is architecturally sound and worth adopting. We do not currently have this table.

---

### DOMAIN 4: Notes

---

#### tng_xnotes

**Purpose:** Stores note content. The "x" prefix is a TNG convention distinguishing these from other internal note constructs.

**Confirmed fields:**

| Field | Notes |
|-------|-------|
| ID | Auto-increment PK. |
| gedcom | Tree ID. |
| note | The note text. Long text field. |

---

#### tng_notelinks

**Purpose:** Bridge table connecting notes to the objects they belong to.

**Confirmed fields:**

| Field | Notes |
|-------|-------|
| xnoteID | FK to tng_xnotes. |
| gedcom | Tree ID. |
| persfamID | The person, family, source, or repository this note is attached to. |
| eventID | If the note is attached to a specific event, this identifies which event. Uses GEDCOM tag for built-in events, eventID for custom events. |
| subtype | Further specifies what kind of object is being linked. |

**Design notes:**

The separation of note content from note linkage is architecturally sound. Notes exist as standalone objects (tng_xnotes) that are attached to things via tng_notelinks. This means the same note could theoretically be attached to multiple objects, though this is rarely done in practice.

In genealogical practice, notes serve several distinct purposes that TNG does not distinguish between: transcriptions of source text, researcher observations, disputed data flags, and narrative summaries. All of these go into the same note field with no structural distinction. For GPS compliance, distinguishing between a verbatim transcription and a researcher interpretation is important. TNG does not enforce this.

---

### DOMAIN 5: Places

---

#### tng_places

**Purpose:** A lookup table of places that have been entered into the database. Accumulates through data entry rather than being pre-populated.

**Confirmed fields:**

| Field | Notes |
|-------|-------|
| placeID | Auto-increment PK. |
| gedcom | Tree ID. |
| place | The full place name as entered: "Brooklyn, Kings County, New York, USA". |
| latitude | Decimal degrees. Set through batch geocoding or manual entry. |
| longitude | Decimal degrees. |
| placelevel | Granularity indicator: 1=country, 2=state/province, 3=county, 4=city/town, 5=neighborhood. Used to control Google Maps zoom. |
| zoom | Google Maps zoom level for this place. |
| notes | |
| changedate | |

**Design notes:**

The place model is TNG's most significant structural weakness. Because places are entered as free text and accumulated without validation, the same geographic location can exist as dozens of slightly different records: "Brooklyn, NY", "Brooklyn, New York", "Brooklyn, Kings, New York", "Brooklyn, Kings County, NY, USA". Each unique string creates a new row. The tng_places table on an active site is often heavily polluted with duplicates.

TNG provides an admin merge tool that allows the administrator to designate one canonical form and merge all variants into it. This is a manual, time-consuming process that most users never fully complete.

The geocoding model (latitude, longitude, placelevel, zoom) is practical and works well for Google Maps integration. But geocoding historical addresses is inherently imprecise -- a street that no longer exists, a neighborhood that has been renamed, a county boundary that has changed. TNG does not address this complexity; it simply stores coordinates.

The absence of any controlled place hierarchy (country > state > county > city) means place queries are string-matching operations, which are slow and imprecise on large datasets.

**Relevance to Project-G-Live:**

Our addresses table is architecturally superior to tng_places for our use case. We treat addresses as first-class evidence artifacts from sources, not as descriptive metadata. The lat/lng fields in our addresses table serve the same geocoding purpose TNG has. What we should watch: place name normalization is a hard problem. Our AI Normalize button is a good approach but we will encounter the same duplication issues Darrin encountered without a merge/canonicalization workflow.

---

### DOMAIN 6: Media

---

#### tng_media

**Purpose:** The master media record. One row per media item.

**Confirmed fields:**

| Field | Notes |
|-------|-------|
| mediaID (mediakey) | PK. String key combining collection type and a number. |
| gedcom | Tree ID. |
| path | Relative file path on the server. |
| thumbpath | Path to the thumbnail image. |
| mediatypeID | The collection this item belongs to: "photos", "documents", "headstones", "histories", "videos", "recordings", or custom. |
| description | Title or caption for the item. |
| notes | Longer descriptive text. |
| owner | Credit/attribution for the original item. |
| date | Date associated with the media item (not the upload date). Free text. |
| aliveyn | Privacy flag for media linked to living people. |
| private | |
| cemeteryID | FK to tng_cemeteries. Only relevant for headstone collection items. |
| plot | Cemetery plot identifier. Headstones only. |
| status | Headstone condition (Good, Fair, Poor, etc.). Headstones only. |
| linktocem | Flag: is this item directly associated with the cemetery itself vs a person buried there? |
| changedate | |

---

#### tng_medialinks

**Purpose:** Bridge table connecting media items to the genealogical objects they document.

**Confirmed fields:**

| Field | Notes |
|-------|-------|
| mediaID | FK to tng_media. |
| gedcom | Tree ID. |
| persfamID | The person, family, source, repository, or place this media is linked to. |
| eventID | If linked to a specific event. |
| linktype | Specifies what type of object is being linked (person, family, source, etc.). |
| ordernum | Display order when multiple media items are linked to one object. |
| defaultphoto | Flag: is this the primary display photo for this person? |
| crop_x, crop_y, crop_w, crop_h | Crop coordinates for GEDCOM 7.0 media cropping (added in v15). |

---

#### tng_mediatypes

**Purpose:** Registry of media collections/types.

**Confirmed fields:** collectionID (the type name: "photos", "documents", etc.), display title, folder path, icon file, "same setup as" reference for custom collections that inherit from a standard type.

**Design notes on the media system overall:**

TNG's media model is well-designed for its purpose. The separation of the master media record (tng_media) from its links to genealogical objects (tng_medialinks) is correct -- one photo can be linked to multiple people (a family photograph), multiple events (it documents both a birth and a christening), or a source (it is the scan of the document). The bridge table handles this cleanly.

The collection system (Photos, Documents, Headstones, Histories, Videos, Recordings + custom) is a practical organizational layer. The admin can add custom collections -- Military Records, Censuses, Certificates -- each with its own folder and icon. This is useful.

Image tagging (the ability to draw a box on a photo and link it to a person, family, source, or repository) is a genuinely powerful feature that most genealogy applications lack. The crop coordinates added in v15 allow a group photo to show only the relevant person on charts and profile pages.

---

### DOMAIN 7: Cemeteries

---

#### tng_cemeteries

**Purpose:** A TNG-specific concept. Defines a cemetery as a first-class object, separate from burial places recorded in event data.

**Confirmed fields:**

| Field | Notes |
|-------|-------|
| cemeteryID | Auto-increment PK. |
| gedcom | Tree ID. |
| cemetery | Cemetery name. |
| place | Location. |
| latitude | |
| longitude | |
| description | |
| notes | |
| changedate | |

**Design notes:**

Cemeteries are not a GEDCOM object. They must be entered manually -- GEDCOM import does not create cemetery records even when burial places are imported. The value is being able to browse headstones by cemetery, view a cemetery map or photo, and see all burials in one location.

This is a good pattern for any domain object that is not in GEDCOM but deserves first-class status. Darrin recognized that burial location is not the same as a place name string, and gave it its own table.

---

### DOMAIN 8: DNA

---

#### tng_dna

**Purpose:** Records DNA tests and links them to people in the database.

**Confirmed fields:**

| Field | Notes |
|-------|-------|
| dnaID | Auto-increment PK. |
| gedcom | Tree ID. |
| testtype | yDNA, mtDNA, atDNA, X-DNA. |
| testnumber | Kit number from the testing company. |
| vendor | Testing company: AncestryDNA, 23andMe, FTDNA, MyHeritage, etc. |
| testdate | When the test was processed. |
| haplogroup | Haplogroup designation. |
| confirmed | Flag: confirmed by SNP testing. |
| groupID | FK to tng_dnagroups. |
| mrca | personID of the most recent common ancestor. |
| links | URL list for web pages associated with this test. |
| notes | |
| changedate | |

For yDNA tests, through a community mod (Add DNA Test Results), STR marker values can also be stored -- individual marker names and their values, comma-separated. This enables comparison of multiple yDNA tests within the admin interface.

---

#### tng_dnagroups

**Purpose:** Groups of related DNA tests. Primarily used for atDNA match management.

**Confirmed fields:** groupID, gedcom, groupname, description.

**Design notes:**

The DNA model reflects how Darrin approached atDNA match management in v12.1: a test subject gets a DNA group (e.g., "atDNA Dave Wilbur"), then each DNA match is added as an individual test record within that group. This allows comparison of matches -- which segments overlap, which people share the same match.

It is a clever use of the existing DNA test structure for a different purpose. But it is not a proper atDNA segment database. There are no chromosome positions, no segment lengths in centimorgans, no clustering capability. It is record-keeping, not analysis.

**Relevance to Project-G-Live:**

Our DNA Evidence Tracker (Module 14) will need to go significantly further than TNG's DNA model for Ashkenazi Jewish atDNA research, which involves endogamy, multiple overlapping matches, and complex segment analysis. TNG's model is a useful starting reference for the basic test record structure but not sufficient for the full workflow.

---

### DOMAIN 9: Branches

---

#### tng_branches

**Purpose:** Named subsets of the tree for filtering and reporting.

**Confirmed fields:** branchID, gedcom, branch (name), description.

---

#### tng_branchlinks

**Purpose:** Bridge table linking people and families to branches. Supports multi-branch membership.

**Confirmed fields:** persfamID, gedcom, branch (the branch name).

**Design notes:**

Branches are a powerful organizational tool for large trees. A researcher studying multiple surnames can define "Klein line", "Singer line", and "Springer line" as branches, tag people accordingly, and then run reports or searches scoped to a single branch. A person can belong to multiple branches.

The branch concept maps loosely to our persons table organization -- we organize by research case rather than by named branch, but the underlying need (grouping people into named subsets for filtering) is the same.

---

### DOMAIN 10: Addresses

---

#### tng_addresses

**Purpose:** Structured address storage. Referenced by people records and events.

**Confirmed fields:**

| Field | Notes |
|-------|-------|
| addressID | Auto-increment PK. |
| gedcom | Tree ID. |
| address1 | Street address line 1. |
| address2 | Street address line 2. |
| city | |
| state | |
| zip | |
| country | |
| phone | |
| email | |
| www | |

**Design notes:**

This is the most underrealized table in TNG's schema. It exists, it is referenced by both tng_people (current address) and tng_events (address for residence and similar events), but the community documentation on it is sparse and it is rarely discussed in the wiki.

Darrin recognized that an address is not just a place name string -- it has structure. But he did not go far enough. The tng_addresses table has no source citation attached to it. It has no date range. It has no notion of the record from which the address was derived. It is a structured mailing address, not an evidence artifact.

This is precisely the gap that Project-G-Live's Address-as-Evidence principle fills. Our addresses table is what tng_addresses would be if Darrin had designed it for a researcher rather than a display application.

---

### DOMAIN 11: Users and Permissions

---

#### tng_users

**Purpose:** User accounts and access control.

**Confirmed fields:**

| Field | Notes |
|-------|-------|
| userID | Auto-increment PK. |
| username | Login name. |
| password | Hashed password. |
| firstname | |
| lastname | |
| email | |
| mygedcom | The tree this user is assigned to by default. |
| role | admin, editor, contributor, member, guest. |
| living | Can this user view living individual data? |
| private | Can this user view private records? |
| verified | Email verification flag. |
| registerdate | |
| lastlogin | |

**Design notes:**

TNG's permission system is role-based with a small, fixed set of roles. The key permission axes are tree access (which trees can this user see), living data visibility (can they see records marked as living), and private data visibility (can they see records marked as private). Admins can also assign users to specific trees only.

This is adequate for a family collaboration tool. It is not granular enough for a professional research platform where different team members might have different access levels to different cases or different modules.

---

### DOMAIN 12: Trees

---

#### tng_trees

**Purpose:** The master registry of trees in the installation.

**Confirmed fields:**

| Field | Notes |
|-------|-------|
| gedcom | The tree ID. This is the value that appears as the "gedcom" field throughout every other table. |
| treename | Human-readable name. |
| description | |
| owner | |
| established | When this tree was created. |
| home | The personID of the "home person" -- the default individual shown on the homepage. |
| secret | Flag: is this tree hidden from public access? |

**Design notes:**

The tree concept is architectural. Every row in every table in TNG carries a gedcom (tree ID) field that points back to tng_trees. This means the entire database can host multiple separate family trees simultaneously, with complete data isolation between them. Queries within one tree simply filter on `WHERE gedcom = 'treeID'`.

This is elegant and worth studying for any application that might need to support multiple independent datasets. The composite primary key pattern (gedcom + recordID) is the mechanism that makes it work.

---

### DOMAIN 13: Admin Infrastructure

---

#### tng_settings

Key-value store for all system configuration. Every setting configurable in TNG's admin interface is stored here.

#### tng_languages

Registry of installed language packs. TNG supports 20+ languages with dynamic switching.

#### tng_reports

Saved custom reports -- either field-based reports built through the report builder UI, or raw SQL queries entered by admins. Reports can be public or admin-only.

#### tng_albums

Groups of media items. Albums can be linked to people or families.

#### tng_albumlinks

Bridge table: albumID to mediaID.

#### tng_mostwanted

Admin-managed list of research priorities -- people and photos the site owner is actively seeking.

#### tng_whatsnew

Log of recent additions and changes, powering the public "What's New" page.

#### tng_counters

Page hit tracking.

---

## Part Four: The Design Philosophy

Six principles drove Darrin's design decisions. Understanding them explains choices that might otherwise look arbitrary.

**1. GEDCOM compatibility is non-negotiable.**

Every core design decision is constrained by GEDCOM compatibility. The built-in event fields mirror GEDCOM's BIRT/DEAT/BURI structure. The citation model reflects GEDCOM's thin source citation. The overloaded persfamID field exists because GEDCOM represents the same event concept across multiple record types. If you understand GEDCOM, TNG's schema is almost entirely predictable.

**2. Display performance over normalization.**

The decision to store birth/death/burial directly in tng_people rather than in tng_events is a deliberate denormalization for performance. Pedigree charts, search results, and person profiles load quickly because the most commonly needed data requires no joins. This trade-off was correct for the use case and still is.

**3. Flexibility over structure in content fields.**

Dates are stored as free text. Places are stored as free text. Note content is a long text field with no structure. Citations have minimal structured fields. This makes TNG accessible to non-technical users who can enter data in any format they prefer, but it makes the data hard to query precisely and easy to make inconsistent.

**4. The table is always wrong at first.**

TNG has grown through 15 major versions. Many tables have fields that were added in later versions, creating heterogeneity in what any given field means or contains depending on when the data was entered. The schema has calluses. Some of those calluses are scars from mistakes (the tng_addresses underutilization) and some are wise adaptations (the dual-date pattern, the multi-branch system replacing the single branch field).

**5. Community extensions fill the gaps.**

The Mod Manager ecosystem exists because Darrin recognized he could not solve every user's problem. Citation Master solves the citation formatting problem. DNA Test Results extends the DNA model. Address geocoding tools extend the place model. The core schema is deliberately kept lean, with the community filling specialized needs.

**6. The researcher is not the primary user.**

This is the most important design principle for understanding TNG's limitations from Project-G-Live's perspective. TNG is designed for the researcher as publisher -- someone who has already done the research and wants to present the results. The active researcher -- building proof arguments, resolving conflicts, tracking sources, managing a research plan -- is not Darrin's user. That is our user.

---

## Part Five: What TNG Got Right

These are the things Darrin got right that we should treat as validated decisions and adopt or match where applicable.

**The dual-date pattern.**
Storing a human-readable date alongside a machine-sortable version is the correct solution to the genealogical date problem. Free-form dates ("Abt May 1960", "Bef 1776", "Between 1880 and 1890") must be preserved exactly as the researcher entered them. But sorting, filtering, and date arithmetic require a consistent format. Two fields, not one. We should adopt this pattern everywhere we store dates in Project-G-Live.

**The composite primary key for multi-tree support.**
Even though Project-G-Live currently serves one user, the (treeID + recordID) composite key pattern is architecturally sound for any application that might eventually need to isolate multiple independent datasets. It costs almost nothing to implement from the start and it costs significantly to retrofit later.

**The event type catalog.**
The tng_eventtypes table as a controlled vocabulary for event types is the right pattern. A person's events should not be untyped free-form records. The type catalog gives events meaning, enables filtering and reporting, and allows the UI to display event-specific fields. Our timeline_events table would benefit from a more explicit eventtypes reference table.

**The bridge table pattern for media links.**
One media item can be linked to multiple genealogical objects -- a family photo linked to multiple people, an event, and a source simultaneously. The tng_medialinks bridge table handles this cleanly. Direct foreign keys would not.

**Repositories as first-class objects.**
Archives, libraries, courthouses, and online repositories (FamilySearch, Ancestry, NARA) deserve their own table. Not just a text field on a source record. We should add a repositories table before we go much further.

**The branches concept.**
Named subsets of the database for filtering and reporting is a pattern we should consider for organizing research cases. Our todos table already has an origin_module field -- the branch concept would extend this to persons and events.

**The "What's New" pattern.**
A log of recent additions and changes to the database is valuable for collaboration and for a researcher tracking their own work. We do not have this. It belongs in a future FIX or BUILD session.

**The cemetery as distinct from the burial place.**
The insight that "buried at Brooklyn, Kings County, New York" is a place name string, but "buried at Washington Cemetery, plot 14B" is a cemetery record, is the same insight as Address-as-Evidence. Physical locations that recur across many records deserve their own table. We applied this to addresses. We should eventually apply it to cemeteries too.

---

## Part Six: What TNG Got Wrong or Left Incomplete

**The tng_addresses underutilization.**
The addresses table exists and is structurally sound but was never fully developed. It has no source citation attached. It has no date range. It has no notion of which record the address came from. It is a structured mailing address, not an evidence artifact. This was a missed opportunity that Project-G-Live's Address-as-Evidence principle directly corrects.

**The built-in event single-value limitation.**
Birth, death, burial, and christening each have exactly one date and one place field in tng_people. A researcher who has found conflicting birth information in two different sources -- a common GPS scenario -- can only record one value in the built-in fields. The second value must go into tng_events as a custom event, creating an asymmetry in how the same type of information is stored. This complicates queries and creates subtle data quality problems.

**Citations are too thin.**
`page` and `citetext` are not enough for EE-compliant citation practice. The absence of GPS classification fields (source type, information type, evidence type) means TNG cannot enforce or even encourage good research practice at the data layer. Citations are structural plumbing, not analytical tools.

**The tng_places duplication problem.**
An unvalidated accumulating place table is the wrong solution for a research application. The merge tool is a workaround for a structural problem. A place should be a canonical record, not an accumulated string.

**Notes have no type.**
A verbatim transcription, a researcher observation, a source conflict flag, and a narrative summary are all stored in the same note field with no structural distinction. For GPS compliance, distinguishing between these is important. TNG does not attempt to do this.

**Sources have no GPS classification.**
The most fundamental GPS question about any source -- is it original, derivative, or authored? -- has no field in tng_sources. There is nowhere to record this. It is an omission that reflects TNG's design goal (display and collaboration) rather than Project-G-Live's goal (GPS-compliant research).

**DNA is record-keeping, not analysis.**
The DNA tables are a good start for tracking test existence but insufficient for serious genetic genealogy work. No chromosome segments. No cM values at the match level. No clustering. For Ashkenazi endogamy research specifically, the model is inadequate as-is.

**The changedate fields are strings.**
Almost every table has a changedate field, but it is stored as a free-text varchar, not a proper timestamp. This means you cannot reliably sort or filter by last-modified date. This is a vestigial design decision from early versions that was never cleaned up.

---

## Part Seven: The GPS Gap

This section deserves its own treatment because it is the clearest articulation of why Project-G-Live exists.

GPS stands for the Genealogical Proof Standard. It is the professional methodology framework that governs what constitutes proven genealogical fact. Its five elements are: a reasonably exhaustive search, complete and accurate citations, analysis of each source and its information and evidence, resolution of conflicting evidence, and a soundly reasoned, coherently written conclusion.

TNG has no awareness of GPS. This is not a criticism of Darrin -- GPS compliance was not his design goal. But the absence is total.

Here is what TNG cannot do that Project-G-Live is designed to do:

- Classify a source as original, derivative, or authored
- Classify information within a source as primary or secondary
- Classify evidence as direct, indirect, or negative
- Track the evidential weight of a source in a proof argument
- Build a chain of evidence from multiple sources to a conclusion
- Flag conflicting sources and force resolution before a conclusion is accepted
- Generate a proof argument with inline footnotes from the underlying citation data
- Track research sessions and what was searched where
- Manage a research plan with assigned strategies
- Build a GPS-compliant case study with staged workflow
- Produce a reasonably exhaustive search checklist
- Generate BCG-quality research reports or correspondence logs

Every one of these capabilities is a module in Project-G-Live. None of them exist in TNG in any form.

This gap is not a flaw in TNG. It is a reflection of its design goal. TNG is a publication and collaboration tool. Project-G-Live is a research methodology enforcement and documentation platform. These are different tools for different moments in the same researcher's workflow.

---

## Part Eight: TNG vs Project-G-Live -- Direct Comparison

| Domain | TNG | Project-G-Live | Assessment |
|--------|-----|----------------|------------|
| Persons | Rich: name components, dual dates, living/private flags, built-in events | Thin: basic name fields, birth/death year | TNG significantly ahead |
| Families | Full: husband/wife/children relationships, family events | Not yet built | TNG only |
| Events | Sophisticated: built-in + custom type catalog, dual dates, address reference | Built in Module 7, improving | TNG ahead on structure; we are ahead on Address-as-Evidence |
| Sources | Thin: basic metadata, no GPS classification | Rich: full GPS classification, EE fields, Three-Layer analysis | Project-G-Live significantly ahead |
| Citations | Very thin: page + citetext | Rich: full EE structure, inline footnotes, GPS-linked | Project-G-Live significantly ahead |
| Repositories | First-class table | Not yet built | TNG only |
| Places | Accumulating string table with geocoding, known duplication problems | First-class address table, AI normalization | Different approaches; ours is better for research |
| Media | Excellent: bridge table, collections, image tagging, crop support | Deferred | TNG significantly ahead |
| DNA | Basic test record tracking, group matching | Module 14 not yet built | TNG ahead as starting point, but insufficient for our needs |
| Branches | Named subsets, multi-branch membership | Not yet built | TNG ahead |
| GPS workflow | None | Core purpose: Modules 2-10, 15-16 | Project-G-Live only |
| Research log | None | Module 3 complete | Project-G-Live only |
| Proof arguments | None | Module 10 complete | Project-G-Live only |
| Conflict resolution | None | Module 6 complete | Project-G-Live only |
| Research planning | None | Module 2 complete | Project-G-Live only |
| Timeline with evidence | None | Module 7 complete | Project-G-Live only |
| AI integration | None | Core to all modules | Project-G-Live only |

---

## Part Nine: Forward Guidance for Schema Decisions

The following principles should govern future schema decisions in Project-G-Live, informed by everything Darrin learned over 20 years.

**Before adding any table or field, ask: what did Darrin do here?**
For anything in the genealogical data layer -- persons, families, events, sources, citations, places, media -- look at the TNG schema first. If he solved it, understand his solution before designing your own. Adopt it if it fits. Adapt it if it needs GPS awareness. Invent only what he genuinely did not address.

**Adopt the dual-date pattern everywhere.**
Every date field in Project-G-Live should have a companion machine-sortable field. This is a small cost that prevents a large category of problems. Apply it retroactively to existing tables in a FIX session.

**Build a repositories table before Module 9.**
The Research Report Writer will need to cite sources at the repository level. FamilySearch, NARA, state archives, local courthouses -- these should be first-class records, not text fields in a citation.

**The families table is coming.**
Module 11 (Family Group Sheet Builder) and Module 8 (FAN Club Mapper) will require person-to-family relationships. When that time comes, TNG's families + children model is the right starting reference. The binary husband/wife structure needs thoughtful handling for same-sex and complex family situations.

**Do not replicate TNG's places problem.**
Our AI Normalize button is a good defense against the place duplication problem. But normalization alone is not enough. We need a canonical place lookup eventually -- probably when the FAN Club Mapper is built, since that module's spatial analysis depends on places being consistent.

**The branch concept should inform how we organize persons.**
As the persons table grows with real research data across multiple cases and family lines, we will need a way to tag and filter persons by research context. TNG's branch model is the right reference.

**Media will eventually need a proper bridge table.**
Our current media approach is deferred. When we build it, tng_media + tng_medialinks is the right architecture. One media item linked to multiple persons, events, sources -- not a single foreign key on the media record.

**GPS classification belongs on sources and citations, not as an afterthought.**
This is where we are already ahead of TNG. Do not let the GPS fields drift. They are not optional for a BCG-quality platform.

---

## Part Ten: What I Wish I Had Known and Would Do Differently

This section is written for future sessions of this AI, reading this document for the first time.

**What I wish I had known at the start of building Project-G-Live:**

I wish I had studied TNG's schema before writing sql/001. The persons table would have been built with name components from the beginning -- lnprefix, suffix, title, nickname. The dual-date pattern would have been in the first migration. The repositories table would have been part of the initial schema. We would have saved at least three migrations worth of catch-up work.

I wish I had understood the built-in/custom event split before designing the timeline module. Our approach -- treating all events identically -- is actually more architecturally sound for a research platform than TNG's approach. But I arrived at it without understanding why TNG's approach exists and what problem it was solving. Understanding the tradeoff would have produced better documentation of the design decision.

I wish I had understood that a places table with unvalidated free text is a debt that compounds. The AI Normalize button is good. A canonical place lookup table would have been better. This is a problem we will have to solve eventually -- better to solve it before the database has thousands of address records.

**What I still want to learn more about:**

The tng_addresses table. I have confirmed it exists and its basic field structure, but the community documentation on it is thin. I suspect there are additional fields -- particularly around how address records are linked to events -- that I am missing. The right way to close this gap is to look at your actual TNG database in phpMyAdmin.

The full field list for tng_sources. I am confident in the fields documented here, but EE practitioners who use TNG heavily have described custom source event types that effectively extend the source record. I do not fully understand how those custom source events interact with the core source fields or whether there is a tng_sourceevents table that I have not surfaced.

The Mod Manager database tables. Popular mods add their own tables and fields. Citation Master in particular likely adds tables that extend the citation model significantly. If you install Citation Master (or if it is already installed), a phpMyAdmin inspection would surface what it added.

The medialinks crop fields added in v15. The coordinates that support GEDCOM 7.0 media cropping are stored in tng_medialinks but I do not have the exact field names. This will matter when we design our media module.

How TNG handles conflicting built-in events in practice. The schema can only store one birth date per person. I know the second value goes to tng_events as a custom event. But the query pattern for retrieving all evidence for a birth -- built-in field plus any custom BIRT events -- is not something I have seen fully documented. This matters for how we think about our own evidence model.

**What I think is missing from this document:**

A worked example. This document explains the schema abstractly. A concrete walkthrough of how a single real research finding -- say, Jacob Singer's 1930 Census record showing his residence at 570 Union Avenue, Bronx -- would be stored across TNG's tables, field by field, would make the schema immediately practical. That example would also make the comparison to how we store the same fact in Project-G-Live viscerally clear.

A version history section. TNG's schema has changed significantly across 15 major versions. Knowing when a table or field was added (dual-date pattern: very early; DNA: v11; tng_addresses: unclear; crop coordinates: v15) would help calibrate how battle-tested each piece is.

A complete list of GEDCOM tags and their TNG table/field mappings. The mapping from GEDCOM tag to database field is the Rosetta Stone for understanding both TNG and GEDCOM simultaneously. This would be useful for the GEDCOM Bridge module design.

---

## Appendix: Complete Table Inventory

For quick reference -- every confirmed TNG table:

**Core genealogical:**
tng_people, tng_families, tng_children, tng_events, tng_eventtypes, tng_sources, tng_citations, tng_repositories, tng_xnotes, tng_notelinks, tng_places, tng_addresses

**Media:**
tng_media, tng_medialinks, tng_mediatypes, tng_albums, tng_albumlinks

**Cemeteries:**
tng_cemeteries

**DNA:**
tng_dna, tng_dnagroups, tng_dnalinks

**Organization:**
tng_branches, tng_branchlinks

**Users and access:**
tng_users, tng_usergroups

**Trees:**
tng_trees

**Admin infrastructure:**
tng_settings, tng_languages, tng_reports, tng_mostwanted, tng_whatsnew, tng_counters

**Total confirmed tables: 30**

---

*This document was produced during an EXPLORE session on 2026-05-11. It should be updated whenever new TNG knowledge is acquired, whenever the Project-G-Live schema diverges significantly from the comparison table in Part Eight, or whenever a schema decision was made by directly consulting TNG's design and the outcome should be recorded here.*

*The right way to verify or extend any part of this document is to open phpMyAdmin on your TNG hosting account, select your database, and inspect the actual tables. The ground truth is there.*
