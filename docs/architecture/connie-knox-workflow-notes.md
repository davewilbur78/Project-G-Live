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
- The All Hints filtered-by-surname workflow is essentially a research queue by family line. This app has no equivalent view. A People hub filtered/browsed by surname family group would serve a similar function -- letting the researcher work one family at a time rather than jumping person to person.
- "Who saved this record" is Ancestry's collaboration discovery surface. This app has no collaboration layer, which is fine for now, but the underlying behavior (finding other researchers on the same person) is worth keeping in mind for Module 16 (Research Investigation) candidate sourcing.
- The Card Catalog-first approach (browse record types before searching names) is a research planning behavior. The Research Plan Builder (Module 2) should ideally support this mode -- "what records exist for this location and era" as a planning question.

---

### Video 2: Card Catalog -- 5 Pro Tricks

**Ancestry workflows covered:**
- Location filter drilled to county level
- Era / time period filter combined with location
- Category filter (birth/marriage/death, census, military, immigration, newspapers, etc.)
- Keyword search on collection titles (not person names) -- e.g., "Bible," "directory," "naturalization"
- "Learn More" on each collection before searching (coverage, completeness, known gaps)

**Design signals:**
- Connie goes to the Card Catalog BEFORE searching for a person. This is a collection-first, then person-search workflow. This app is entirely person-first. That is correct for what this app is, but it means this app assumes the researcher has already done the collection discovery work on Ancestry. The Research Plan Builder should have a field or prompt for "what collections are available for this location/era" so the researcher can bring that knowledge in.
- "Learn More" -- collection-level metadata (coverage, completeness, limitations) is something researchers need before they search. This app's source citation system does not currently capture this. A future enhancement: source records could carry a "collection notes" field for known limitations.
- The combination of location + era + category as a filtering framework is a strong mental model. This is essentially what the addresses table + timeline_events table together represent for a person -- but presented as a research planning interface.

---

### Video 3: Fixing Mistakes on Ancestry Trees

**Ancestry workflows covered:**
- Identifying errors: age inconsistencies across censuses, impossible relationships, same-name confusion
- Editing facts with source documentation and an explanatory note
- Detaching incorrect records (removes association, does not delete the record)
- Separating merged/confused identities by rebuilding from original sources
- Dismissing incorrect hints permanently ("Ignore" / "Not a Match")
- Research notes as a correction trail -- "why I made this change"

**Design signals:**
- This video is fundamentally about the GPS principle that every fact needs a source and a reasoning trail. This app is built on exactly that principle, which is validating.
- The "correction note" workflow -- attaching an explanation to a fact change -- maps directly to the assertions table. An assertion is not just "X is true" but "X is true because of Y source and here is the reasoning." The correction note IS the assertion.
- Separating merged identities is a Research Investigation (Module 16) use case. The floating-tree / candidate-person model is the equivalent workflow in this app.
- The distinction between detaching a record (removing association) vs. deleting a record is important UI language. This app needs clear language around "remove this source from this person" vs. "delete this source entirely."

---

### Videos 4 and 5: Floating Trees and Connecting Them

**Ancestry workflows covered:**
- Floating tree = unconnected hypothesis workspace inside or alongside a main tree
- Used for: DNA match research, brick wall candidates, collateral line research
- Naming conventions: [RESEARCH], [DNA], [UNVERIFIED] prefixes
- Connection protocol: require 2+ independent source records before connecting to main tree
- Post-connection: resolve duplicates, verify all sources transferred cleanly

**Design signals:**
- The floating tree is Ancestry's version of Module 16's candidate person concept. Researchers actively manage "things I am investigating but not yet confident in" as separate from "things I know." This app should make that distinction clear and surfaced in the UI -- not buried.
- The "do not connect prematurely" rule is a GPS principle this app already enforces. But the UI should probably make the confidence level visible on a person -- not just in research notes, but as a status the researcher can set and see at a glance.
- The naming convention system ([RESEARCH], [UNVERIFIED]) is a workaround for Ancestry's lack of a proper status field. This app can offer a real status field instead of a naming hack.

---

### Video 6: Emoji Markers

**Ancestry workflows covered:**
- Emoji placed in nickname or alternate name field as a visual status indicator
- Connie's system: heart = favorite, red circle = brick wall, green check = complete, question mark = uncertain identity, DNA helix = DNA evidence, star = direct ancestor
- Emoji key must be documented separately (research note on root person, or external doc)

**Design signals:**
- This is the clearest signal in batch 1 that Ancestry lacks a proper research status system. Researchers are solving for this with Unicode hacks because no native status field exists. This app should have a first-class research status field on every person -- not an emoji, but a real categorical field with defined values.
- Suggested status vocabulary (informed by Connie's emoji system, translated to GPS-appropriate language):
  - Confirmed -- identity established, core facts sourced
  - In Progress -- active research underway
  - Brick Wall -- stalled, needs new search strategy
  - Uncertain -- identity or relationship not yet established
  - Candidate -- proposed connection, not yet proven (floating tree equivalent)
  - DNA Linked -- DNA evidence exists
- This status field should be visible on the Person Detail page AND filterable/browsable in the People hub.

---

### Video 7: Ancestry Profile Makeover

**Ancestry workflows covered:**
- Profile photo + header image (map of home region as header if no photo)
- Bio / "About" narrative section -- written as a biographical record, not a database entry
- Fact-level sourcing (attach source to the specific fact, not just to the profile generally)
- Systematic hint review: Review -> compare -> Save (original records only) or Ignore
- Media gallery: upload photos, scanned documents, maps; add titles, dates, captions; transcribe handwritten docs in description field; tag people in photos
- Alternate names: add name variations as facts with source records attached
- Residence timeline: add a Residence fact for every census year, sourced to the census record

**Design signals:**
- This video is the clearest articulation of what a well-maintained person record looks like from a power user's perspective. It maps almost exactly to the Person Detail page this app already has -- but with some gaps:
  - Bio/narrative section: this app has Research Notes (person_research_notes), which is the equivalent. But the UI framing matters -- is it positioned as a researcher's living narrative or as a notes dump? Connie's framing (write it for a family history book) is the right framing.
  - Fact-level sourcing: this app has this in the Case Study Builder but it is not yet surfaced on the Person Detail page in a way that makes sourcing status visible at a glance (which facts are sourced vs. unsourced).
  - Media gallery: not yet built. Media-as-Unanalyzed-Evidence principle in AGENT.md points here. The Person Detail page has no media tab yet.
  - Alternate names: imported from FTM and stored. But the UI does not yet let the researcher add new alt names or attach sources to specific name variants.
  - Residence timeline: timeline_events handles this. But is it presented as a life-movement view, not just a flat list?
- Connie's rule "never click Save to Tree on a hint from another member tree" = this app's rule that Ancestry tree sources are not real sources. Validates the known technical debt item about the 87.6% source-wiring figure potentially being overstated.

---

### Video 8: Ancestry Networks (2025) -- initial coverage

**Ancestry workflows covered:**
- Networks = automated DNA match clustering (automated Leeds Method)
- Each cluster = one ancestral couple's descendants, grouped by shared DNA patterns
- No tree required (unlike ThruLines) -- works from DNA patterns alone
- Workflow: click network -> sort by closest matches -> check trees of top 3-5 -> find repeating surnames + geographic overlap -> cross-reference with own tree
- Custom naming of clusters
- Filtering within clusters: matches with trees + closest DNA = highest-value leads
- ThruLines vs. Networks: ThruLines confirms known connections; Networks discovers unknown ones

**Design signals:**
- See Video 9/10 in Batch 2 for much fuller coverage of Networks -- the scope is far broader than DNA alone.
- The ThruLines vs. Networks distinction: ThruLines = confirmation; Networks = discovery. This framing should inform Module 14.

---

## Batch 2 -- Videos 9-14

Source file: GenealogyTV_Batch2_Videos9-14.md
Data quality: Videos 10, 13, 14 have full YouTube transcripts (high confidence). Videos 9, 11, 12 are article-based -- 11 and 12 are substantive articles; 9 is a companion summary only.
Note: A re-run of this batch is in progress; additional detail may be added when complete.

---

### Videos 9 and 10: FAN Club Updated for 2025 + Ancestry Networks (Full Coverage)

**Ancestry workflows covered:**
- FAN Club strategy (Elizabeth Shown Mills) -- researching the people around an ancestor, not just the ancestor
- Record sources for FAN Club building: passenger lists, census neighborhood pages (5-10 pages each direction), wedding registries, obituaries, land records (adjoining landowner names), military units, military journals (POW diaries naming fellow soldiers), wills and probate inventories (estate sale buyer lists)
- Census extraction to Excel: Ctrl+A copy from Ancestry transcription panel, Paste Special as Text into Excel, add image number column, filter/sort by surname and gender
- AI cross-reference: upload multiple Excel files to ChatGPT, prompt to cross-reference all people appearing across multiple records, request output as a table with individual columns per record source
- Ancestry Networks (beta) -- now revealed as a GENERAL-PURPOSE FAN Club tracking system, not just DNA:
  - Create a network, name it (e.g., "Danish Brotherhood")
  - Add people from any profile page -- tag them to the network
  - Add records, images, and sources directly to the network
  - Example networks built: Danish Brotherhood (organization members), 50th Wedding Anniversary photo (all people in the photo), passenger list networks (fellow travelers)
  - Discovery example: building a passenger list network revealed a second earlier crossing for an ancestor previously thought to have arrived later
- DNA match lists framed explicitly as "a digital version of your ancestor's FAN Club"
- Floating trees + Networks described as complementary: create floating person, research them, then add to a network for long-term tracking
- Probate inventory insight: estate sale buyer list names are neighbors and family -- all should be added to a FAN Club network with the probate package as source

**New facts about Ancestry Networks:**
- NOT just for DNA -- for any relationship network built from any record type
- Currently private to the creator; not visible to or searchable by other users
- Does not require Ancestry Pro Tools
- Beta as of August 2025; feature set may change

**Design signals:**
- The census-extraction-to-Excel workflow is painful by design. Copy, paste special, add image numbers manually, filter. This app, with its timeline_events and addresses tables already populated from FTM, could make the FAN Club neighborhood extraction dramatically easier -- query persons who lived at the same address or in the same geographic area at the same time period. This is the address-as-search-key principle in action, and it should be a core feature of Module 8 (FAN Club Mapper).
- Ancestry Networks is more powerful than batch 1 suggested -- it is a general FAN Club management system, not just DNA clustering. Module 8 should be designed to do what Networks does and more: structured FAN Club groups with typed record sources, linkable to any person in the persons table.
- The AI cross-reference prompt (upload two Excel files, ask ChatGPT to find people appearing in both) is exactly what this app could do natively: given a person, find all other persons who appear in the same records. This is the address-as-search-key query described in AGENT.md but extended to any record type.
- Probate inventories as FAN Club source: estate sale buyer lists. This is a record type the Document Analysis Worksheet pipeline should be able to process -- extract all named buyers as FAN Club candidates.
- The framing "DNA match lists are a digital FAN Club" is the bridge between Module 14 (DNA Evidence Tracker) and Module 8 (FAN Club Mapper). These two modules should eventually share data -- a DNA match who is also a census neighbor is more significant than either signal alone.

---

### Video 11: Custom Clusters on AncestryDNA (Pro Tools)

**Ancestry workflows covered:**
- Custom Clusters: user selects up to 4 confirmed anchor matches on a specific line
- System generates a cluster of all shared matches connected to that branch
- Lower cM threshold than auto-clustering: down to 20 cM (vs. ~65 cM for automated clusters)
- User names the cluster (e.g., "Jensen/Madsen Line")
- Adjustable cM range: start higher, adjust downward for more/fewer matches

**Design signals:**
- Custom Clusters require Pro Tools (paid upgrade). This is a capability gap for standard Ancestry users that this app could partially address by letting researchers manually define a DNA family group with anchor matches and track who belongs to each group -- essentially the same concept implemented in the DNA Evidence Tracker.
- The 20cM threshold matters because that range captures genealogically meaningful but more distant matches. The DNA Evidence Tracker should probably capture the cM value for each match and allow filtering by range.
- Naming clusters by line (both surnames where possible) is a good practice this app should encourage in its DNA Evidence Tracker UI.

---

### Video 12: RootsTech 2026 -- New Ancestry Features (Crista Cowan Interview)

**New Ancestry features announced:**

1. Fold3 Revolutionary War pension records -- 2.4 million images now full-text searchable via HTR/AI. ANY name in the document is searchable, not just the indexed pensioner. Witnesses, neighbors, heirs all become findable.

2. 5 million additional record images (including probate files) going through the same full-text search pipeline.

3. Photo Insights -- AI analysis of photos and documents: estimates date ranges, locations, historical context. For undated or unlabeled images.

4. Full document transcription for user-uploaded items -- handwritten letters, church records, personal documents now auto-transcribed.

5. Ancestry Preserve -- physical digitization service: ship a box of photos, slides, film, paper documents; Ancestry digitizes and adds to tree automatically.

6. 90 new US DNA Journeys -- migration patterns within the United States.

7. Person profile page redesign + hints workflow redesign -- COMING SOON (announced at RootsTech 2026, not yet live at time of article).

**Design signals:**
- Items 3 and 4 (Photo Insights + full document transcription) are directly in the territory of this app's Document Analysis Worksheet (Module 5) + Deep Look v2 + OCR-HTR pipeline. Ancestry is moving toward AI-powered document analysis as a standard feature. This app's version is more powerful (produces structured assertions, GPS-compliant) but the baseline expectation is now being set by Ancestry.
- Item 1 (Fold3 full-text search) is the address-as-search-key and FAN Club principle applied to pension records. Any name in any document becomes a search key. This is a validation of the foundational principles in AGENT.md.
- Item 7 (person profile page redesign + hints workflow redesign) is a planning signal: Ancestry's own profile page is changing. This app's person page design should not be modeled on the current Ancestry profile page -- it should be informed by where Ancestry is going, and more importantly by what Ancestry will never do (GPS compliance, assertion trails, FAN Club integration, research status management).
- Item 5 (Ancestry Preserve) creates a pipeline from physical family archives into Ancestry trees. Those digitized files become exactly the 3,752-file media corpus this app is designed to analyze. The Media-as-Unanalyzed-Evidence principle becomes more urgent as more families digitize their physical archives.
- Item 2 (probate files in full-text search pipeline) directly amplifies the FAN Club probate inventory insight from Videos 9/10: probate buyer lists will now surface in search results automatically.

---

### Video 13: 10 Best Tips Part 1 (census extraction, SSDI/SSACI, FamilySearch Discovery)

**Ancestry workflows covered:**
- Private tree search (reinforces Video 1 -- same workflow)
- "Who saved this image" -- navigate to Gallery, click the circular profile icons overlapping on the image; check the saver's last login date before messaging
- Census extraction to Excel: detailed step-by-step -- note image number before starting, Ctrl+A then Paste Special as Text, insert image number column and drag-fill, repeat for 5-10 pages in each direction from ancestor's location; filter by surname and gender to identify candidates
- SSDI (Social Security Death Index) + SSACI (Social Security Applications and Claims Index): both free on FamilySearch; SSACI provides parent names (including mother's maiden name) that SSDI does not; cross-reference by matching last 4 SSN digits
- FamilySearch Discovery Experiences: interactive tools at familysearch.org/discovery; "All About Me" returns name meaning + events from birth year + top news stories; useful for adding historical context to oral history interviews and family narratives

**Design signals:**
- The census extraction workflow is shown in full step-by-step detail here. The labor involved is significant: multiple copy-paste cycles, manual image number tracking, Excel filtering. This is a workflow this app can completely replace for its own data -- search persons who appear in records at the same location and time window. The FAN Club Mapper query engine is the native version of this Excel workflow.
- SSDI/SSACI: both are free on FamilySearch and provide different data. SSACI's mother's maiden name is particularly valuable for Ashkenazi Jewish research where maternal lines are difficult to trace. Worth noting as a source type in the Research Plan Builder.
- FamilySearch Discovery -- "what was happening in the world when this ancestor was young" -- this is the historical context layer. It connects to the Narrative Assistant engine (narrative-assistant-v3.md) which should be able to pull historical context for a person's timeline. The person's bio narrative shouldn't just describe what they did -- it should situate them in their world.
- The "check last login date before messaging" tip is a collaboration quality signal. Not relevant to build now but relevant if this app ever surfaces collaboration opportunities.

---

### Video 14: 10 Best Tips Part 2 (floating trees step-by-step, DNA grouping, FamilySearch Wiki)

**Ancestry workflows covered:**
- Floating tree creation: add person attached to anyone, immediately disconnect all relationships; give distinctive name (e.g., "Friend Test" or "FLOATING [surname]") so searchable later; floating people do NOT appear in main pedigree view
- Duplicate prevention: ALWAYS search existing tree before clicking Add -- Ancestry creates a new person instead of linking to existing; duplicates with common surnames accumulate silently
- Multi-monitor setup: 3 monitors recommended -- tree on one, search/records on another, notes/reference on third; extend desktop not duplicate; mix-and-match monitor brands fine
- DNA grouping clarification: "descends through the ancestral couple" not necessarily "from" -- distant matches may connect to an earlier generation in the same line; always use best KNOWN match as anchor, not suspected match
- FamilySearch Wiki: consult before searching any new location; provides record types available, date ranges, county border changes over time, courthouse location, links to online collections; map-based drill-down by state then county

**Design signals:**
- Floating people don't appear in the main pedigree view on Ancestry -- that's a deliberate design choice. This app's People hub needs to make the same distinction visible: confirmed tree members vs. candidates/floating people should be visually and structurally distinct, but both should be accessible from the hub.
- The duplicate prevention problem on Ancestry ("search before you add") exists because Ancestry has no deduplication guard. This app's persons table should have deduplication logic surfaced in the UI when adding a new person -- show potential matches before confirming the add.
- The 3-monitor workflow describes how power users use this app: alongside Ancestry and FamilySearch simultaneously. This app is one window among several. The UI should be designed for parallel use -- clean, focused, no excessive whitespace, information dense enough to be useful at a glance without requiring constant navigation. Tab structure within the person page matters.
- FamilySearch Wiki by location before searching: this is a research planning step this app should prompt for. When creating a research plan for a specific person (Research Plan Builder, Module 2), the researcher should be prompted: "Have you checked what records exist for [location] in [era]?" with a link to the FamilySearch Wiki for that location if possible.
- The DNA "descends through not from" clarification is a precision point relevant to Module 14's UI language. DNA match language should be careful about this distinction.

---

## Pending Batches

- Batch 2 re-run: may add detail to Videos 11 and 12
- Batch 3+: not yet received

---

## Synthesis Checklist (complete after all batches)

- [ ] All batches received and appended
- [ ] Cross-batch themes identified
- [ ] Design implications written into app-design-exploration.md
- [ ] connie-knox-workflow-notes.md marked COMPLETE
