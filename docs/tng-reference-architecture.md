# TNG: A Reference Architecture Analysis for Project-G-Live

**Document type:** Reference thesis  
**Author:** Claude (Anthropic), working with Dave Wilbur  
**Original TIMESTAMP:** 2026-05-11 06:30 UTC  
**Corrections TIMESTAMP:** 2026-05-11 08:00 UTC  
**Version:** 1.1  
**Location in repo:** /docs/tng-reference-architecture.md  
**Status:** Living document -- update when new TNG knowledge is acquired or schema gaps are identified

---

## A Note on Research Method

Version 1.0 of this document was produced through web research. The TNG wiki blocks direct fetches, so the schema was reconstructed from SQL examples, forum posts, and change logs spanning versions 7-15. It was accurate at the table level but had gaps and errors at the field level.

**Version 1.1 is based on direct inspection of the actual TNG database** -- a full SQL export (CREATE TABLE statements + data) from the running KleinSinger installation. Every correction and addition in the section below comes from the real schema.

The database is: `papebblq_tng`, MariaDB 11.4.10, TNG v15, tree ID: `KleinSinger`.

---

## VERSION 1.1 CORRECTIONS AND ADDITIONS

This section documents everything the direct database inspection revealed that differs from v1.0. Read this section before reading the main body.

### New tables (7 tables not in v1.0; total is now 37, not 30)

**`tng_associations`** -- Person-to-person non-family associations. Fields: assocID, gedcom, personID, passocID (the associated person), reltype (char: witness, godparent, employer, etc.), relationship (description text). This IS the FAN Club concept built into TNG's core. Directly relevant to our FAN Club Mapper (Module 8).

**`tng_image_tags`** -- A SEPARATE table from tng_medialinks for clickable photo regions. Fields: ID, mediaID, rtop, rleft, rheight, rwidth, gedcom, linktype, persfamID, label. The region-tagging system is more architecturally separated than v1.0 described.

**`tng_timelineevents`** -- NOT person events. A completely separate table for historical world context events shown on person timelines (World War II, the Depression, etc.). Fields: tleventID, evday, evmonth, evyear (varchar), endday, endmonth, endyear, evtitle, evdetail. A clever feature not in GEDCOM.

**`tng_albumplinks`** -- Distinct from tng_albumlinks. tng_albumlinks = media IN an album. tng_albumplinks = album linked TO a person or family. Fields: alinkID, gedcom, linktype, entityID, eventID, albumID, ordernum. Two directions of the relationship, two tables.

**`tng_countries`** -- Simple country lookup table for address form dropdowns. Field: country varchar(64) PK.

**`tng_states`** -- Simple state/province lookup table.

**`tng_saveimport`** -- Tracks GEDCOM import progress so large files can resume if interrupted. Stores filename, record counts, file offsets, and import parameters.

Additional admin infrastructure: `tng_temp_events` (import staging), `tng_templates` (template configuration).

---

### Key field-level corrections

**tng_people -- significant additions confirmed:**
- `altbirthdate / altbirthdatetr / altbirthplace / altbirthtype` -- a second birth event slot. altbirthtype stores the event type (BAPM, CHR, etc.). Darrin's partial answer to conflicting birth data: not a full solution but better than v1.0 described.
- LDS ordinance fields (each with full dual-date pattern): `baptdate/baptdatetr/baptplace`, `confdate/confdatetr/confplace`, `initdate/initdatetr/initplace`, `endldate/endldatetr/endlplace`
- `famc` -- direct FK varchar to the person's primary family-as-child. Performance denormalization for quick navigation.
- `metaphone` -- phonetic search index (Soundex variant).
- `prefix` -- name prefix (Mr., Mrs., Dr.) SEPARATE from `lnprefix` (van, de, von).
- `nameorder` -- for patronymic and non-Western naming cultures.
- `changedby`, `edituser`, `edittime` -- full audit trail.
- `changedate` is a proper `datetime NOT NULL`, NOT a varchar. v1.0 was wrong about this.

**tng_events -- corrections:**
- `info` is `text NOT NULL`, NOT varchar(255). v1.0's stated "255 character limitation" does not exist. The field can hold as much as needed.
- `age` -- age of person at time of event.
- `agency` varchar(120) -- institution involved (hospital, school, etc.).
- `parenttag` -- for GEDCOM hierarchical record structure.

**tng_citations -- additions confirmed:**
- `quay` varchar(2) -- GEDCOM quality assessment: 0=unreliable, 1=questionable, 2=secondary, 3=direct/primary. A primitive evidence quality rating. Not GPS-classified but not nothing.
- `description` text -- additional description field (often left blank).
- `citedate` varchar(50) + `citedatetr` date -- dual date pattern on citations.
- `ordernum` float -- display ordering for multiple citations on one event.
- `page` and `citetext` are both `text NOT NULL`, not varchar -- can hold more than expected.

**tng_sources -- corrections:**
- `type` varchar(20) EXISTS -- v1.0 incorrectly said there was no source type field. It stores values like CENSUS, BOOK, etc. Not GPS-classified but a type is captured.
- `shorttitle` text -- short title for inline citation references.
- `other` text -- additional publication info field.
- `repoID` (not `repo` as v1.0 said) -- FK varchar(22) to tng_repositories.
- `changedby` confirmed.
- `changedate` is `datetime NOT NULL`, not varchar.

**tng_children -- additions:**
- `frel` varchar(20) -- father relationship (natural, adopted, step, foster).
- `mrel` varchar(20) -- mother relationship.
- `sealdate / sealdatetr / sealplace` -- LDS sealing ordinance fields.
- `parentorder` -- ordering of this family among multiple parent families for one person.

**tng_families -- additions:**
- `status` varchar(20) -- relationship status.
- `sealdate / sealdatetr / sealplace` -- LDS temple sealing fields.
- `husborder / wifeorder` tinyint -- marriage order for people with multiple marriages.
- `changedby`, `edituser`, `edittime` -- audit trail.
- `changedate` is `datetime NOT NULL`.

**tng_dna_tests -- v1.0 massively undersold this table:**
The actual table name is `tng_dna_tests` (not `tng_dna`). And it has full segment-level atDNA data built in -- not just test metadata. Key fields v1.0 missed:
- `shared_cMs` varchar(10) -- total shared centimorgans with this match
- `shared_segments` varchar(10) -- number of shared segments
- `chromosome` varchar(4) -- largest segment chromosome
- `segment_start / segment_end / centiMorgans / matching_SNPs` -- actual segment data
- `x_match` varchar(2) -- X chromosome match flag
- `GEDmatchID` varchar(30) -- GEDmatch kit number
- `relationship_range`, `suggested_relationship`, `actual_relationship`, `related_side` -- relationship tracking
- `mtdna_haplogroup` and `ydna_haplogroup` -- separate fields (not one combined)
- `significant_snp`, `terminal_snp` -- SNP marker fields
- `y_results`, `hvr1_results`, `hvr2_results` -- actual result strings
- `surnames` text -- surnames associated with the match
- `MD_ancestorID`, `MRC_ancestorID` -- paternal/maternal ancestor IDs
- Various display flags: `markeropt`, `notesopt`, `linksopt`, `surnamesopt`, `private_dna`, `private_test`
- `admin_notes` -- admin-only notes
- `medialinks` -- media links for this test

This is more sophisticated than the summary in Part Six ("no cM values, no clustering"). Darrin built cM and segment data in. Clustering is still absent but the raw data is there.

**tng_repositories -- simpler than v1.0 described:**
Fields: ID, repoID, reponame, gedcom, `addressID` (FK to tng_addresses), changedate, changedby. That is all. No direct address fields -- those live in tng_addresses, linked by addressID. Clean separation.

**tng_places -- additions:**
- `temple` tinyint -- LDS temple flag.
- `geoignore` tinyint -- exclude this place from geocoding.
- `changedby` -- audit trail.
- Longitude/latitude are stored as varchar, not decimal. Historical coordinates are often imprecise strings.

**tng_medialinks -- confirmed fields:**
- `linktype` char(1) -- I, F, S, R, or P (Individual, Family, Source, Repository, Place).
- `altdescription`, `altnotes` text -- alternative description/notes specific to this link (not the media item itself).
- `dontshow` tinyint -- hide this link from public display.
- Crop fields confirmed: `cleft`, `ctop`, `cwidth`, `cheight` smallint -- v15 GEDCOM 7.0 crop coordinates.

**tng_users -- much more granular than v1.0 described:**
Individual permission flags (not just role-based): `allow_edit`, `allow_add`, `tentative_edit`, `allow_delete`, `allow_lds`, `allow_ged`, `allow_pdf`, `allow_living`, `allow_private`, `allow_private_notes`, `allow_private_media`, `allow_profile`. Plus: `personID` (links user to their own tree record), `password_type`, full contact info fields, `dt_registered`, `dt_activated`, `dt_consented` (GDPR-aware timestamps), `no_email`, `reset_pwd_code`.

**tng_trees -- additional fields:**
Owner contact fields (email, address, city, state, country, zip, phone), `disallowgedcreate`, `disallowpdf` (disable GEDCOM/PDF export), `lastimportdate`, `importfilename`.

---

### Corrected table count
**37 confirmed tables** (not 30 as v1.0 stated). See updated Appendix.

---

### Things v1.0 got right that the real schema confirms
- Composite PKs throughout: (gedcom + recordID) confirmed on every core table.
- Dual-date pattern: confirmed on every date field including tng_citations and tng_families.
- tng_addresses field structure: exactly as documented.
- tng_branches with multi-branch support: confirmed.
- tng_eventtypes with I/F/R type field: confirmed. The KleinSinger tree has 108 event types including custom newspaper articles, naturalization stages, and obituaries.
- tng_people living and private flags: confirmed.
- Bridge table pattern for media: confirmed and extended.

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

What follows is the table inventory organized by domain, with field-level detail as documented in v1.0. Read the VERSION 1.1 CORRECTIONS section above for field-level additions and corrections.

---

### DOMAIN 1: People and Families

#### tng_people

The central individual record. One row per person per tree.

Core name fields: personID (varchar, e.g. "I0001"), gedcom (tree ID, composite PK), firstname, lastname, lnprefix (surname prefix: van/de/von), suffix, title, prefix (name prefix: Mr./Mrs. -- SEPARATE from lnprefix), nickname, sex (M/F/U), nameorder (for patronymic cultures), metaphone (phonetic search index).

Status flags: living (tinyint), private (tinyint).

Audit trail: changedate (datetime NOT NULL -- confirmed proper timestamp), changedby, edituser, edittime.

Navigation: famc (varchar FK to primary family-as-child).

**Built-in event fields (dual-date pattern on all):** birthdate/birthdatetr/birthplace, altbirthdate/altbirthdatetr/altbirthplace/altbirthtype (second birth event slot), deathdate/deathdatetr/deathplace, burialdate/burialdatetr/burialplace/burialtype, cause (cause of death), addressID (FK to tng_addresses).

**LDS ordinance fields (all with dual-date pattern):** baptdate/baptdatetr/baptplace, confdate/confdatetr/confplace, initdate/initdatetr/initplace, endldate/endldatetr/endlplace.

branch (varchar 512 -- legacy single-branch field; multi-branch via tng_branchlinks).

**Design note:** The dual-date pattern (human-readable + machine-sortable date) is confirmed on every date field throughout the entire database. This is the correct solution to the genealogical date problem and we should adopt it everywhere in Project-G-Live.

**Project-G-Live relevance:** Our persons table is significantly thinner. Missing: name components (lnprefix, suffix, title, prefix, nickname), sex, living flag, private flag, dual-date pattern on all dates, the altbirthdate mechanism, LDS fields (not needed), addressID reference. The dual-date pattern is the highest-priority gap to close.

---

#### tng_families

Family unit linking spouses and children. One row per family per tree.

Fields: familyID, gedcom (composite PK), husband (personID FK, nullable), wife (personID FK, nullable), status, living, private, branch, changedate (datetime), changedby, edituser, edittime. husborder/wifeorder (marriage sequence for people with multiple marriages).

Built-in events (all dual-date): marrdate/marrdatetr/marrplace, marrtype, divdate/divdatetr/divplace.

LDS fields: sealdate/sealdatetr/sealplace.

**Project-G-Live relevance:** We do not have a families table. Modules 8 and 11 will require it. This model is the right starting reference.

---

#### tng_children

Bridge table: person to family as child. One row per child-family relationship.

Fields: ID, gedcom, familyID (FK), personID (FK), frel (father relationship: natural/adopted/step/foster), mrel (mother relationship), sealdate/sealdatetr/sealplace (LDS), haskids (denormalized flag for ">" display), ordernum (birth order within family), parentorder (sequence of families for this child).

---

### DOMAIN 2: Events

#### tng_events

All non-built-in events. One row per event per person/family.

Fields: eventID (auto-increment), gedcom, persfamID (overloaded FK: personID, familyID, or repositoryID), eventtypeID (FK to tng_eventtypes), eventdate (varchar, free text), eventdatetr (date, sortable), eventplace (text), info (text NOT NULL -- no length cap), age, agency (varchar 120 -- institution involved), cause, addressID (FK to tng_addresses), parenttag.

**Design note:** info is TEXT, not varchar. No 255-character cap. v1.0 was wrong about this limitation.

**Design note:** To get all events for a person you need two queries: one to tng_people for built-in fields, one to tng_events for everything else. This is the primary complexity of working with TNG event data.

---

#### tng_eventtypes

Controlled vocabulary for event types. 108 types in the KleinSinger tree.

Fields: eventtypeID (auto-increment), tag (GEDCOM tag: RESI, OCCU, IMMI, EVEN, BIRT, DEAT, etc.), description (optional subcategory), display (human label), keep (import flag), collapse (UI flag), ordernum, ldsevent (LDS flag), type (I/F/R -- Individual/Family/Repository scope).

**Note from real data:** The KleinSinger eventtypes include granular custom newspaper article types (each obituary or announcement is its own eventtype), naturalization stages (Declaration, Petition, Oath, Certificate, Deposition), and arrival/departure events. This shows how the eventtype catalog accumulates from GEDCOM import of desktop genealogy programs that categorize their events granularly.

---

### DOMAIN 3: Sources, Citations, and Repositories

#### tng_sources

Master source record. One row per distinct source.

Fields: ID, gedcom, sourceID (varchar, e.g. "S0001"), type (varchar 20 -- source type IS captured, though not GPS-classified), title (text), author (text), publisher (text), callnum, other (text -- additional info), shorttitle (text -- for inline citations), actualtext (text -- verbatim source text), comments (text, admin only), repoID (varchar FK to tng_repositories), changedate (datetime), changedby. Also: private.

**Design note:** tng_sources has 474 source records in KleinSinger. The type field exists but carries import-derived values (CENSUS, etc.), not GPS classifications. The actualtext field is a good concept imperfectly executed -- freeform with no enforcement.

**Project-G-Live relevance:** Our sources table has GPS classification fields TNG lacks. TNG has type and shorttitle fields we don't yet have. Both sides have something to learn.

---

#### tng_citations

Links a source to a specific event for a specific person/family.

Fields: citationID (auto-increment), gedcom, persfamID (overloaded FK), eventID (GEDCOM tag for built-in events; numeric eventID for custom events -- inconsistent), sourceID (FK), ordernum (float -- display order), description (text, often blank), citedate (varchar 50), citedatetr (date -- dual-date on citations), citetext (text NOT NULL), page (text NOT NULL), quay (varchar 2 -- quality: 0=unreliable/1=questionable/2=secondary/3=direct), note (text).

**Design note:** 9,360 citation records in KleinSinger. The quay field is a primitive evidence quality rating -- not GPS-classified but at least an attempt. page and citetext being TEXT means they can hold full citation strings, which some users exploit to store complete EE-style citations in the page field.

**Project-G-Live relevance:** Our citation model is structurally richer (GPS classification, EE structure, inline footnotes). TNG's quay field is worth noting as a primitive precursor to what we're doing properly.

---

#### tng_repositories

Where sources are held. Fields: ID, repoID (e.g. "R0001"), reponame (varchar 90), gedcom, addressID (FK to tng_addresses -- address details live there, not here), changedate (datetime), changedby.

**Design note:** Simpler than v1.0 described. No direct address fields -- clean delegation to tng_addresses. We should build our repositories table with this same clean separation.

---

### DOMAIN 4: Notes

#### tng_xnotes
Note content. Fields: ID, noteID (varchar -- the GEDCOM note ID), gedcom, note (longtext). The noteID confirms these are proper GEDCOM objects with their own identifier.

#### tng_notelinks
Bridge table connecting notes to objects. Fields: xnoteID (FK), gedcom, persfamID, eventID, subtype.

---

### DOMAIN 5: Places

#### tng_places

Accumulating place lookup. 610 place records in KleinSinger.

Fields: ID, gedcom, place (varchar 248, UNIQUE per tree -- one record per unique string), longitude (varchar), latitude (varchar -- stored as strings, not decimal), zoom (tinyint), placelevel (tinyint: 1=country through 5=neighborhood), temple (tinyint -- LDS flag), geoignore (tinyint -- exclude from geocoding), notes (text), changedate (datetime), changedby.

**Design note:** The UNIQUE constraint on (gedcom, place) is important -- it enforces one record per unique string, preventing exact duplicates. But "Brooklyn, NY" and "Brooklyn, New York" are different strings and get two records. This is the duplication problem.

**Project-G-Live relevance:** Our Address-as-Evidence approach is architecturally superior for research. The geoignore flag is worth having -- a way to mark a place as intentionally un-geocoded.

---

### DOMAIN 6: Media

#### tng_media
Master media record. Fields: mediaID (auto-increment), mediatypeID (collection name), gedcom, path, thumbpath, description, notes, owner (credit), date (free text), width, height, aliveyn, private, cemeteryID (FK for headstones), plot, status (headstone condition), linktocem, changedate, changedby.

#### tng_medialinks
Bridge table. Fields: medialinkID, gedcom, linktype (char 1: I/F/S/R/P), personID (overloaded -- contains any object ID), eventID, mediaID (FK), altdescription (text), altnotes (text), ordernum (float), dontshow (tinyint), defphoto (varchar 1 -- default photo flag), cleft/ctop/cwidth/cheight (smallint -- v15 crop coordinates confirmed).

#### tng_mediatypes
Media collection registry. Defines folder paths, display names, icons for each collection type.

#### tng_image_tags (new in v1.1)
Clickable photo region tags. Fields: ID, mediaID (FK), rtop/rleft/rheight/rwidth (int -- region coordinates), gedcom, linktype (char 1), persfamID (what the tag links to), label (varchar 64 -- display text). Separate from medialinks -- specifically for interactive region annotation.

#### tng_albums / tng_albumlinks / tng_albumplinks
Albums group media. tng_albumlinks = media IN an album (albumlinkID, albumID, mediaID, ordernum, defphoto). tng_albumplinks = album linked TO a person/family (alinkID, gedcom, linktype, entityID, eventID, albumID, ordernum).

---

### DOMAIN 7: Cemeteries

#### tng_cemeteries
First-class cemetery object. Fields: cemeteryID, gedcom, cemetery (name), place, latitude, longitude, description, notes, changedate.

---

### DOMAIN 8: Associations (new in v1.1)

#### tng_associations
Person-to-person non-family associations. Fields: assocID (auto-increment), gedcom, personID (the primary person), passocID (the associated person), reltype (char 1 -- relationship type code), relationship (varchar 75 -- description).

**This is the FAN Club mechanism.** Witnesses on legal documents, godparents, employers, neighbors, colleagues -- all representable. The reltype char likely encodes W (witness), G (godparent), etc. though the values are application-defined.

**Project-G-Live relevance:** Our FAN Club Mapper (Module 8) needs to represent these non-family person connections. TNG solved this problem. Consult this table design when building Module 8.

---

### DOMAIN 9: DNA

#### tng_dna_tests (table name correction from v1.0)

Full atDNA match records with segment data. This table is far more capable than v1.0 described.

Basic fields: testID (auto-increment), gedcom, test_type (yDNA/mtDNA/atDNA/X-DNA), test_number, vendor, test_date (date), person_name (for testers not in the database), personID (FK if in the database), urls (text), notes (text), admin_notes (text), private_dna, private_test.

Haplogroup fields: mtdna_haplogroup, ydna_haplogroup, significant_snp, terminal_snp, mtdna_confirmed, ydna_confirmed.

Raw results: y_results (varchar 512 -- STR markers), hvr1_results, hvr2_results (mtDNA HVR regions), markers, ref_seq, xtra_mut, coding_reg.

Match-specific fields: match_date (date), GEDmatchID, relationship_range, suggested_relationship, actual_relationship, related_side, shared_cMs, shared_segments.

Segment data: chromosome, segment_start, segment_end, centiMorgans, matching_SNPs, x_match.

Display options: markeropt, notesopt, linksopt, surnamesopt. Also: surnames (text -- surnames of match), medialinks, MD_ancestorID (maternal descent ancestor), MRC_ancestorID (most recent common ancestor), dna_group, dna_group_desc.

**Project-G-Live relevance:** TNG has more DNA infrastructure than v1.0 gave it credit for. The segment fields (chromosome, cM, start/end) are particularly relevant to our DNA Evidence Tracker (Module 14). Darrin did not solve clustering but the raw data is all there. Use tng_dna_tests as the starting reference for our DNA schema design.

#### tng_dna_groups
DNA test groupings. Fields: dna_group (varchar PK -- group name), test_type, gedcom, description, action.

#### tng_dna_links
Links DNA tests to people. Fields: ID, testID (FK), personID (FK), gedcom, dna_group.

---

### DOMAIN 10: Branches

#### tng_branches
Named tree subsets. Fields: branch (varchar 20, PK with gedcom), gedcom, description, personID (root person for generation counting), agens/dgens/dagens (ancestor/descendant/day generation counts), inclspouses (tinyint), action (tinyint -- how to build the branch).

**KleinSinger branches:** KleinRipner, SchwartzGreenberg, SingerJacobs, TeitelbaumHalfinger. Exactly the family lines you're researching.

#### tng_branchlinks
Bridge: person/family to branch. Fields: ID, branch, gedcom, persfamID.

---

### DOMAIN 11: Addresses

#### tng_addresses
Structured address. Fields: addressID (auto-increment), address1, address2, city, state, zip, country, www, email, phone, gedcom.

**Design note:** No source citation, no date range, no record origin. This is what our addresses table would have been if we'd stopped at "it has structure." Our Address-as-Evidence principle takes it further in exactly the right direction.

---

### DOMAIN 12: Timeline Context (new in v1.1)

#### tng_timelineevents
Historical world events for contextual display on person timelines. NOT person events. Fields: tleventID, evday, evmonth, evyear (varchar), endday, endmonth, endyear, evtitle, evdetail (text).

**Project-G-Live relevance:** Our Timeline Builder (Module 7) could benefit from this concept -- showing "World War II" or "Great Depression" as context bands on a person's timeline. Worth considering as a future enhancement.

---

### DOMAIN 13: Users and Permissions

#### tng_users
Full user account and fine-grained permission control.

Fields: userID, description (account label), username, password (sha256 hash), password_type, gedcom (trees accessible), mygedcom (default tree), personID (links to this user's tree record), role.

Individual permission flags: allow_edit, allow_add, tentative_edit (edits require approval), allow_delete, allow_lds, allow_ged (GEDCOM export), allow_pdf, allow_living (see living data), allow_private (see private records), allow_private_notes, allow_private_media, allow_profile.

Contact info: realname, phone, email, address, city, state, zip, country, website.

Session/auth: languageID, lastlogin (datetime), disabled, reset_pwd_code.

GDPR timestamps: dt_registered, dt_activated, dt_consented.

Misc: branch (user scoped to one branch), no_email (opt-out), notes.

**Design note:** The granular per-flag permission system is more sophisticated than a simple role system. In the KleinSinger installation, Rachel (rachelsanda) has custom permissions: allow_edit=1, allow_add=1, allow_delete=0, allow_living=1, allow_private=1.

---

### DOMAIN 14: Trees

#### tng_trees
Tree registry. Fields: gedcom (PK -- the tree ID used throughout), treename, description, owner, email, address, city, state, country, zip, phone, secret (tinyint -- hidden tree), disallowgedcreate (tinyint), disallowpdf (tinyint), lastimportdate (datetime), importfilename.

**Note:** The KleinSinger tree's last import was 2025-11-14 from `cynthia_klein_ancestors_descendents_only_2025-11-14.ged`.

---

### DOMAIN 15: Admin Infrastructure

tng_settings (configuration key-value store), tng_languages (language packs), tng_reports (saved SQL queries), tng_mostwanted (priority research list), tng_countries (country dropdown lookup), tng_states (state/province dropdown lookup), tng_saveimport (GEDCOM import progress tracking), tng_temp_events (import staging), tng_templates (template configuration).

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

**The dual-date pattern.**
Storing a human-readable date alongside a machine-sortable version is the correct solution to the genealogical date problem. Confirmed throughout every table. We should adopt this pattern everywhere in Project-G-Live.

**The composite primary key for multi-tree support.**
The (gedcom + recordID) composite key pattern is confirmed on every core table. Architecturally sound for any application that might eventually need to isolate multiple independent datasets.

**The event type catalog.**
The tng_eventtypes controlled vocabulary is confirmed and active -- 108 event types in KleinSinger, including custom naturalization stages and newspaper article categories. We should add an explicit eventtypes reference table to our timeline_events.

**The bridge table pattern for media links.**
Confirmed in tng_medialinks and extended with image tagging in tng_image_tags. One media item to many objects, cleanly.

**Repositories as first-class objects.**
Confirmed. Simple, clean, with address details delegated to tng_addresses. We should build our repositories table before Module 9.

**The branches concept.**
Confirmed and active in KleinSinger: KleinRipner, SchwartzGreenberg, SingerJacobs, TeitelbaumHalfinger -- exactly the research lines we're working. This is the right pattern for organizing persons by research context.

**The associations table.**
tng_associations is the FAN Club concept solved. Person-to-person non-family links with a type and description. We should reference this when building Module 8.

**The "What's New" pattern.**
A log of recent database additions. We do not have this.

**The cemetery as distinct from the burial place.**
Same insight as Address-as-Evidence. Confirmed in tng_cemeteries.

**The altbirthdate mechanism.**
Darrin's partial answer to the conflicting birth event problem. Not as clean as treating all events equally, but shows awareness of the problem.

---

## Part Six: What TNG Got Wrong or Left Incomplete

**The tng_addresses underutilization.**
Confirmed: no source citation, no date range, no record origin. Exactly the gap our Address-as-Evidence principle fills.

**Citations are too thin.**
Confirmed: quay (quality 0-3) is a primitive evidence rating. page and citetext are the only content fields beyond metadata. Not enough for EE-compliant practice.

**The tng_places duplication problem.**
Confirmed: 610 place records in KleinSinger with no controlled vocabulary. The UNIQUE constraint prevents exact duplicates but "Brooklyn, NY" and "Brooklyn, New York" are different strings.

**Notes have no type.**
Confirmed: one text field, no structural distinction between transcription and observation.

**Sources have no GPS classification.**
The type field (varchar 20) exists but is not GPS-classified. No original/derivative/authored distinction.

**DNA lacks clustering.**
The segment data is there (cM, chromosome, start/end) but there is no clustering mechanism, no tree-based reasoning layer, no endogamy handling.

**The changedate inconsistency (corrected in v1.1).**
v1.0 said changedates were varchar strings. The actual schema uses proper `datetime NOT NULL` on most tables. This is actually better than v1.0 described.

---

## Part Seven: The GPS Gap

GPS stands for the Genealogical Proof Standard. Its five elements: reasonably exhaustive search, complete and accurate citations, analysis of each source and its information and evidence, resolution of conflicting evidence, and a soundly reasoned written conclusion.

TNG has no awareness of GPS. The quay field on tng_citations is the closest thing -- a 0-3 quality score with no methodology behind it.

What TNG cannot do that Project-G-Live is designed to do:
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
- Generate BCG-quality research reports or correspondence logs

This gap is not a flaw in TNG. It reflects a completely different design goal. TNG is a publication and collaboration tool. Project-G-Live is a research methodology enforcement and documentation platform.

---

## Part Eight: TNG vs Project-G-Live -- Direct Comparison

| Domain | TNG | Project-G-Live | Assessment |
|--------|-----|----------------|------------|
| Persons | Rich: name components, dual dates, altbirth, living/private, LDS fields | Thin: basic name fields, birth/death year | TNG significantly ahead |
| Families | Full: husband/wife/children, marriage orders, LDS sealing | Not yet built | TNG only |
| Events | Sophisticated: built-in + type catalog, dual dates, address reference, TEXT info field | Module 7, improving | TNG ahead on structure; we ahead on Address-as-Evidence |
| Associations | Built-in: tng_associations for FAN club links | Not yet built | TNG only |
| Sources | type field exists but not GPS-classified | Rich: full GPS classification, EE fields, Three-Layer analysis | Project-G-Live significantly ahead |
| Citations | quay quality field, thin content | Rich: full EE structure, inline footnotes, GPS-linked | Project-G-Live significantly ahead |
| Repositories | First-class, delegates address to tng_addresses | Not yet built | TNG only |
| Places | Accumulating string table, UNIQUE constraint, geocoding | First-class address table, AI normalization | Different; ours better for research |
| Media | Excellent: bridge table, image tags, crop support, albums | Deferred | TNG significantly ahead |
| DNA | Full segment data (cM, chromosome, start/end), group matching | Module 14 not yet built | TNG ahead on raw data; both lack clustering |
| Branches | Named subsets, confirmed in use | Not yet built | TNG only |
| Timeline context | tng_timelineevents for historical context | Not yet built | TNG only |
| GPS workflow | None (quay is a primitive precursor) | Core purpose: Modules 2-10, 15-16 | Project-G-Live only |
| Research log | None | Module 3 complete | Project-G-Live only |
| Proof arguments | None | Module 10 complete | Project-G-Live only |
| Conflict resolution | None | Module 6 complete | Project-G-Live only |
| Research planning | None | Module 2 complete | Project-G-Live only |
| AI integration | None | Core to all modules | Project-G-Live only |

---

## Part Nine: Forward Guidance for Schema Decisions

**Before adding any table or field, ask: what did Darrin do here?**
For anything in the genealogical data layer, look at TNG first. Adopt if it fits. Adapt if it needs GPS awareness. Invent only what he genuinely did not address.

**Adopt the dual-date pattern everywhere.**
Confirmed throughout TNG's entire schema. Apply retroactively in a FIX session.

**Build a repositories table before Module 9.**
Confirmed pattern: simple, with address details in tng_addresses via addressID FK.

**Build tng_associations equivalent before Module 8.**
The FAN Club Mapper needs this. TNG solved it. Use tng_associations as the reference.

**The families table is coming.**
Modules 8 and 11 will require it. TNG's families + children model with frel/mrel for non-biological relationships is the right reference.

**Consider tng_timelineevents for Module 7 enhancement.**
Historical world events as context on person timelines. Not in our current design. Worth adding.

**Do not replicate TNG's places problem.**
AI Normalize is good. Canonical place lookup will be needed when the FAN Club Mapper is built.

**The branch concept should inform person organization.**
Confirmed active in KleinSinger with exactly our four research family lines. Reference tng_branches when we need to filter persons by research context.

**Media needs a proper bridge table.**
tng_media + tng_medialinks + tng_image_tags is the right architecture when we build the media module.

**GPS classification belongs on sources and citations.**
Where we are already ahead. Do not let GPS fields drift.

---

## Part Ten: What I Wish I Had Known and Would Do Differently

**What I wish I had known at the start:**

I wish I had studied TNG's schema before writing sql/001. The persons table would have been built with name components from the beginning. The dual-date pattern would have been in the first migration. The repositories table would have been part of the initial schema. We would have saved at least three migrations worth of catch-up work.

I wish I had known about tng_associations before designing the FAN Club Mapper concept. Darrin solved this problem already. We should build on his solution, not reinvent it.

I wish I had studied the DNA schema before designing Module 14. tng_dna_tests has segment-level data built in -- more than I gave it credit for in v1.0. Our DNA module should study this table closely before writing a single migration.

**What the v1.1 inspection closed:**

Every gap listed in v1.0's "what I still want to learn" section has now been answered by the direct SQL export. The schema is fully documented for Project-G-Live's purposes. The only remaining unknowns are mod-added tables (Citation Master, etc.) which would only appear if those mods are installed.

**What is still missing from this document:**

A worked example: how Jacob Singer's 1930 Census record would be stored across TNG's tables, field by field, compared to how we store it in Project-G-Live.

A GEDCOM tag to TNG field mapping: the Rosetta Stone for the GEDCOM Bridge module.

A version history: when each table and field was added across TNG's 15 major versions.

---

## Appendix: Complete Table Inventory (v1.1)

**Core genealogical:**
tng_people, tng_families, tng_children, tng_events, tng_eventtypes, tng_sources, tng_citations, tng_repositories, tng_xnotes, tng_notelinks, tng_places, tng_addresses

**Associations (new in v1.1):**
tng_associations

**Media:**
tng_media, tng_medialinks, tng_mediatypes, tng_albums, tng_albumlinks, tng_albumplinks (new in v1.1), tng_image_tags (new in v1.1)

**Cemeteries:**
tng_cemeteries

**DNA (corrected names in v1.1):**
tng_dna_tests, tng_dna_groups, tng_dna_links

**Organization:**
tng_branches, tng_branchlinks

**Users and access:**
tng_users

**Trees:**
tng_trees

**Timeline context (new in v1.1):**
tng_timelineevents

**Admin infrastructure:**
tng_settings, tng_languages, tng_reports, tng_mostwanted, tng_countries (new), tng_states (new), tng_saveimport (new), tng_temp_events (new), tng_templates (new)

**Total confirmed tables: 37**

---

*v1.0 produced 2026-05-11 06:30 UTC via web research.*  
*v1.1 produced 2026-05-11 08:00 UTC via direct SQL export inspection of papebblq_tng (KleinSinger tree, TNG v15, MariaDB 11.4.10, 486 people, 229 families, 474 sources, 9360 citations, 108 event types, 610 places, 3843 media items).*  
*Update this document when schema decisions are made consulting it.*