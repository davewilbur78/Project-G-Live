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
- See Videos 9/10 in Batch 2 and Video 16 in Batch 3 for fuller coverage of Networks -- the scope is far broader than DNA alone.
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
- Does not require Ancestry Pro Tools (NOTE: contradicted by batch 3 Video 16 -- Pro Tools IS required per March 2025 video; may have changed between beta periods)
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

## Batch 3 -- Videos 15-16 + Additional Video Metadata

Source file: batch 3 document + direct URL fetches
Data quality: Video 15 full transcript; Video 16 full transcript (extended version of Video 8);
  Additional videos 17+ identified by title/URL -- chapter markers retrieved but not full transcripts yet.

---

### Video 15: New Ancestry Updates + Tips & Tricks -- February 2025

**Ancestry workflows covered:**

AI-Generated Record Summaries:
- Ancestry now generates an AI narrative paragraph from within census/record view
- Access via "Record Summary" button in the record mini-view panel
- Pulls name, age, relationships, household members, location, literacy, home ownership
- CRITICAL CAVEAT: AI summary contradicted itself within the same paragraph (owned vs. rented)
- Connie's rule: always label AI-generated content as "AI Generated Summary" in quotes in research notes; never trust without verification against the record image

Fixing Transcription Errors:
- Click the people/index icon within the record view
- Click the incorrectly transcribed name, type correction, select reason "Transcription error"
- Ancestry offers to apply to all household members -- uncheck any who shouldn't be changed
- Corrected name appears in brackets alongside original; both remain searchable

Handling Multiple Name Changes:
- Primary name = birth name (exception: adoptees whose records predominantly use adoptive name)
- Alternate names added as Alternate Name facts (NOT "Also Known As")
- CRITICAL: "Also Known As" confirmed by Ancestry staff to NOT feed search algorithms
  Use AKA ONLY for true nicknames that would never appear in a record (e.g., "Bubba," "Goat")
  Any name that may appear in a record must be an Alternate Name fact
- To add: Edit -> Enable Alternate Facts -> Add a Fact -> type "N" -> select Name

Merging Duplicate Profiles:
- Pro Tools path: Pro Tools -> Tree Checker -> filter Duplicates -> Merge with Duplicate
- Non-Pro-Tools path: profile -> Tools dropdown -> Merge with Duplicate -> search by name
- Side-by-side comparison with radio buttons to choose which version of each fact to keep
- ALWAYS evaluate before merging -- different parents, dates, or places = investigate first
- Tree Checker duplicate resolution can take hours to update after merging

Dual Parent Relationships (biological + adoptive):
- Edit -> Edit Relationships -> Add Alternate Mother / Add Alternate Father
- Set relationship type: Biological vs. Adopted

Exporting a List of All People in Tree:
- Pro Tools -> List of All People (or from Tree View)
- IMPORTANT: unfiltered export caps at 1,000 records (alphabetical, A through early-D in a 4,000+ tree)
- Use filters before downloading: Family Lines filter, or Direct Line Ancestors Only (~239 people in Connie's tree)
- Download as CSV (Excel/Google Sheets) or PDF
- Add filter buttons in Excel header row for sorting after download

Managing Hidden DNA Matches:
- Three-dot menu on any match -> Hide Match -> match disappears from default view
- To view/restore: Filters panel -> Hidden Matches toggle
- CAUTION: filter behavior is "wonky" -- hidden matches may or may not appear in Shared Matches views
- Always check active filters when results seem incomplete
- Not a Pro Tools feature -- available to all DNA subscribers

**Design signals:**
- The AI record summary contradiction (owned vs. rented in same paragraph) is a direct validation of why GPS-compliant structured extraction matters. This app's Document Analysis Worksheet produces structured assertions with source attribution -- not a narrative paragraph that can contradict itself. This is a genuine differentiator, and the UI language should reflect it: "extracted facts" not "AI summary."
- "Also Known As does NOT feed search" is a critical data quality trap. This app's alt_names imported from FTM -- need to confirm they are stored and treated as searchable alternate names, not as AKA labels. If any FTM alt names were imported as display-only nicknames, they should be audited.
- The 1,000-record export cap on Ancestry is a significant limitation. This app's persons table has 1,576 people and can be queried without any cap. The People hub's export capability (when built) should never impose arbitrary limits.
- The duplicate merge workflow requires Pro Tools on Ancestry. This app's deduplication guard on add-person should be built in as a baseline feature, not a paid upgrade.
- Connie's rule "label all AI-generated content in research notes" is exactly the right policy. This app's Research Notes panel should probably carry a visual indicator when AI-assisted content has been added, so the researcher always knows what was written by them vs. generated.

---

### Video 16: Ancestry Networks -- Extended Deep Dive (March 2025)

**Note:** This is the full-transcript version of Video 8 from Batch 1. Pro Tools required (confirmed).

**New detail beyond what Batch 1 captured:**

Full network type category taxonomy:
- Family and Life Milestones (birth, marriage, death, DNA, heirlooms)
- Immigration
- Shared Experiences (true crime, natural disasters, politics)
- Group/Organizations
- Local Community
- Religion (congregations, church groups)
- School and Work (students, educators, clubs, occupation)
- Enslavement
- Atrocity and Displacement (indigenous peoples, Trail of Tears, etc.)
- Military (American Revolution, Civil War, WWI, WWII, etc.)
- Sports and Entertainment
- Burial Place (city, public, military, religious, lost, African-American cemeteries)
- Something Else (custom, user-defined)

Custom Tree Tags as complementary layer:
- Add a Custom Tree Tag (e.g., "Floating Tree") to floating people before disconnecting them
- In Tree View, filter by custom tag to see all floating members
- Networks + custom tags serve different purposes: tags = per-person markers visible in tree view;
  networks = group containers with sources, typed by relationship

Feature limitations (March 2025):
- Pro Tools required
- Beta status
- No cross-network filtering -- Connie EXPLICITLY REQUESTS this as a feature: "find people who
  appear in TWO different networks, then create a combined third network automatically"
- No bulk source attachment to multiple people in a network simultaneously
- Networks not visible in tree mini-profile -- must open full profile to see network membership

**Design signals:**
- The network category taxonomy is the design vocabulary for Module 8 (FAN Club Mapper). The categories are not arbitrary -- they represent the meaningful relationship types that genealogical research produces. Module 8 should use a similar typed-network model. Relevant categories for this tree (Ashkenazi Jewish, Danish immigrant, American): Immigration, Religion (synagogue/congregation), Local Community (census neighborhood), Military, Wills & Probate (buyer networks), Group/Organizations.
- Cross-network filtering is something Ancestry CANNOT do (Connie is requesting it as a future feature). This app CAN do it trivially as a SQL set intersection: show me all people who appear in BOTH the "1880 Randolph County Neighbors" network AND the "Jensen Passenger List" network. A person appearing in two independent FAN Club networks is a much stronger lead than a person in only one. This is a unique capability this app should highlight.
- The Custom Tree Tag + Networks complementary model maps to this app's architecture: research_status field (per-person marker, like tree tags) + FAN Club network groups (group container with sources). Both layers are needed and serve different purposes.
- "Enslavement" and "Atrocity and Displacement" as network categories are a reminder that genealogical research contexts span a wide range of histories. Module 8's network type taxonomy should be inclusive and sensitive, not defaulting to a neutral suburban family tree.

---

### Additional Videos Identified -- Metadata Only (transcripts pending)

#### Video 17: Research Notes Updated for 2026 -- Game Changer for Family History Brick Walls
URL: https://www.youtube.com/watch?v=F_YAtpfrvTQ
Published: November 14, 2025
Runtime: 33:10
Views: 23,390
Description: "The #1 most requested strategy and handout I get from viewers...This strategy and
  process has resolved more genealogical problems and broken down more brick walls than any other
  strategy I teach."

Chapter markers (retrieved -- highly structured):
- 01:07 Example of Research Notes for Genealogy
- 01:19 Using MS Word for Research Notes
- 01:35 Research Notes Format
- 01:47 Adding Sources in Footnotes
- 02:23 Adding To Do Items in Notes
- 02:47 Adding Profile Hyperlinks in Notes
- 03:27 What are Research Notes?
- 04:14 What About Records Not Found? (Negative Evidence)
- 04:53 This is not a Research Log (EXPLICIT DISTINCTION)
- 06:19 Make Source Footnotes
- 08:31 Adding Checkmarks or Emojis on Ancestry
- 11:03 Cleaning up the Profile
- 15:05 Who to keep Research Notes on?
- 17:49 Handout Info
- 19:38 Filing Wives
- 20:12 Davis Brothers Series
- 21:19 Working on Multiple Research Notes Simultaneously
- 21:54 Handout Worksheet
- 24:51 Sharing Research Notes
- 26:36 Emojis Used
- 28:26 About MS Word
- 28:43 Free Source Citation Options
- 29:15 Copy FamilySearch URL into Research Notes
- 30:19 FamilySearch Source Citations
- 30:54 Insert Footnotes in Word

**Preliminary design signals from chapter markers alone:**
- This is the Knox Research Notes Method -- her signature approach, most-requested content.
- "This is not a Research Log" -- she makes the same distinction this app makes between
  person_research_notes (living narrative) and Module 3 (Research Log). Validates the architecture.
- Research Notes use MS Word with formal footnotes for source citations -- not inline text.
  The person_research_notes panel should support inline source citations, not just attached sources.
- Negative evidence (records not found) is explicitly included. The notes panel should support
  logging a search that returned nothing -- "searched SSDI for [name], date range [x-y], no result."
- Profile hyperlinks in notes -- linking to other Ancestry profiles from within the notes text.
  This app equivalent: linking to other persons in the persons table from within the notes.
- "Who to keep Research Notes on?" -- not just direct ancestors. FAN Club members, candidates,
  anyone being actively investigated. Reinforces the candidate/confirmed distinction.
- "Filing Wives" -- how to handle notes for women who change surnames. A data model consideration
  for the person_research_notes panel when the person has multiple surname identities.
- "Working on Multiple Research Notes Simultaneously" -- the researcher works on several people
  in parallel. This suggests the People hub should surface which persons have notes in progress.
- Full transcript needed before finalizing design implications. Flag for next batch.

#### Video 18: New Workflow for 2026 -- Avoiding Disaster
URL: https://www.youtube.com/watch?v=hZxaSHXg4C0
Published: January 2, 2026
Runtime: 17:50
Description: Cloud-based working archive workflow; OneDrive for working files, Backblaze for
  disaster-recovery backup; distinction between working access and backup.

**Preliminary design signals:**
- Power genealogists maintain a file archive as a first-class asset separate from Ancestry.
  The 3,752 FTM media files are part of a cloud-based working archive, not just Ancestry attachments.
- "Working access vs. backup" distinction is relevant to the media import pipeline architecture:
  the researcher needs to be able to pull files from their working archive on demand, not just
  from what's already in Ancestry.
- Less directly relevant to UI design than the Research Notes video. Full transcript not fetched.

#### Additional Videos Identified (not yet fetched):
- New AncestryDNA Tree Feature: https://youtu.be/E82tgAiERb4
- Social Security Records Updated 2025: https://youtu.be/HrHqefrpEX0
- Find a Grave Tricks & Transfers (Jan 2025): https://youtu.be/F9Ghu2XYjY0

---

## Pending

- Enhanced Batch 2 re-run: may add detail to Videos 11 and 12
- Full transcript for Video 17 (Research Notes Updated for 2026) -- HIGH PRIORITY
- Full transcripts for Videos 18+ if Perplexity can retrieve them

---

## Synthesis Checklist (complete after all batches)

- [ ] All batches received and appended
- [ ] Full transcript for Video 17 retrieved and noted
- [ ] Cross-batch themes identified
- [ ] Design implications written into app-design-exploration.md
- [ ] connie-knox-workflow-notes.md marked COMPLETE
