# Changelog

All notable changes to Project-G-Live are recorded here.
Format: TIMESTAMP | Session | Change

---

## 2026-05-10 03:25 UTC -- Session: Phase 3 BUILD (Citation Builder)

- sql/001-create-tables.sql -- All 9 Supabase tables with RLS policies
- src/types/index.ts -- Entity interfaces (Source, Person, CaseStudy, CaseStudySource, etc.)
- src/app/citation-builder/page.tsx -- Source library with search and filter
- src/app/citation-builder/new/page.tsx -- 5-step structured source interview (11 categories)
- src/app/citation-builder/[id]/page.tsx -- Source detail with copy and edit
- src/app/api/citation-builder/route.ts -- GET list + POST create (GPS validated)
- src/app/api/citation-builder/[id]/route.ts -- GET + PATCH + DELETE
- Module 4 (Citation Builder): COMPLETE

---

## 2026-05-09 17:38 UTC -- Session: Phase 3 BUILD (Case Study Builder)

- sql/002-add-res-checklist.sql -- RES checklist table, gps_stage_reached constraint expanded to 6
- src/app/api/case-study/route.ts -- GET list + POST create
- src/app/api/case-study/[id]/route.ts -- GET + PATCH + DELETE
- src/app/api/case-study/[id]/sources/route.ts -- GET + POST (with joined source data)
- src/app/api/case-study/[id]/sources/[sourceId]/route.ts -- PATCH + DELETE
- src/app/api/case-study/[id]/evidence/route.ts -- GET + POST
- src/app/api/case-study/[id]/evidence/[linkId]/route.ts -- PATCH + DELETE
- src/app/api/case-study/[id]/res-checklist/route.ts -- GET + POST
- src/app/api/case-study/[id]/res-checklist/[itemId]/route.ts -- PATCH + DELETE
- src/app/api/case-study/[id]/conflicts/route.ts -- GET + POST
- src/app/api/case-study/[id]/conflicts/[conflictId]/route.ts -- PATCH + DELETE
- src/app/api/case-study/[id]/proof/route.ts -- GET paragraphs + footnotes, POST both
- src/app/api/case-study/[id]/proof/[paragraphId]/route.ts -- PATCH + DELETE
- src/components/case-study/StageNav.tsx -- 6-stage navigator
- src/components/case-study/Stage1ResearchQuestion.tsx
- src/components/case-study/Stage2SourceInventory.tsx
- src/components/case-study/Stage3EvidenceChain.tsx
- src/components/case-study/Stage4SearchChecklist.tsx -- Reasonably Exhaustive Search Checklist
- src/components/case-study/Stage5ConflictAnalysis.tsx
- src/components/case-study/Stage6ProofArgument.tsx -- Edit + Preview modes, [FN1] rendering
- src/app/case-study/page.tsx -- Live list page (replaces stub)
- src/app/case-study/new/page.tsx -- New case study form
- src/app/case-study/[id]/page.tsx -- Full 6-stage builder (replaces stub)
- Module 10 (Case Study Builder): COMPLETE (pending Supabase provisioning and smoke test)
- Note: 6 stages, not 5 -- RES Checklist inserted between Evidence Chain and Conflict Analysis
