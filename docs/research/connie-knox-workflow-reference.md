# Connie Knox -- Workflow Reference

TIMESTAMP established: 2026-05-14 UTC
Source: Genealogy TV (YouTube), GenealogyTV.org, Genealogy TV Academy
Channel: https://www.youtube.com/@GenealogyTV

Connie Knox is the single best external reference for research workflow design on this project.
She is a trained journalist, video producer, and former TV news director with 47+ years as a genealogist.
Her methodology is GPS-literate without being jargon-heavy. She teaches by doing.
Every workaround she has invented exists because Ancestry does not give her the infrastructure she needs.
This platform can be that infrastructure.

STANDING RULE: Before designing any feature that touches research workflow, ask Dave to pull
relevant Connie Knox video transcripts via Perplexity. She may have already solved the UX problem.

---

## The Knox Research Notes Method

Source: "Research Notes Updated for 2026" (Nov 2025), "Organize Family History Records into
Genealogy Research Notes" (Feb 2025 -- unedited real-time session, highly recommended)

Research Notes are NOT the Research Log. Critical distinction:
  Research Log (Module 3) -- what you searched for and when.
  Research Notes -- what you FOUND and what it means. One document per person.

Format:
- Living Word document (or Google Doc), one per ancestor
- Strict chronological order -- bold the date and item type at the start of each entry
- Narrative description abstracting key details from each record
- Footnoted source citation after every entry (footnotes, not endnotes -- they travel with paragraphs)
- Red font for gaps and to-do items: "1840 census not found after reasonably exhaustive research"
  Red items are the active research plan. Delete when resolved.
- Include your own hypotheses and reasoning inline so you know your logic when you return months later
- Negative evidence documented in red: searched [record set], found nothing. GPS-valid finding.
  Prevents re-searching the same records repeatedly.

Who gets Research Notes:
- All direct-line ancestors, even married couples get SEPARATE documents
- Collateral relatives when hitting a brick wall
- DNA research subjects
- FAN Club floaters who appear repeatedly

File naming convention: leading "1" so notes sort to top. "1 KLEIN Aaron Research Notes"
Wives filed under maiden name, not husband's surname.

Privacy: Research notes stay private and offline -- always in flux, never uploaded publicly.
Hyperlinks to Ancestry, FamilySearch, WikiTree profiles embedded for quick navigation.

Claude for citations: Screenshot record + URL bar, paste into Claude with instruction to generate
Evidence Explained citation. Correct minor errors. Paste into Word as footnote.

---

## The Knox Emoji Research Status System

Source: "Ancestry Profile Makeover" (July 26, 2024)
Video: https://youtu.be/1zINpnhgicA

Connie places emojis in the suffix field of Ancestry profiles to visually flag research status.
This is a workaround -- this platform can implement this as a real data field.

Four states:
  ✅  Research complete
  🔵  Work in progress
  🟧  Not yet started (orange square -- visible without being alarming)
  📖  Needs in-person archive or library visit (blocked, specific action required)

This platform adds a fifth state (auto-detected, not manually assigned):
  ⚠️  Has active conflicts (GPS conflict detected on one or more facts)

The emoji/color system should be consistent across ALL modules and the persons list.
If a status means something on the person page, it means the same thing everywhere.

---

## The Knox Trifecta Strategy

Source: "Genealogy Master Plan 2025" (Feb 2025)

Connie's framework for maximizing search results. 3x3x3 structure:
  3 platforms: Ancestry, FamilySearch, + one logical third (state archives, courthouse, local library)
  3 search types: follow hints / search from profile / targeted card catalog or wiki search
  3 criteria: by name / by place without name / by time and historical context

Goal: force the researcher out of comfort zone and find records others miss.
Maps directly onto the Research Plan Builder (Module 2) AI strategy generation.

---

## The Knox Master Plan Steps

Source: "Genealogy Master Plan 2025" (Feb 2025)

1. Create a research question (one ancestor, one branch at a time)
2. Gather and organize all records already found
3. Start research notes -- identify what's missing in red
4. Execute targeted research using the Trifecta Strategy
5. Evaluate each record (index, copy, or original?)
6. Correlate the evidence across multiple records
7. Resolve conflicts and reach a conclusion
8. Rinse and repeat for the next ancestor

Maps onto: Research Plan Builder (Module 2), Research Investigation (Module 16),
Case Study Builder (Module 10), Source Conflict Resolver (Module 6).

---

## The Knox FAN Club Strategy

Sources:
  "What is F.A.N. Club Research?" (Oct 2020) https://www.youtube.com/watch?v=pXODnErWXFw
  "Tracking Ancestors FAN Club Worksheet" (Nov 2023)
  "FAN Club Updates & Ancestry Networks" (Aug 2025) https://www.youtube.com/watch?v=VT56z8JuvUI

FAN Club = Friends, Associates, and Neighbors. Term coined by Elizabeth Shown Mills.
Also called cluster research. Core principle: researching the community around an ancestor
resolves brick walls that name-search cannot.

Key insight: people who appear repeatedly across DIFFERENT types of records
(not just the same record set) are the highest-priority leads.

Floater method (Connie's workaround in Ancestry):
1. Briefly connect a FAN Club member to your tree
2. Immediately disconnect them so they float independently
3. Assign a custom tree tag ("Floating Tree") so they can be filtered
4. Add them to the relevant Ancestry Network

This platform has the associations table (migration 012) -- a proper data layer for this.
The associations table is already ahead of Ancestry Networks architecturally.

Record types that produce great FAN Club leads:
- Census neighborhood extractions
- Passenger lists (travel companions)
- Wedding registries with attendee addresses
- Obituaries and newspaper articles
- Land records naming bordering neighbors
- Military unit rosters and POW journals
- Wills and probate inventory buyers lists
  ("all those people buying shoes and plows at the estate sale are the FAN Club")

AI for FAN Club correlation (2025 method):
Export census neighbor data into Excel across multiple years, paste both into Claude/ChatGPT
with prompt: "Cross-reference all people who appear in both sets of records and create a table
showing people with the same or similar names in all records, referencing the original source."
AI returns a filterable table showing connections across census years.

Ancestry Networks (ProTools beta, 2025):
Ancestry's first formal acknowledgment that FAN Club is real. Allows named clusters of people
from inside or outside your tree. Cross-pollination feature requested but not yet built:
combine two networks and auto-generate a third of people appearing in both.
Our associations table is already ahead of this architecturally.

---

## Lucidchart Use Cases for This Platform

Source: Genealogy TV Lucidchart PDF guide (May 2023)
https://genealogytv.org/wp-content/uploads/2023/05/How-to-use-Lucid-Chart-for-Genealogy.pdf

Lucidchart is a free web-based diagramming tool. Free plan: unlimited diagrams, 60 objects each.
Connie uses it for FAN Club community mapping, DNA descendancy charts, and research trip planning.

Five places this platform should use or reference Lucidchart patterns:

1. FAN Club Mapper (Module 8)
   Target ancestor in center. FAN Club members arranged around them.
   Colored connector lines by record type (census neighbor, land deed, church record, etc.).
   This is the visual target for Module 8 design.

2. DNA Evidence Tracker (Module 14 / future enhancement)
   Descendancy chart with common ancestor pair at top, all descendants below.
   Color-code confirmed DNA matches. Include shared cM amount in each box.
   Standard format for genetic genealogy client reports.

3. Case Study Builder (Module 10) -- PowerPoint export
   Lucidchart-style evidence chain diagrams exported as slides.
   Visual proof arguments for client presentations and BCG submissions.

4. Research Plan Builder (Module 2)
   Visual research trip planning: locations, archives, courthouses.
   Records to access at each location. Shareable visual itinerary.

5. Person Detail Page
   Future: mini community map embedded on the person page.
   FAN Club members visible spatially, not just as a list.

Key design patterns from Lucidchart genealogy use:
- Color gradients on shapes to represent migration between countries/regions
- Sticky notes for uncertainties without cluttering chart shapes
- Common ancestor box should be as wide as all descendants below it
- Colored boxes for DNA matches vs non-matching family members

---

## The Knox Profile Makeover Workflow

Source: "Ancestry Profile Makeover" (July 26, 2024)

A structured cleanup process for any ancestor profile. In order:
1. Set "Actively Researching" and "Left Off Here" tags
2. Review all facts -- remove true duplicates, keep legitimate alternate names and variant dates
3. Review all sources -- remove member tree sources, OneWorldTree sources, duplicate images
4. Correct source-to-fact associations (wrong fact linked to wrong source)
5. Review hints -- ignore member trees until the very end to avoid bias
6. Review DNA -- last resort only; DNA match trees are unreliable
7. Identify gaps -- document in red as active research plan
8. Remove "Left Off Here" tag when done; set research status emoji

Key GPS-aligned rules:
- Member trees: never trust, never import early, look at their GALLERIES for document images
- DNA: scientifically valid between you and a match; their TREES are not reliable
- OneWorldTree sources: always useless, remove them
- Death certificates of children naming the ancestor as parent: KEEP -- confirm relationships

---

## Videos to Pull for Specific Design Work

When designing the person detail page research notes panel:
  Pull: "Research Notes Updated for 2026" (Nov 2025) -- already have
  Pull: "Organize Family History Records into Research Notes" (Feb 2025) -- already have

When designing the FAN Club Mapper (Module 8):
  Pull: "FAN Club Updates & Ancestry Networks" (Aug 2025) -- already have
  Pull: "What is F.A.N. Club Research?" (Oct 2020) -- already have

When designing the Case Study Builder PowerPoint export:
  Pull: Any Lucidchart video showing DNA descendancy chart construction

When designing the Research Plan Builder enhancements:
  Pull: "Genealogy Master Plan 2025" (Feb 2025) -- already have

When designing any AI-assisted citation or document analysis feature:
  Search: Connie Knox Claude AI source citation Evidence Explained
  (No dedicated video confirmed yet -- ask Dave to search)

When designing conflict resolution UI:
  Search: Genealogy TV conflicting evidence preferred facts resolution
  (No dedicated video confirmed yet -- ask Dave to search)
