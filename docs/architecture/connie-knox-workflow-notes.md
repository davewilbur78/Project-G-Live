# Connie Knox Workflow Notes
# Source: Genealogy TV (genealogytv.org / YouTube)
# Purpose: Map Ancestry power-user workflows -> identify gaps this app should fill
# Status: ACTIVE -- appending batch by batch. Do not synthesize until all batches complete.
# Final synthesis target: docs/architecture/app-design-exploration.md

TIMESTAMP started: 2026-05-16 UTC
Posture: EXPLORE

---

## How to Read This File

Each batch section captures:
1. **What Connie teaches** -- the actual Ancestry workflows, summarized
2. **Design signals** -- what each workflow implies for this app's People hub, person page, and navigation

Raw notes only. No design decisions yet. Synthesis happens after all batches are read.

---

## Batch 1 -- Videos 1-8

Source file: genealogy_tv_batch1.md
Data quality: 4 of 8 videos have full YouTube transcripts (high confidence); 4 have article/partial metadata only.

---

### Video 1: Hidden Tools on Ancestry

**Ancestry workflows covered:**
- Private member tree search (parallel database, contact-only access)
- Card Catalog filtered by location + era as a research starting point (preferred over name search)
- All Hints aggregated view -- filter by surname to work one family line at a time
- "Who saved this record" reversal -- find other researchers on the same family
- DNA animated ethnicity timeline (historical estimate changes)

**Design signals:**
- The All Hints filtered-by-surname workflow is essentially a research queue by family line. A People hub filtered/browsed by surname family group would serve a similar function.
- The Card Catalog-first approach is a research planning behavior. The Research Plan Builder should support "what records exist for this location and era" as a planning question.

---

### Video 2: Card Catalog -- 5 Pro Tricks

**Ancestry workflows covered:**
- Location filter to county level; era filter; category filter; keyword search on collection titles; "Learn More" before searching

**Design signals:**
- Collection-first workflow: this app is person-first, which is correct, but the Research Plan Builder should have a field for "what collections are available for this location/era."
- Source records could carry a "collection notes" field for known coverage limitations.

---

### Video 3: Fixing Mistakes on Ancestry Trees

**Ancestry workflows covered:**
- Identifying errors; editing facts with source + note; detaching records; separating merged identities; dismissing hints; correction trail

**Design signals:**
- The correction note maps to the assertions table -- an assertion is not just "X is true" but "X is true because of Y, here is the reasoning."
- "Remove source from this person" vs. "delete this source entirely" -- UI language distinction needed.

---

### Videos 4 and 5: Floating Trees and Connecting Them

**Ancestry workflows covered:**
- Floating tree = hypothesis workspace; naming conventions [RESEARCH], [DNA], [UNVERIFIED]; connection requires 2+ independent sources

**Design signals:**
- Floating tree = Module 16 candidate person concept. Status field should make this distinction visible at a glance.
- The naming convention hacks are a workaround for a missing status field. This app has the real field.

---

### Video 6: Emoji Markers

**Ancestry workflows covered:**
- Emoji in suffix/nickname field as status: brick wall, complete, uncertain, DNA, direct ancestor

**Design signals:**
- Clearest signal that Ancestry lacks a research status system. This app's research_status field replaces all five hacks.
- Status vocabulary: Confirmed, In Progress, Brick Wall, Uncertain, Candidate, DNA Linked.
- Must be visible on person page AND filterable in People hub.

---

### Video 7: Ancestry Profile Makeover

**Ancestry workflows covered:**
- Bio narrative section; fact-level sourcing; hint review; media gallery; alternate names; residence timeline

**Design signals:**
- Bio narrative: person_research_notes panel -- framing matters. "Write for a family history book" not "dump your notes here."
- Fact-level sourcing not yet surfaced on person detail page as a health indicator.
- Media gallery not yet built. Residence timeline exists in timeline_events but may not be presented as a life-movement view.
- Validates the known technical debt on the 87.6% source-wiring figure.

---

### Video 8: Ancestry Networks -- initial coverage

**Design signals:**
- See Videos 9/10 and Video 16 for full coverage. Networks scope is far broader than DNA alone.
- ThruLines = confirmation; Networks = discovery. Informs Module 14 framing.

---

## Batch 2 -- Videos 9-14

Source file: GenealogyTV_Batch2_Videos9-14.md
Data quality: Videos 10, 13, 14 full transcripts. Videos 9, 11, 12 article-based.

---

### Videos 9 and 10: FAN Club + Ancestry Networks (Full Coverage)

**Ancestry workflows covered:**
- FAN Club sources: passenger lists, census neighborhoods (5-10 pages each direction), wedding registries, obituaries, land records (adjoining owners), military units/journals, probate inventories (estate sale buyer lists)
- Census-to-Excel pipeline: Ctrl+A, Paste Special as Text, image number column, filter by surname/gender
- AI cross-reference: upload Excel files to ChatGPT, find overlapping names across multiple records
- Networks as general-purpose FAN Club system: named groups, any record type as source, people added from any profile

**Design signals:**
- Census-to-Excel is the workflow this app eliminates natively: query persons at the same location + time window. FAN Club Mapper is the SQL-native replacement.
- DNA match lists = digital FAN Club. Bridge between Module 14 and Module 8. DNA match who is also census neighbor is a stronger signal than either alone.
- Probate buyer lists are a Document Analysis Worksheet target -- extract all named buyers as FAN Club candidates.

---

### Video 11: Custom Clusters (Pro Tools)

**Design signals:**
- Custom Clusters = paywalled capability this app offers free: manually define DNA family groups with anchor matches.
- DNA Evidence Tracker should capture cM value and allow filtering by range (20cM threshold matters).

---

### Video 12: RootsTech 2026 New Features

**Key signals:**
- Photo Insights + full document transcription: Ancestry entering Document Analysis Worksheet territory. This app's version produces GPS-compliant structured assertions, not self-contradicting narrative paragraphs.
- Person profile page redesign coming: design this app's person page for what Ancestry will never do, not what it currently shows.
- Ancestry Preserve: physical archive digitization pipeline. Makes Media-as-Unanalyzed-Evidence more urgent.
- Fold3 full-text search: address-as-search-key applied to pension records. Validates foundational principles.

---

### Video 13: 10 Best Tips Part 1

**Design signals:**
- Census extraction workflow detailed -- confirms this app's FAN Club Mapper query is the native replacement.
- SSACI's mother's maiden name especially valuable for Ashkenazi Jewish research.
- Historical context layer: Narrative Assistant should situate ancestors in their world, not just describe their facts.

---

### Video 14: 10 Best Tips Part 2

**Design signals:**
- Floating people don't appear in main pedigree view: People hub needs same clear visual distinction.
- Deduplication guard on add-person: baseline feature, not a Pro Tools upgrade.
- 3-monitor workflow: this app is one window among several. Design for parallel use, not sequential visits.
- FamilySearch Wiki prompt: Research Plan Builder should prompt "have you checked what records exist for this location/era?"

---

## Batch 3 -- Videos 15-16

Source file: batch 3 document + direct URL fetches

---

### Video 15: New Ancestry Updates February 2025

**Key signals:**
- AI record summary contradicted itself in one paragraph: GPS-compliant structured extraction is a genuine differentiator. UI language: "extracted facts" not "AI summary."
- "Also Known As" confirmed by Ancestry staff to NOT feed search. Audit FTM-imported alt_names.
- 1,000-record export cap on Ancestry: this app imposes no such limit.
- Duplicate merge requires Pro Tools: deduplication guard should be baseline here.

---

### Video 16: Ancestry Networks Extended Deep Dive

**Key signals:**
- Full network type taxonomy (Immigration, Religion, Local Community, Military, Enslavement, Atrocity/Displacement, Burial Place, etc.): design vocabulary for Module 8.
- Cross-network filtering: Ancestry cannot do this (Connie explicitly requests it). This app can: SQL set intersection of two networks. Person appearing in both is a stronger lead. Unique differentiator.
- Tags + Networks are complementary layers: per-person status marker AND group container with sources. Both needed.

---

## Batch 4 -- Videos 17-21

Source file: batch 4 document (full transcripts for all five videos)
Data quality: All five videos have full transcripts. High confidence throughout.

---

### Video 17: Research Notes Updated for 2026 -- The Knox Research Notes Method

**Ancestry/workflow covered:**

The Knox Research Notes Method is Connie's most-requested teaching -- described as the single strategy that has resolved more genealogical problems and broken down more brick walls than anything else she teaches. It is a structured Word document (not a database, not a form) maintained per ancestor as a living narrative.

Structure of a Knox Research Notes document:
- Event date in bold at the start of each entry (event date, not the date you found the record)
- Description of what the record shows; key passages transcribed when short enough
- Footnote source citation via Word Insert > Footnote (numbered superscript, citation at page bottom)
- Red text for to-do items and negative evidence (searches that returned nothing)
- Hyperlinks to the ancestor's profile on Ancestry, FamilySearch, WikiTree
- Optionally embedded images (ship photo, record image) for quick visual reference

Negative evidence handled explicitly:
- If a reasonably exhaustive search returned nothing, that gap is documented in red text in its chronological position
- This is a GPS requirement: the absence of expected evidence is itself evidence
- Example: "[1840 census] -- NOT FOUND. Searched [collection name] by name and location. No result."

What Research Notes are NOT:
- NOT a Research Log (which logs research sessions, not findings)
- NOT uploaded to Ancestry or FamilySearch -- it is a living document shared only as a PDF snapshot

Who gets Research Notes:
- All direct-line ancestors get their own file
- Collateral lines get notes when there is a brick wall requiring family cluster research
- Each person in a married couple gets a SEPARATE file (each had a life before and potentially after the marriage)

Filing convention:
- Filename starts with "1" to rise to top of alphabetical lists
- SURNAME in caps, then full name, then "Research Notes", then birth/death years if disambiguation needed
- Women filed under maiden name if known; married name if maiden name not yet identified
- Stored in surname folder within the cloud archive

Profile cleanup on Ancestry runs concurrently:
- Open Ancestry profile alongside research notes (two monitors recommended)
- Identify and remove duplicate records; confirm remaining records have proper citations
- A well-maintained notes document and a clean Ancestry profile develop together

Emoji status in Ancestry Suffix field:
- ✅ complete, 🔵 in progress, 📚 needs archive visit, 🟠 not started
- NOTE: Suffix field only -- not the name or nickname field. Emojipedia.org for copy/paste.

Sharing:
- Never share the working document -- it is always in progress
- Export as PDF at a point in time for sharing with family or submitting with professional work

**Design signals:**

The Knox Research Notes document is this app's person_research_notes -- but with a specific structure and feature set that a plain text field cannot match. The full method requires:

1. Chronological organization by event date (not entry date) -- the notes panel should support date-stamped entries sorted chronologically, not just a free text field
2. Inline source citations linked to the source record -- not just "sources attached to this person" but citation superscripts embedded in the narrative text at the specific claim they support
3. Negative evidence as a first-class entry type -- "searched X, found nothing, date" -- with visual distinction (red in Connie's method; some equivalent in this app)
4. To-do items embedded in the chronological flow -- not in a separate to-do list but inline in the notes at the time period where the gap lives
5. Hyperlinks to other persons in the persons table -- when the notes reference another person, that reference should be a clickable link, not a name that leaves the researcher guessing which record to open
6. Status indicator -- the emoji system becomes this app's research_status field, but also a notes-specific status: has this person's notes been started, are they in progress, are they complete?

"Typing forces attention to details that break down brick walls" -- this is Connie's core claim about WHY the method works. The act of writing a structured narrative forces the researcher to confront gaps and inconsistencies that passive record-viewing misses. This app's AI engines (particularly Fact Extractor, Conversation Abstractor) should support this process -- not replace the writing, but help structure the output once the researcher has done the thinking.

"Filing Wives" -- women filed under maiden name if known. This is a person page display question: when a woman's research notes and timeline span multiple surname identities, the app should surface all identities clearly and the primary display name should reflect the name under which most of the evidence is organized.

Multiple Research Notes simultaneously -- the researcher tracks several people in parallel. The People hub research queue view (filtered by status = In Progress) is the mechanism for managing this multi-person work in flight.

The NOT-a-Research-Log distinction is explicitly stated and matches this app's architecture exactly. This is the third independent signal validating that the two are different tools serving different purposes.

---

### Video 18: New Workflow for 2026 -- Avoiding Disaster (Cloud Archive)

**Workflow covered:**
- Problem: desktop-only archive required manual upload/download before/after each research trip; created diverging file sets
- Solution: OneDrive as cloud-syncing working archive (280+ GB, 15,000+ files); Backblaze retained as separate disaster-recovery backup
- Process: safety snapshot to external drive first; confirm cloud capacity; move (not copy) archive to OneDrive overnight; verify transfer; rename working file; stop using desktop folder
- File name length: OneDrive rejects very long filenames -- a migration issue

**Design signals:**
- The researcher's genealogy archive (including the 3,752 FTM media files) lives in a cloud-synced working archive alongside this app. This is the architecture AGENT.md describes for media import: pull files on demand from the working archive, not just from what Ancestry holds.
- The working archive and the disaster-recovery backup are separate things serving different purposes. This app's role is not to be the archive -- it is to pull from the archive when needed for analysis.
- OneDrive sync means files are accessible on any device: desktop, laptop, phone. This app running in a browser on any device should be able to reach the same data. Relevant to Vercel deployment and mobile responsiveness.

---

### Video 19: New AncestryDNA Tree Feature (Beta, January 2025)

**Feature covered:**
- ThruLines overlay in family tree view: when ThruLines Icons toggled on, clicking an ancestor's mini-profile card shows a button: "Add DNA matches descending from [Ancestor]"
- Opens Descendants View with a side panel grouping DNA cousins by which of the ancestor's children they descend through
- Shows matches already in tree vs. not yet in tree
- Not an import tool -- shows suggested connections based on ThruLines logic; verification still required
- Beta as of January 2025

**Design signals:**
- Researchers want to see DNA evidence in the context of the family tree, not in a separate DNA tab they have to navigate to. The Person Detail page should surface DNA evidence from Module 14 contextually alongside the timeline and family relationships -- not hidden in a dedicated panel that requires deliberate navigation.
- "Matches descended through which child" is a branching visualization. The person page should show which of a person's children are the ancestors of known DNA matches -- a contextual DNA view integrated into the family structure display.
- ThruLines still requires verification: this reinforces that DNA evidence in this app should be framed as leads, not facts, until documented with records.

---

### Video 20: Social Security Records Updated 2025

**Workflow covered:**
Four record types, each providing different information:
- SSDI (Social Security Death Index): SSN, name, birth date, death date, last residence; Ancestry, FamilySearch, MyHeritage
- Applications and Claims Index: may include parents' names; 133M records vs. 94M in SSDI; Ancestry, MyHeritage
- Numident Files (FamilySearch ONLY): richest source -- previous residences, father's name, mother's name, correspondence notes; check this BEFORE requesting SS-5
- SS-5 (original application): mail request to SSA, Form SSA-711, ~$27; may include ancestor's handwriting/signature; parents' names

Social Security number as gold-standard cross-reference identifier -- uniquely links the same individual across all four record types, critical when ancestors share names with children.

Delayed birth certificates: ancestors born before 1909-1920 may have had to obtain one to prove age for SS application. A record type that surfaces via the SS application process.

**Design signals:**
- Source type taxonomy in this app should distinguish these four SS record types explicitly, not treat "Social Security" as one category. Each produces different evidence with different reliability characteristics.
- The SS number, if known, should be a storable field on the person record -- it is a unique cross-reference identifier with research value.
- The Numident file is FamilySearch-exclusive and most researchers don't know it exists. The Research Plan Builder should be able to prompt "have you checked the Numident file for this person?" when a SS number is known or suspected available.
- SSACI's mother's maiden name (reinforced from batch 2): particularly valuable for Ashkenazi Jewish research. Source type notes in the Research Plan Builder should flag this.

---

### Video 21: Find a Grave Tricks and Transfers

**Workflow covered:**
- Assessing whether to request a memorial transfer: manager with 1,000+ memorials = likely volunteer, will transfer; manager with <200 = likely family researcher, may not
- Transfer request via messaging system with specific relationship stated
- Receiving and forwarding transfers via member ID number
- "Leave a Flower" as a visit timestamp -- tracks when you last reviewed a memorial; other flower-leavers may be active family researchers
- Virtual Cemeteries: personal collections of memorials grouped regardless of physical burial location; organize by family surname or actual cemetery
- Cemetery surname search: search within a specific cemetery for all people with a given surname -- surfaces relatives buried nearby you didn't know about

**Design signals:**
- Find a Grave is an external platform; this app doesn't replicate it. But:
  - Burial location in timeline_events could surface a Find a Grave link when the record includes a cemetery name. This is a "jump to the external source" pattern, not replication.
  - Cemetery surname search is the Find a Grave equivalent of the FAN Club Mapper query: given a burial location, who else with relevant surnames is buried there? The timeline_events data, filtered by event_type=burial and location, could power a similar query natively.
  - Virtual Cemeteries as grouped collections by family surname is the same concept as FAN Club networks by burial place -- which maps to the "Burial Place" network category in Ancestry Networks (Video 16).
- "User-generated content, verify with primary records" -- Find a Grave data imported into any system should carry a source quality flag. It is an authored work of unknown reliability, not a primary source.

---

## Pending

- Enhanced Batch 2 re-run: additional detail on Videos 11 and 12 if Perplexity re-runs
- Additional playlist videos beyond Video 21: Perplexity recommends browsing playlist directly for Feb 2025 to present

---

## Synthesis Checklist (complete after all batches)

- [ ] All batches received and appended
- [ ] Cross-batch themes identified
- [ ] Design implications written into app-design-exploration.md
- [ ] connie-knox-workflow-notes.md marked COMPLETE
