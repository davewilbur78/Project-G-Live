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

---

### Video 1: Hidden Tools on Ancestry
**Key signals:** People hub by surname family group = All Hints filtered-by-surname. Research Plan Builder needs "what records exist for this location/era" field.

### Video 2: Card Catalog -- 5 Pro Tricks
**Key signals:** Research Plan Builder needs a collections-available field. Source records could carry a "collection notes" field for coverage limitations.

### Video 3: Fixing Mistakes on Ancestry Trees
**Key signals:** Correction note = assertion. UI language: "remove this source from this person" vs. "delete this source entirely."

### Videos 4 and 5: Floating Trees and Connecting Them
**Key signals:** Floating tree = Module 16 candidate person concept. Status field replaces naming convention hacks.

### Video 6: Emoji Markers
**Key signals:** Ancestry lacks a research status system. This app's research_status field replaces all hacks. Status vocabulary: Confirmed, In Progress, Brick Wall, Uncertain, Candidate, DNA Linked. Visible on person page AND filterable in People hub.

### Video 7: Ancestry Profile Makeover
**Key signals:** person_research_notes framing: "write for a family history book." Fact-level sourcing health not yet surfaced on person detail page. Media gallery not yet built. Validates 87.6% source-wiring quality concern.

### Video 8: Ancestry Networks -- initial coverage
**Key signals:** See Videos 9/10 and 16 for full scope. ThruLines = confirmation; Networks = discovery.

---

## Batch 2 -- Videos 9-14

---

### Videos 9 and 10: FAN Club + Ancestry Networks Full Coverage
**Key signals:** FAN Club sources: passenger lists, census neighborhoods, obituaries, land records, probate inventories. Census-to-Excel pipeline = workflow this app eliminates natively via FAN Club Mapper. DNA match lists = digital FAN Club. Bridge between Module 14 and Module 8.

### Video 11: Custom Clusters (Pro Tools)
**Key signals:** Paywalled capability this app offers free. DNA Evidence Tracker should capture cM value and filter by range.

### Video 12: RootsTech 2026 New Features
**Key signals:** Ancestry building AI document analysis -- this app's version produces GPS-compliant structured assertions. Person profile page redesign coming: design for what Ancestry will never do. Ancestry Preserve makes Media-as-Unanalyzed-Evidence more urgent. Fold3 full-text search validates address-as-search-key.

### Video 13: 10 Best Tips Part 1
**Key signals:** FAN Club Mapper replaces census extraction. SSACI mother's maiden name valuable for Ashkenazi Jewish research. Narrative Assistant should situate ancestors in historical context.

### Video 14: 10 Best Tips Part 2
**Key signals:** People hub: floating/candidate persons visually distinct but accessible. Deduplication guard = baseline feature. 3-monitor workflow: design for parallel use. Research Plan Builder: prompt for FamilySearch Wiki by location.

---

## Batch 3 -- Videos 15-16

---

### Video 15: New Ancestry Updates February 2025
**Key signals:** AI summary contradiction = validates GPS-compliant extraction. UI: "extracted facts" not "AI summary." AKA does NOT feed search -- audit FTM-imported alt_names. 1,000-record export cap: this app has no such limit. Duplicate merge requires Pro Tools: deduplication guard is baseline here.

### Video 16: Ancestry Networks Extended Deep Dive
**Key signals:** Full network type taxonomy = design vocabulary for Module 8. Cross-network filtering: Ancestry cannot do this, this app can (SQL set intersection). Tags + Networks are complementary layers.

---

## Batch 4 -- Videos 17-21

---

### Video 17: Research Notes Updated for 2026
**Key signals:** Knox Research Notes = person_research_notes, but with structure a plain text field cannot match: chronological by event date, inline footnote citations, negative evidence as first-class entry, to-do items in chronological flow, hyperlinks to other profiles. NOT a Research Log -- third independent signal validating this app's architecture. People hub research queue (In Progress) manages multiple simultaneous notes.

### Video 18: New Workflow for 2026 -- Cloud Archive
**Key signals:** Researcher's 280+ GB archive lives in cloud-synced working environment. This app pulls from archive on demand. Working access ≠ disaster recovery: this app is the analysis layer.

### Video 19: New AncestryDNA Tree Feature
**Key signals:** DNA evidence wanted in tree context, not a separate tab. Person page should surface DNA evidence alongside timeline and family structure.

### Video 20: Social Security Records Updated 2025
**Key signals:** Four distinct SS record types each provide different evidence -- source taxonomy should distinguish them. SS number = storable field on person record. Numident (FamilySearch only) is richest source; most researchers miss it. SSACI mother's maiden name valuable for Ashkenazi Jewish research.

### Video 21: Find a Grave Tricks and Transfers
**Key signals:** Cemetery surname search = FAN Club Mapper applied to burial locations. Virtual Cemeteries = FAN Club networks by burial place. Find a Grave data = authored work of unknown reliability; source quality flag needed.

---

## Batch 5 -- Videos 22-25

---

### Video 22: Auto Clustering (ProTools)
**Key signals:** Four-cluster model (one per grandparent, anchored at great-grandparent couples) = organizing framework for DNA Evidence Tracker. Gray boxes (multi-cluster matches) are normal in endogamous research. "Relationship between two matches" is a richer data model than just "this match is on my grandmother's side."

### Video 23: Thinking About DNA (GTV Podcast)
**Key signals:** "Leftovers" strategy: assign the knowns, unassigned on a parent side = mystery branch. DNA Evidence Tracker should surface "unassigned matches" as a visible research target. Y-DNA breakthrough = discovery event worth recording as narrative. Working cM threshold should be settable and savable. "Don't chase every match -- define a research question first."

### Video 24: Grouping DNA Matches (Live Demo)
**Key signals:** BKM concept = anchor of grouping methodology; DNA Evidence Tracker should support BKM designation per line. Old manually-labeled groups become stale when platforms change: DNA grouping should be based on person record connection, not platform labels. Warm/cool color scheme for maternal/paternal is a strong visual design pattern.

### Video 25: AncestryDNA Master Class (55 min)
**Key signals:** Four-quadrant DNA model is the fundamental organizing principle -- not a flat list of matches but four grandparent lines plus mystery bucket. Chromosome Painter ≠ Chromosome Browser (critical distinction). Filter by Location Map = address-as-search-key applied to DNA geography. Knox has three pages of floaters -- People hub must handle 50-100+ candidates gracefully. 57% of Ancestry users don't know all four grandparents: this is the primary use case, not an edge case.

---

## Batch 6 -- Videos 26, 28, 29

Source file: batch 6 document
Data quality: Video 26 full transcript (50 min); Video 28 full transcript (74 min); Video 29 partial (companion article only).
Note: Video 27 slot disqualified -- URL was GeneaVlogger (Jarrett Ross), not Genealogy TV / Connie Knox. Slot vacant.

---

### Video 26: Genealogy Master Plan (2025)

**Workflow covered:**

This is the methodological backbone of Connie's entire practice -- a comprehensive structured workflow for genealogy research combining GPS standards, the Knox Research Notes Method, and the Trifecta Strategy. Demonstrated live on a real case study: proving/disproving whether Hardy G. Winslow is the biological father of Hill Kiah Winslow, using census, Civil War, land, and marriage records spanning 1850-1878.

**The Knox Research Notes Method (extended detail from Video 17):**
- One document per ancestor (not per couple) -- couples had separate lives
- Chronological order: every entry begins with the year of the event
- Title line: full name, birth year, FamilySearch ID, hyperlink to Ancestry profile
- Source citations as footnotes (NOT endnotes) -- footnotes travel with the paragraph as you reorganize; endnotes do not
- Bold red text for "not found" entries -- visual differentiation makes action items immediately visible
- FAN Club members included when they appear repeatedly (example: "Christner" turned out to be a key connecting figure for Connie's Christopher Madson research)
- Analytical thoughts and working hypotheses included -- "I think this might be..." helps reconstruct reasoning when returning after months or years

**What goes in Research Notes vs. Special Projects (separate documents):**
- Research Notes: records found, records NOT found, FAN Club references, working hypotheses
- Special Projects (separate files): full transcriptions of wills/deeds, DNA match hierarchy charts, FAN Club mapping diagrams, immigration studies, local history studies, conflict resolution charts, photo analyses

**The Trifecta Strategy:**
- Mathematical basis: 3³ = 27 potential records maximum
- Three Platforms: Ancestry + FamilySearch (free, vast, underused) + one logical third platform (Newspapers.com, Fold3, state archive, etc.)
- Three Search Types (on each platform): (1) chase automated hints, (2) search from the ancestor's profile, (3) targeted research via Card Catalog / research wiki without relying on name search
- Three Search Criteria: (1) name (including spelling variants), (2) place (location only, without name), (3) time (historical context of the area)
- Key insight: searching by PLACE without a name surfaces ancestors indexed under different spellings or transcription errors; searching by TIME reveals historical context (e.g., a newspaper that ceased publication during the Civil War explains an absence of results)

**Master Plan Steps (complete sequence):**
1. Formulate a specific research question -- one ancestor at a time
2. Gather and organize what is already known
3. Create research notes for the subject ancestor
4. Create a research plan within the notes
5. Execute research (Trifecta Strategy)
6. Document all findings and all expected records NOT found
7. Evaluate each record individually (original? clerk's copy? index? photograph of original?)
8. Correlate multiple records as they relate to the research question
9. Resolve conflicts and reach a conclusion; document reasoning
10. Rinse and repeat for the next ancestor

**Confirmation bias warning:** Actively seek evidence that DISPROVES the hypothesis equally with evidence that supports it. Do not force-fit records to a predetermined conclusion.

**Modern tools mentioned:**
- Transkribus: handwriting-to-text recognition tool; paste a document image, get typed copy-paste-ready transcription
- LucidChart: used for DNA hierarchy charts and FAN Club mapping diagrams
- AI assistants: "doing remarkable things for genealogy in 2025" -- not elaborated further in this episode

**Case study highlights (Hill Kiah Winslow):**
- Two wives both named Mary (Mary C. Hale, d. 1876; Maryanne Spurlin, m. 1878) -- confusion resolved by the timeline
- Geographic migration Randolph County → Cleveland County traced through a series of land transactions
- Civil War enlistment, capture at Battle of Roanoke Island, parole, possible insubordination discharge -- all documented in separate Civil War Special Project
- Probate record at closing = corroborating evidence toward proving Hardy-Hill paternity relationship
- FAN Club member Ezra Beckerdite surfaces in a 1863 land sale -- flagged for future investigation

**Design signals:**

The Master Plan steps map directly to this app's modules:
- Formulate research question = Research Plan Builder (Module 2)
- Create research notes = person_research_notes panel
- Execute Trifecta = Research Plan's guided search scaffold
- Document findings = timeline_events, sources, citations
- Evaluate records individually = Source Conflict Resolver (Module 6) + Document Analysis Worksheet (Module 5)
- Correlate and conclude = Case Study Builder (Module 10)

This is not coincidence -- the app was designed with GPS compliance in mind and Connie's method is GPS compliance in practice. The alignment is intentional and validates the build order.

The Trifecta Strategy is a structured search scaffold the Research Plan Builder should support. When creating a research plan, the system could prompt: Have you searched Ancestry? FamilySearch? A third platform? Have you used all three search types on each? Have you searched by place as well as by name?

Special Projects as separate documents validates having separate modules rather than trying to put everything in one place. The Document Analysis Worksheet, Case Study Builder, DNA Evidence Tracker, and FAN Club Mapper are the native equivalents of Connie's special project documents.

LucidChart for DNA hierarchy and FAN Club mapping diagrams: this app's FAN Club Mapper (Module 8) is the native replacement for the spatial/relationship visualization. The DNA Evidence Tracker handles the hierarchy work.

"Footnotes, not endnotes" is a technical footnote requirement that translates to: inline citation references in the notes panel must be attached to the specific claim they support, not appended at the end of the document.

The FAN Club member "Christner" who turned out to be a key connecting figure: this is a classic example of why FAN Club research matters, and why FAN Club members should be first-class tracked entities in this app -- not just names mentioned in research notes.

---

### Video 28: Roberta Estes Explains NEW Updates for Mitochondrial DNA (mtDNA)

**Note:** This is a Genealogy TV / Connie Knox production confirmed. Likely in GTV's DNA playlist rather than the Ancestry.com Tips & Tricks playlist specifically. Documented here because it directly informs Module 14 (DNA Evidence Tracker) architecture.

**Workflow covered:**

A 74-minute deep dive into mitochondrial DNA with expert Roberta Estes (DNA-explained.com), covering the Million Mito Project's 2025 overhaul of the global haplogroup tree and what it means for genealogical research.

**What mtDNA is:**
- Inherited exclusively from your mother, in an unbroken matrilineal chain back to "Mitochondrial Eve"
- Unlike autosomal DNA (which mixes from both parents), mtDNA traces ONE specific line: direct maternal line
- Haplogroups = named branches on the global human maternal family tree; mutations define each branch
- FamilyTreeDNA is the ONLY major consumer company offering mtDNA testing (not Ancestry, 23andMe, or MyHeritage)

**The Million Mito Project:**
- PhyloTree (global reference tree) last updated 2016 by a single researcher; deemed unsustainable
- Roberta Estes proposed rebuilding it using FTDNA's database at RootsTech 2020; Ben Greenspan agreed
- Team had to reverse-engineer PhyloTree to reproduce its results before advancing it
- A previously undocumented new lineage Out of Africa was discovered mid-project -- shifted the entire tree structure
- Some unstable mutations had to be reclassified (not reliable enough to define haplogroup boundaries)
- Result: 15 new reports in the FTDNA Discover tab, released ~early 2025

**Key new features in FTDNA Discover:**
- Haplogroup Story: where/when formed, how many tested descendants, other branches
- Country Frequency: which countries have people with your haplogroup (percentages of FTDNA testers, not population)
- Notable Connections: famous/historical figures sharing your haplogroup (including, always, a Neanderthal ancestor ~379,000 years ago)
- Migration Map: animated route Out of Africa to present geographic concentrations; ancient DNA burial sites marked
- Ancient Connections: links haplogroup to specific archaeological burial sites; arranged most-recent to oldest; used by Roberta to narrow down which French village an Acadian ancestor came from (closest burial 9km from target village)
- Haplotype Clusters: NEW concept -- groups people sharing the exact same mutation pattern even when not yet named as a new haplogroup branch; reduced one tester's 47 matches to 3 actionable ones

**The four-legged stool framework (Roberta Estes):**
- Y-DNA -- traces the direct paternal line; correlates with surnames
- Mitochondrial DNA (mtDNA) -- traces the direct maternal line
- Autosomal DNA -- whole-family cousin-finding; mixes from both parents; doesn't identify specific lines
- Records research -- traditional paper-trail genealogy
"No single leg is sufficient alone." All four work together.

**mtDNA as a "puddle jumper":**
- When records in the country of origin have been destroyed (as happened for many German villages in the Thirty Years' War, and as happened for many Jewish communities in Eastern Europe), mtDNA matching connects you to researchers in the country of origin who have the records you're missing
- Roberta's case: Strong Scandinavian matches despite known German family; Swedish army passed through the German village during the Thirty Years' War, leaving behind mixed-ancestry children; the mtDNA evidence revealed a pre-records-era connection invisible to paper genealogy

**Practical case study:**
- Roberta narrowed down which of two French villages an Acadian ancestor came from using Ancient Connections: the closest ancient burial was 9 km from the rumored village of origin -- evidence, not proof, guiding further records research

**Design signals:**

Module 14 (DNA Evidence Tracker) currently handles autosomal DNA. This video establishes that a complete DNA evidence picture requires all three DNA types, each with a distinct data model:
- Autosomal: cM values, match list, four-quadrant grouping, BKM designation
- Y-DNA: haplogroup, FTDNA kit, paternal line ancestor, surname correlation
- mtDNA: haplogroup, FTDNA kit, matrilineal line ancestor, haplotype cluster assignment

A future version of Module 14 should handle all three types distinctly. FTDNA-specific data (haplogroup, Discover reports, cluster assignments) is meaningfully different from AncestryDNA data.

The four-legged stool framing is the right mental model for this app's integration of DNA with records research. The modules are not separate tracks -- they are legs of one stool. DNA evidence leads to records research which surfaces new people who become FAN Club candidates who generate more DNA leads. The app should present this as a cycle, not as separate tools.

The "puddle jumper" concept is directly relevant to the Ashkenazi Jewish research context. When European Jewish records were destroyed in the Holocaust and in earlier pogroms, mtDNA and Y-DNA may be the only bridges to pre-immigration origins. Module 14 should be designed with this use case in mind, not just as a cousin-matching tool for American tree research.

Ancient DNA connections to archaeological burial sites is a future dimension the app doesn't need to implement now, but the concept -- that a haplogroup connects you to specific historical people in specific places at specific times -- is adjacent to the address-as-search-key and historical-context principles already in AGENT.md.

---

### Video 29: Ancestry Power Plan -- Search Strategies That Work! (Partial)

**Note:** Partial documentation only -- companion article text, no full transcript. Published April 17, 2025 (livestream). Full transcript needed for Batch 7.

**What is known from article:**
Five methods covered:
1. Card Catalog deep dive (reinforces Video 2)
2. Searching neighbors and townships when direct name search fails
3. Excel filtering for census data (reinforces Videos 9/10/13)
4. Verifying ancestors prior to 1850: non-population census schedules, land records, church records
5. What to do when the Ancestry search engine fails: browse image sets directly via Card Catalog

**Design signals (from partial data):**
- "When the search engine fails, browse image sets directly" is a research strategy this app's Document Analysis Worksheet enables: even if Ancestry's index misses someone, the researcher can pull the image directly and run it through the AI pipeline. Directly relevant to the 3,752 unanalyzed media files.
- Pre-1850 verification strategies (non-population schedules, land records, church records) are source types the Research Plan Builder should be aware of and prompt for when researching ancestors in that era.

---

## Pending

- Batch 7: Video 29 full transcript (Ancestry Power Plan), Video 27 slot replacement, September-October 2025 gap investigation, 2026 videos not yet documented

---

## Synthesis Checklist (complete after all batches)

- [ ] All batches received and appended
- [ ] Cross-batch themes identified
- [ ] Design implications written into app-design-exploration.md
- [ ] connie-knox-workflow-notes.md marked COMPLETE
