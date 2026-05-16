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
- Private member tree search; Card Catalog filtered by location + era; All Hints aggregated view; "who saved this record" reversal; DNA animated ethnicity timeline

**Design signals:**
- People hub filtered/browsed by surname family group = All Hints filtered-by-surname equivalent.
- Research Plan Builder should support "what records exist for this location and era" as a planning question.

---

### Video 2: Card Catalog -- 5 Pro Tricks

**Ancestry workflows covered:**
- Location filter to county level; era filter; category filter; keyword search on collection titles; "Learn More" before searching

**Design signals:**
- Research Plan Builder needs a "what collections are available for this location/era" field.
- Source records could carry a "collection notes" field for known coverage limitations.

---

### Video 3: Fixing Mistakes on Ancestry Trees

**Ancestry workflows covered:**
- Identifying errors; editing facts with source + note; detaching records; separating merged identities; dismissing hints; correction trail

**Design signals:**
- Correction note = assertion. Not just "X is true" but "X is true because of Y, here is the reasoning."
- UI language distinction: "remove this source from this person" vs. "delete this source entirely."

---

### Videos 4 and 5: Floating Trees and Connecting Them

**Design signals:**
- Floating tree = Module 16 candidate person concept. Status field should make this visible at a glance.
- Naming convention hacks ([RESEARCH], [UNVERIFIED]) are a missing-status-field workaround. This app has the real field.

---

### Video 6: Emoji Markers

**Design signals:**
- Clearest signal Ancestry lacks a research status system. This app's research_status field replaces all hacks.
- Status vocabulary: Confirmed, In Progress, Brick Wall, Uncertain, Candidate, DNA Linked.
- Visible on person page AND filterable in People hub.

---

### Video 7: Ancestry Profile Makeover

**Design signals:**
- person_research_notes framing: "write for a family history book" not "notes dump."
- Fact-level sourcing health not yet surfaced on person detail page.
- Media gallery not yet built. Residence timeline should be a life-movement view, not a flat list.
- Validates 87.6% source-wiring quality concern.

---

### Video 8: Ancestry Networks -- initial coverage

**Design signals:**
- See Videos 9/10 and 16 for full scope. Networks is far broader than DNA alone.
- ThruLines = confirmation; Networks = discovery. Informs Module 14.

---

## Batch 2 -- Videos 9-14

Source file: GenealogyTV_Batch2_Videos9-14.md

---

### Videos 9 and 10: FAN Club + Ancestry Networks Full Coverage

**Key signals:**
- FAN Club record sources: passenger lists, census neighborhoods (5-10 pages each direction), obituaries, land records (adjoining owners), military journals, probate inventories (estate sale buyer lists)
- Census-to-Excel pipeline = workflow this app eliminates natively via FAN Club Mapper query.
- DNA match lists = digital FAN Club. Bridge between Module 14 and Module 8.
- Probate buyer lists are a Document Analysis Worksheet target.

---

### Video 11: Custom Clusters (Pro Tools)

**Key signals:**
- Paywalled capability this app offers free: manually define DNA family groups with anchor matches.
- DNA Evidence Tracker should capture cM value and allow filtering by range.

---

### Video 12: RootsTech 2026 New Features

**Key signals:**
- Ancestry building AI document analysis (Photo Insights, full transcription): this app's version produces GPS-compliant structured assertions, not self-contradicting paragraphs.
- Person profile page redesign coming: design for what Ancestry will never do.
- Ancestry Preserve: physical archive digitization makes Media-as-Unanalyzed-Evidence more urgent.
- Fold3 full-text search validates address-as-search-key principle.

---

### Video 13: 10 Best Tips Part 1

**Key signals:**
- FAN Club Mapper query replaces census extraction workflow.
- SSACI mother's maiden name valuable for Ashkenazi Jewish research.
- Narrative Assistant should situate ancestors in historical context, not just describe their facts.

---

### Video 14: 10 Best Tips Part 2

**Key signals:**
- People hub: floating/candidate persons visually distinct but accessible.
- Deduplication guard on add-person: baseline feature, not a Pro Tools upgrade.
- 3-monitor workflow: design this app for parallel use alongside Ancestry and FamilySearch.
- Research Plan Builder: prompt "have you checked what records exist for this location/era?"

---

## Batch 3 -- Videos 15-16

---

### Video 15: New Ancestry Updates February 2025

**Key signals:**
- AI record summary contradiction = validates GPS-compliant extraction. UI language: "extracted facts" not "AI summary."
- "Also Known As" does NOT feed search (Ancestry staff confirmed). Audit FTM-imported alt_names.
- 1,000-record export cap on Ancestry: this app imposes no such limit.
- Duplicate merge requires Pro Tools: deduplication guard is baseline here.

---

### Video 16: Ancestry Networks Extended Deep Dive

**Key signals:**
- Full network type taxonomy = design vocabulary for Module 8 (FAN Club Mapper).
- Cross-network filtering: Ancestry cannot do this. This app can (SQL set intersection). Unique differentiator.
- Tags + Networks are complementary layers: per-person status marker AND group container with sources.

---

## Batch 4 -- Videos 17-21

Data quality: All five videos full transcripts.

---

### Video 17: Research Notes Updated for 2026

**Key signals:**
- Knox Research Notes Method = person_research_notes in this app, but with structure a plain text field cannot match: chronological by event date, inline footnote citations, negative evidence as first-class entry (red text), to-do items in the chronological flow, hyperlinks to other profiles.
- "Typing forces attention to details that break down brick walls" -- the act of structured writing is the mechanism, not just the document it produces.
- NOT a Research Log -- third independent signal validating this app's architecture.
- Who gets notes: direct line always; collateral when brick wall requires family cluster. Each couple member gets a SEPARATE file.
- People hub research queue (status = In Progress) manages multiple simultaneous notes documents.

---

### Video 18: New Workflow for 2026 -- Cloud Archive

**Key signals:**
- Researcher's 280+ GB genealogy archive (15,000+ files) lives in cloud-synced OneDrive. This app pulls from the archive on demand.
- Working access (OneDrive) ≠ disaster recovery backup (Backblaze). This app's role is neither -- it is the analysis layer.
- Mobile/cross-device accessibility relevant to Vercel deployment and design for any-device use.

---

### Video 19: New AncestryDNA Tree Feature

**Key signals:**
- DNA evidence wanted in family tree context, not in a separate tab. Person Detail page should surface DNA evidence alongside timeline and family structure.
- "Matches descended through which child" = branching visualization; person page should show which children are ancestors of known DNA matches.
- DNA evidence = leads, not facts, until documented with records.

---

### Video 20: Social Security Records Updated 2025

**Key signals:**
- Four distinct SS record types (SSDI, Claims Index, Numident, SS-5) each provide different evidence. Source taxonomy should distinguish them.
- SS number = storable field on person record; unique cross-reference identifier.
- Numident file (FamilySearch only) is the richest source; most researchers don't know it exists. Research Plan Builder should prompt for it.
- SSACI mother's maiden name: especially valuable for Ashkenazi Jewish research.

---

### Video 21: Find a Grave Tricks and Transfers

**Key signals:**
- Cemetery surname search = FAN Club Mapper principle applied to burial locations; timeline_events filtered by burial + location could power similar query.
- Virtual Cemeteries = FAN Club networks by burial place; maps to "Burial Place" network type in Module 8.
- Find a Grave data = authored work of unknown reliability; source quality flag needed if imported.

---

## Batch 5 -- Videos 22-25

Source file: batch 5 document (full transcripts all four videos)
Data quality: All four videos full transcripts. High confidence throughout.
Focus: DNA tools and strategy -- Auto Clustering, DNA fundamentals, manual grouping, Master Class.

---

### Video 22: Ancestry's NEW DNA Matches by Cluster (Auto Clustering)

**Ancestry workflow covered:**
- ProTools-only feature: By Cluster tab in DNA Matches
- Cluster chart: same match names across top row and left column; colored intersections = shared genetic connection between that pair
- Hover over intersection: see two people's names, predicted relationship to each other (not just to you), existing notes/group labels
- Dark box = shared match; gray box = match appears in multiple clusters (pedigree collapse or endogamy, NOT a problem); red-bordered = flagged multi-cluster
- Each cluster represents descendants of one great-grandparent couple
- Goal: four clusters, one per grandparent, anchored at great-grandparent couple level
- "Count the G's": 2 G's = great-grandparent = second cousins; 3 G's = great-great-grandparent = third cousins
- Maternal/paternal filter within cluster view to split by parent side
- Cluster size reflects number of testers from that branch, not closeness of relationship
- Screenshot to PowerPoint/document for annotation workflow

**Design signals:**
- The four-cluster model (one per grandparent, anchored at great-grandparent couples) should be the organizing framework for the DNA Evidence Tracker. Not a flat list of matches, but a four-quadrant view where every match is assigned to one of the four grandparent lines.
- Gray boxes (multi-cluster matches) are normal and expected in endogamous research (Ashkenazi Jewish). The DNA Evidence Tracker must handle a match belonging to multiple family groups without treating it as an error.
- "Relationship between two matches" (not just each match to you) is information the ProTools hover reveals. This app could store pairwise relationship notes between DNA matches -- a richer data model than just "this match is on my grandmother's side."
- Annotation workflow (screenshot to PowerPoint): this is another manual workaround this app can replace with a structured cluster labeling interface.

---

### Video 23: Thinking About DNA (GTV Podcast)

**Ancestry workflow covered:**
- Three DNA types: Y-DNA (paternal line, surname), mtDNA (maternal line, less used), autosomal (whole family, "shotgun blast")
- Autosomal: ~50% from each parent; you do NOT inherit the other 50-75% -- distant relatives may not appear
- Ancestry has largest database; cannot upload TO Ancestry but can download and upload elsewhere
- Strategy sequence: filter by parent side first, search by surname, color group by great-grandparent couple, floating tree for mystery matches
- Missing parentage (Knox prefers "missing parent"): group all known matches to known grandparent; leftovers on same side = mystery branch (credited to Diahan Southard)
- Y-DNA example: Knox's great-uncle's test revealed "Davis" as an entirely unknown paternal branch -- all four Y-DNA matches shared that surname
- Networks: completely private, cannot add from DNA match list directly (confirmed at time of recording)
- Do not use DNA alone -- always combine with traditional documentary research

**Design signals:**
- The "leftovers" strategy is an inverse methodology: assign the knowns, and what remains unassigned on a parent side is likely from the mystery branch. The DNA Evidence Tracker should show "unassigned matches" as a distinct visible category -- not hidden, but surfaced as the research target.
- Y-DNA test revealing a completely unknown branch is a discovery breakthrough event. The DNA Evidence Tracker should be able to record significant discovery moments -- not just cM values, but "this test revealed the Davis branch which was previously entirely unknown." That's narrative-level information that belongs in the research notes layer.
- Ancestry cuts off matches below 6-8 cM (false positive rate exceeds 50%). Knox personally doesn't work below ~20-40 cM unless the database is small. The DNA Evidence Tracker should let the researcher set and save a working cM threshold.
- "Don't chase every match -- define a research question first" is the same principle as the Research Plan Builder's role: clarify the question before searching.

---

### Video 24: Grouping DNA Matches on Ancestry (Podcast -- Live Demo)

**Ancestry workflow covered (detailed step-by-step):**
- By Parent tab: always first filter; Ancestry now auto-splits maternal/paternal (old manually-labeled groups are stale -- new testers since you made them won't appear)
- Best Known Match (BKM): find in second cousin range (~200-350 cM); must descend from ONE great-grandparent couple only; first cousin once removed works only if a generation older than you (their parent = your grandparent's sibling); do NOT use child of a first cousin; do NOT use first cousins (they descend from both of your grandparents on that side)
- Create group: click + button next to BKM, Add to Group, Create Group, name after ancestral couple, assign color from Knox chart
- Shared Matches: click into BKM profile, click Shared Matches tab, see everyone who shares DNA with both you and BKM
- Gray checkboxes on left side of shared matches list (easy to miss) -- check boxes for everyone to add, select group from right panel, click Add to Group
- Must repeat for each page of shared matches (no "Check All" button -- Knox frustrated by this)
- Knox color chart: warm colors (reds, oranges, yellows) = maternal; cool colors (blues, purples, greens) = paternal; one color per great-grandparent couple
- Repeat for second maternal grandparent; remaining ungrouped matches on maternal side = likely mystery branch
- ProTools shared matches tool: shows relationship BETWEEN any two matches (not just each to you) -- significantly more powerful for triangulation
- Pedigree collapse: cousins who marry create descendants who appear in multiple groups -- expected, not an error; Knox's own great-grandparents were second cousins

**Design signals:**
- The BKM concept is the anchor of the entire grouping methodology. The DNA Evidence Tracker should support designating specific matches as BKMs for specific lines, with the ancestral couple they anchor noted alongside.
- "Old manually-labeled groups are stale" is a UX warning: when Ancestry changed their auto-split feature, years of manual labeling became incorrect. This app should avoid creating data structures that become stale when external systems change. DNA grouping should be based on the person record connection, not on platform-specific labels.
- No "Check All" button (Knox's frustration): this app's equivalent bulk-add to group should have proper selection controls from the start.
- Pairwise relationship data (ProTools shows relationship between two matches): this is a more powerful data model. The DNA Evidence Tracker could eventually store "Match A and Match B are third cousins to each other" -- enabling triangulation even without ProTools.
- Warm/cool color scheme for maternal/paternal is a strong visual design pattern. The People hub and DNA Evidence Tracker both benefit from consistent color assignment by grandparent line.

---

### Video 25: AncestryDNA Master Class 2025 (55 minutes)

**Most comprehensive single DNA tutorial produced by Knox. Two chapters.**

**Chapter 1: Origins, Journeys, Chromosome Painter**

Ethnicity estimates / Origins:
- Split by parent to isolate which side carries which regional DNA
- Estimates change as reference panels are updated -- never build research conclusions on them
- Origins View Timeline (hidden feature): tiny "View Timeline" link easy to miss; shows historical migration context; scroll wheel zooms map; divide by parent; general context only, not proven biography

Journeys:
- Uses DNA matches' trees to show where ancestors lived recently on a map
- Knox finds limited research utility: "I don't find a lot of use in this"

Chromosome Painter:
- Maps ethnicity estimates visually onto 22 chromosome pairs
- **CRITICAL DISTINCTION:** Chromosome Painter ≠ Chromosome Browser
  - Painter: shows ethnicity estimates on chromosomes; informational/decorative; limited research utility
  - Browser (MyHeritage): compares your DNA against specific cousins; shows exact segments inherited from common ancestor; used for triangulation
  - These are fundamentally different tools. Do not confuse them.

**Chapter 2: DNA Match List Mastery**

All available filters:
- By Parent (always first); Hidden Matches; Unviewed/New; Tree type; cM range (custom); Custom Groups; stackable combinations

Surname search:
- Search by SURNAME in match trees, NOT by match name -- finds all matches who have that surname in their linked tree
- Try alternate spellings; click "Similar Surnames" for variants

Match List by Ancestor / ThruLines:
- Shows how many DNA matches you share for each ancestor in your tree
- "Evaluate the Relationships" takes you to ThruLines for that ancestor

Filter by Location Map:
- Shows where DNA matches are geographically located on an interactive map
- Matches concentrated in the same county an ancestor lived in for 200 years = worth investigating
- This is address-as-search-key applied to DNA geography

BKM identification (reinforced and extended from Video 24):
- First cousins: avoid for great-grandparent isolation; they descend from both grandparents on that side
- 1C1R who is a generation older (their parent = your grandparent's sibling): acceptable for great-grandparent level
- "Count the G's" rule: 2 G's = great-grandparent = second cousins

Floating tree workflow (detailed, reinforced and extended from earlier videos):
- Add person attached to anyone, immediately remove all relationships
- Add Custom Tree Tag "Floating Tree" BEFORE leaving the profile
- Find all floaters: Tree View → Filters → Custom Tags → Floating Trees (Knox has three pages of floaters)
- Build out from floater using surnames and people seen in mystery cousins' trees
- DO NOT create a separate tree for floaters -- keep them in the existing tree so DNA tools function correctly when eventually connected
- Home button in tree view toolbar to re-orient after zooming out

Ancestry's statistic: 57% of their users did not know all four grandparents -- the grouping strategy is specifically designed for this population.

ProTools clustering (reinforced from Video 22):
- Clusters and manual groups are complementary -- work both; labeled groups from manual work appear in cluster view
- Identify ancestral couple by knowing which named cousins are in each cluster
- Once labeled, group icons persist across both cluster view and traditional match list

**Design signals:**

The four-quadrant DNA model is the fundamental organizing principle:
- Every DNA match belongs to one of four grandparent lines (or to a mystery/unassigned bucket)
- The DNA Evidence Tracker should present matches organized around this four-quadrant view as its default, not as a flat list
- The mystery bucket ("leftovers") is as important as the assigned quadrants -- it is where the research happens

Chromosome Painter vs. Browser distinction:
- This app should not conflate these in any DNA-related documentation or UI labels
- If this app ever surfaces chromosome-level analysis, it should use precise language: "segment triangulation" (Browser) vs. "ethnicity visualization" (Painter)

Filter by Location Map:
- DNA matches filtered by geographic location is the address-as-search-key principle applied to DNA
- This app could eventually show: "these DNA matches have family roots in the same county as your ancestor" -- a cross-reference between timeline_events location data and DNA match family tree locations

Floating tree scale:
- Knox has THREE PAGES of floaters accumulated over years
- This confirms that the candidate/floating person pool grows large over time
- The People hub must handle 50-100+ candidates gracefully, not just a handful
- The Custom Tree Tag + floating person pattern (confirmed here as the established power-user workflow) maps exactly to this app's research_status = Candidate + tag system

57% of Ancestry users don't know all four grandparents:
- This is a primary use case this app serves, not an edge case
- The four-quadrant DNA model + floating tree candidates + FAN Club research is the standard methodology for solving missing parentage
- The DNA Evidence Tracker, Module 8, Module 16, and the People hub all serve this use case together

"Do NOT create a separate tree for floaters":
- Confirms that in this app, candidates should live in the persons table alongside confirmed tree members
- The boundary is research_status, not table placement
- People hub needs to surface this distinction clearly at scale

---

## Pending

- Batch 6: Videos 26 (Genealogy Master Plan 2025), 27 (Top 5 Updates from 2025), 28 (Roberta Estes mtDNA) and any additional playlist videos

---

## Synthesis Checklist (complete after all batches)

- [ ] All batches received and appended
- [ ] Cross-batch themes identified
- [ ] Design implications written into app-design-exploration.md
- [ ] connie-knox-workflow-notes.md marked COMPLETE
