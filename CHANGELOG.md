# Changelog

All significant changes to Project-G-Live. Most recent first.
Format: TIMESTAMP | Version | Summary

---

## 2026-05-10 03:30 UTC | v2.2.0

Citation Builder (Module 4) -- complete.

- sql/001-create-tables.sql: Full schema migration for all 9 Supabase tables
  (persons, sources, case_studies, case_study_sources, evidence_chain_links,
  conflicts, proof_paragraphs, footnote_definitions, citations).
  Row Level Security enabled on all tables. Policies allow all authenticated ops.

- src/types/index.ts: Entity interfaces (Source, Person, CaseStudy,
  CaseStudySource, EvidenceChainLink, Conflict, ProofParagraph,
  FootnoteDefinition, Citation). GPS classification types re-exported
  from @/lib/supabase. SourceCategory type for interview UI.

- src/app/citation-builder/page.tsx: Source library. Search across label
  and citation text. Filter by source type. Error state explains Supabase
  setup steps. Empty state with CTA.

- src/app/citation-builder/new/page.tsx: Five-step structured interview.
  Step 1: category selector (11 source types with icons and descriptions).
  Step 2: type-specific field forms (vital record, census, passenger manifest,
  naturalization, land/deed, probate, newspaper, photograph, database, website,
  other). Step 3: GPS classification (source type, info type, evidence type)
  with full plain-English explanations inline for each option. Step 4: EE
  citation entry (label, full citation, short reference note, optional
  identifiers). Step 5: review and save.

- src/app/citation-builder/[id]/page.tsx: Source detail view. GPS badges.
  Copy-to-clipboard for both citation forms. Inline edit mode.

- src/app/api/citation-builder/route.ts: GET (list all sources, ordered by
  created_at desc) + POST (create source). Server-side GPS vocabulary
  validation on all three classification fields.

- src/app/api/citation-builder/[id]/route.ts: GET (single source) +
  PATCH (update, with field allowlist and GPS enforcement) + DELETE.

## 2026-05-10 02:55 UTC | v2.1.0

Phase 3 scaffold + architecture expansion.

- docs/architecture.md: Expanded to column-level schema. All Case Study
  Builder tables fully specified. Derived from prototype JS data structures.

- Full Next.js 15 / React 19 App Router scaffold committed:
  package.json, next.config.ts, tsconfig.json, tailwind.config.ts,
  postcss.config.js, .env.local.example, .gitignore,
  src/app/globals.css (full CSS variable system matching prototype),
  src/app/layout.tsx, src/app/page.tsx (dashboard),
  src/app/case-study/page.tsx (list stub),
  src/app/case-study/[id]/page.tsx (detail stub),
  src/lib/supabase.ts (browser + server clients, GPS type aliases),
  src/lib/ai.ts (Claude API wrapper, GPS enforcement prompt, engine router stub).

- AGENT.md v2.1.0: Phase 3 marked ACTIVE. Prototype accurately described
  as fully functional. Schema-as-blocker framing removed.
