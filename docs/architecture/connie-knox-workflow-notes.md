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

### Video 8: Ancestry Networks (2025)

**Ancestry workflows covered:**
- Networks = automated DNA match clustering (automated Leeds Method)
- Each cluster = one ancestral couple's descendants, grouped by shared DNA patterns
- No tree required (unlike ThruLines) -- works from DNA patterns alone
- Workflow: click network -> sort by closest matches -> check trees of top 3-5 -> find repeating surnames + geographic overlap -> cross-reference with own tree
- Custom naming of clusters
- Filtering within clusters: matches with trees + closest DNA = highest-value leads
- ThruLines vs. Networks: ThruLines confirms known connections; Networks discovers unknown ones

**Design signals:**
- Module 14 (DNA Evidence Tracker) is the existing DNA layer. It does not currently interface with Networks-style clustering. This is a future capability, not a current gap -- but worth noting that researchers will arrive at this app having already worked through Networks on Ancestry and will want to bring those cluster labels and findings in.
- The Networks workflow produces family cluster labels (e.g., "Paternal Johnson/Smith Line") that are essentially research hypotheses about which ancestor a match group traces to. These are floating tree equivalents in the DNA space. A future enhancement: the DNA Evidence Tracker could let researchers record a cluster label + the probable ancestral couple it points to.
- The ThruLines vs. Networks distinction is useful mental model documentation for Module 14. ThruLines = confirmation; Networks = discovery. This app's DNA module should be framed around the same distinction.

---

## Pending Batches

- Batch 2+: not yet received

---

## Synthesis Checklist (complete after all batches)

- [ ] All batches received and appended
- [ ] Cross-batch themes identified
- [ ] Design implications written into app-design-exploration.md
- [ ] connie-knox-workflow-notes.md marked COMPLETE
